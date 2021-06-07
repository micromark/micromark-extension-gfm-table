import {factorySpace} from 'micromark-factory-space'
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace
} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'
import {constants} from 'micromark-util-symbol/constants.js'

export const gfmTable = {
  flow: {
    null: {tokenize: tokenizeTable, resolve: resolveTable, interruptible: true}
  }
}

const setextUnderlineMini = {
  tokenize: tokenizeSetextUnderlineMini,
  partial: true
}
const nextPrefixedOrBlank = {
  tokenize: tokenizeNextPrefixedOrBlank,
  partial: true
}

function resolveTable(events, context) {
  let length = events.length
  let index = -1
  let token
  let inHead
  let inDelimiterRow
  let inRow
  let cell
  let content
  let text
  let contentStart
  let contentEnd
  let cellStart

  while (++index < length) {
    token = events[index][1]

    if (inRow) {
      if (token.type === 'temporaryTableCellContent') {
        contentStart = contentStart || index
        contentEnd = index
      }

      if (
        // Combine separate content parts into one.
        (token.type === 'tableCellDivider' || token.type === 'tableRow') &&
        contentEnd
      ) {
        content = {
          type: 'tableContent',
          start: events[contentStart][1].start,
          end: events[contentEnd][1].end
        }
        text = {
          type: 'chunkText',
          start: content.start,
          end: content.end,
          contentType: 'text'
        }

        events.splice(
          contentStart,
          contentEnd - contentStart + 1,
          ['enter', content, context],
          ['enter', text, context],
          ['exit', text, context],
          ['exit', content, context]
        )
        index -= contentEnd - contentStart - 3
        length = events.length
        contentStart = undefined
        contentEnd = undefined
      }
    }

    if (
      events[index][0] === 'exit' &&
      cellStart &&
      cellStart + 1 < index &&
      (token.type === 'tableCellDivider' ||
        (token.type === 'tableRow' &&
          (cellStart + 3 < index ||
            events[cellStart][1].type !== 'whitespace')))
    ) {
      cell = {
        type: inDelimiterRow
          ? 'tableDelimiter'
          : inHead
          ? 'tableHeader'
          : 'tableData',
        start: events[cellStart][1].start,
        end: events[index][1].end
      }
      events.splice(index + (token.type === 'tableCellDivider' ? 1 : 0), 0, [
        'exit',
        cell,
        context
      ])
      events.splice(cellStart, 0, ['enter', cell, context])
      index += 2
      length = events.length
      cellStart = index + 1
    }

    if (token.type === 'tableRow') {
      inRow = events[index][0] === 'enter'

      if (inRow) {
        cellStart = index + 1
      }
    }

    if (token.type === 'tableDelimiterRow') {
      inDelimiterRow = events[index][0] === 'enter'

      if (inDelimiterRow) {
        cellStart = index + 1
      }
    }

    if (token.type === 'tableHead') {
      inHead = events[index][0] === 'enter'
    }
  }

  return events
}

function tokenizeTable(effects, ok, nok) {
  const align = []
  let tableHeaderCount = 0
  let seenDelimiter
  let hasDash

  return start

  function start(code) {
    effects.enter('table')._align = align
    effects.enter('tableHead')
    effects.enter('tableRow')

    // If we start with a pipe, we open a cell marker.
    if (code === codes.verticalBar) {
      return cellDividerHead(code)
    }

    tableHeaderCount++
    effects.enter('temporaryTableCellContent')
    // Can’t be space or eols at the start of a construct, so we’re in a cell.
    return inCellContentHead(code)
  }

  function cellDividerHead(code) {
    // Always a pipe.
    effects.enter('tableCellDivider')
    effects.consume(code)
    effects.exit('tableCellDivider')
    seenDelimiter = true
    return cellBreakHead
  }

  function cellBreakHead(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return atRowEndHead(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceHead
    }

    if (seenDelimiter) {
      seenDelimiter = undefined
      tableHeaderCount++
    }

    if (code === codes.verticalBar) {
      return cellDividerHead(code)
    }

    // Anything else is cell content.
    effects.enter('temporaryTableCellContent')
    return inCellContentHead(code)
  }

  function inWhitespaceHead(code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return inWhitespaceHead
    }

    effects.exit('whitespace')
    return cellBreakHead(code)
  }

  function inCellContentHead(code) {
    // EOF, whitespace, pipe
    if (
      code === codes.eof ||
      code === codes.verticalBar ||
      markdownLineEndingOrSpace(code)
    ) {
      effects.exit('temporaryTableCellContent')
      return cellBreakHead(code)
    }

    effects.consume(code)
    return code === codes.backslash
      ? inCellContentEscapeHead
      : inCellContentHead
  }

  function inCellContentEscapeHead(code) {
    if (code === codes.backslash || code === codes.verticalBar) {
      effects.consume(code)
      return inCellContentHead
    }

    // Anything else.
    return inCellContentHead(code)
  }

  function atRowEndHead(code) {
    if (code === codes.eof) {
      return nok(code)
    }

    effects.exit('tableRow')
    effects.exit('tableHead')

    // Always a line ending.
    effects.enter('lineEnding')
    effects.consume(code)
    effects.exit('lineEnding')

    // If a setext heading, exit.
    return effects.check(
      setextUnderlineMini,
      nok,
      // Support an indent before the delimiter row.
      factorySpace(effects, rowStartDelimiter, 'linePrefix', constants.tabSize)
    )
  }

  function rowStartDelimiter(code) {
    // If there’s another space, or we’re at the EOL/EOF, exit.
    if (code === codes.eof || markdownLineEndingOrSpace(code)) {
      return nok(code)
    }

    effects.enter('tableDelimiterRow')
    return atDelimiterRowBreak(code)
  }

  function atDelimiterRowBreak(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return rowEndDelimiter(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceDelimiter
    }

    if (code === codes.dash) {
      effects.enter('tableDelimiterFiller')
      effects.consume(code)
      hasDash = true
      align.push(null)
      return inFillerDelimiter
    }

    if (code === codes.colon) {
      effects.enter('tableDelimiterAlignment')
      effects.consume(code)
      effects.exit('tableDelimiterAlignment')
      align.push('left')
      return afterLeftAlignment
    }

    // If we start with a pipe, we open a cell marker.
    if (code === codes.verticalBar) {
      effects.enter('tableCellDivider')
      effects.consume(code)
      effects.exit('tableCellDivider')
      return atDelimiterRowBreak
    }

    return nok(code)
  }

  function inWhitespaceDelimiter(code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return inWhitespaceDelimiter
    }

    effects.exit('whitespace')
    return atDelimiterRowBreak(code)
  }

  function inFillerDelimiter(code) {
    if (code === codes.dash) {
      effects.consume(code)
      return inFillerDelimiter
    }

    effects.exit('tableDelimiterFiller')

    if (code === codes.colon) {
      effects.enter('tableDelimiterAlignment')
      effects.consume(code)
      effects.exit('tableDelimiterAlignment')

      align[align.length - 1] =
        align[align.length - 1] === 'left' ? 'center' : 'right'

      return afterRightAlignment
    }

    return atDelimiterRowBreak(code)
  }

  function afterLeftAlignment(code) {
    if (code === codes.dash) {
      effects.enter('tableDelimiterFiller')
      effects.consume(code)
      hasDash = true
      return inFillerDelimiter
    }

    // Anything else is not ok.
    return nok(code)
  }

  function afterRightAlignment(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return rowEndDelimiter(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceDelimiter
    }

    // `|`
    if (code === codes.verticalBar) {
      effects.enter('tableCellDivider')
      effects.consume(code)
      effects.exit('tableCellDivider')
      return atDelimiterRowBreak
    }

    return nok(code)
  }

  function rowEndDelimiter(code) {
    effects.exit('tableDelimiterRow')

    // Exit if there was no dash at all, or if the header cell count is not the
    // delimiter cell count.
    if (!hasDash || tableHeaderCount !== align.length) {
      return nok(code)
    }

    if (code === codes.eof) {
      return tableClose(code)
    }

    return effects.check(nextPrefixedOrBlank, tableClose, tableContinue)(code)
  }

  function tableClose(code) {
    effects.exit('table')
    return ok(code)
  }

  function tableContinue(code) {
    // Always a line ending.
    effects.enter('lineEnding')
    effects.consume(code)
    effects.exit('lineEnding')
    // We checked that it’s not a prefixed or blank line, so we’re certain a
    // body is coming, though it may be indented.
    return factorySpace(effects, bodyStart, 'linePrefix', constants.tabSize)
  }

  function bodyStart(code) {
    effects.enter('tableBody')
    return rowStartBody(code)
  }

  function rowStartBody(code) {
    effects.enter('tableRow')

    // If we start with a pipe, we open a cell marker.
    if (code === codes.verticalBar) {
      return cellDividerBody(code)
    }

    effects.enter('temporaryTableCellContent')
    // Can’t be space or eols at the start of a construct, so we’re in a cell.
    return inCellContentBody(code)
  }

  function cellDividerBody(code) {
    // Always a pipe.
    effects.enter('tableCellDivider')
    effects.consume(code)
    effects.exit('tableCellDivider')
    return cellBreakBody
  }

  function cellBreakBody(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return atRowEndBody(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceBody
    }

    // `|`
    if (code === codes.verticalBar) {
      return cellDividerBody(code)
    }

    // Anything else is cell content.
    effects.enter('temporaryTableCellContent')
    return inCellContentBody(code)
  }

  function inWhitespaceBody(code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return inWhitespaceBody
    }

    effects.exit('whitespace')
    return cellBreakBody(code)
  }

  function inCellContentBody(code) {
    // EOF, whitespace, pipe
    if (
      code === codes.eof ||
      code === codes.verticalBar ||
      markdownLineEndingOrSpace(code)
    ) {
      effects.exit('temporaryTableCellContent')
      return cellBreakBody(code)
    }

    effects.consume(code)
    return code === codes.backslash
      ? inCellContentEscapeBody
      : inCellContentBody
  }

  function inCellContentEscapeBody(code) {
    if (code === codes.backslash || code === codes.verticalBar) {
      effects.consume(code)
      return inCellContentBody
    }

    // Anything else.
    return inCellContentBody(code)
  }

  function atRowEndBody(code) {
    effects.exit('tableRow')

    if (code === codes.eof) {
      return tableBodyClose(code)
    }

    return effects.check(
      nextPrefixedOrBlank,
      tableBodyClose,
      tableBodyContinue
    )(code)
  }

  function tableBodyClose(code) {
    effects.exit('tableBody')
    return tableClose(code)
  }

  function tableBodyContinue(code) {
    // Always a line ending.
    effects.enter('lineEnding')
    effects.consume(code)
    effects.exit('lineEnding')
    // Support an optional prefix, then start a body row.
    return factorySpace(effects, rowStartBody, 'linePrefix', constants.tabSize)
  }
}

// Based on micromark, but that won’t work as we’re in a table, and that expects
// content.
// <https://github.com/micromark/micromark/blob/main/lib/tokenize/setext-underline.js>
function tokenizeSetextUnderlineMini(effects, ok, nok) {
  return start

  function start(code) {
    if (code !== codes.dash) {
      return nok(code)
    }

    effects.enter('setextUnderline')
    return sequence(code)
  }

  function sequence(code) {
    if (code === codes.dash) {
      effects.consume(code)
      return sequence
    }

    return whitespace(code)
  }

  function whitespace(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return ok(code)
    }

    if (markdownSpace(code)) {
      effects.consume(code)
      return whitespace
    }

    return nok(code)
  }
}

function tokenizeNextPrefixedOrBlank(effects, ok, nok) {
  let size = 0

  return start

  function start(code) {
    // This is a check, so we don’t care about tokens, but we open a bogus one
    // so we’re valid.
    effects.enter('check')
    // EOL.
    effects.consume(code)
    return whitespace
  }

  function whitespace(code) {
    if (code === codes.virtualSpace || code === codes.space) {
      effects.consume(code)
      size++
      return size === constants.tabSize ? ok : whitespace
    }

    // EOF or whitespace
    if (code === codes.eof || markdownLineEndingOrSpace(code)) {
      return ok(code)
    }

    // Anything else.
    return nok(code)
  }
}
