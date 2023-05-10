import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {micromark} from 'micromark'
import {createGfmFixtures} from 'create-gfm-fixtures'
import {gfmTable, gfmTableHtml} from 'micromark-extension-gfm-table'

test('core', async () => {
  assert.deepEqual(
    Object.keys(await import('micromark-extension-gfm-table')).sort(),
    ['gfmTable', 'gfmTableHtml'],
    'should expose the public api'
  )
})

test('markdown -> html (micromark)', () => {
  assert.deepEqual(
    micromark('| a |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<p>| a |</p>',
    'should not support a table w/ the head row ending in an eof (1)'
  )

  assert.deepEqual(
    micromark('| a', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<p>| a</p>',
    'should not support a table w/ the head row ending in an eof (2)'
  )

  assert.deepEqual(
    micromark('a |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<p>a |</p>',
    'should not support a table w/ the head row ending in an eof (3)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support a table w/ a delimiter row ending in an eof (1)'
  )

  assert.deepEqual(
    micromark('| a\n| -', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support a table w/ a delimiter row ending in an eof (2)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n| b |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (1)'
  )

  assert.deepEqual(
    micromark('| a\n| -\n| b', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (2)'
  )

  assert.deepEqual(
    micromark('a|b\n-|-\nc|d', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td>d</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (3)'
  )

  assert.deepEqual(
    micromark('| a  \n| -\t\n| b |     ', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support rows w/ trailing whitespace (1)'
  )

  assert.deepEqual(
    micromark('| a | \n| - |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support rows w/ trailing whitespace (2)'
  )

  assert.deepEqual(
    micromark('| a |\n| - | ', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support rows w/ trailing whitespace (3)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n| b | ', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support rows w/ trailing whitespace (4)'
  )

  assert.deepEqual(
    micromark('||a|\n|-|-|', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th></th>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support empty first header cells'
  )

  assert.deepEqual(
    micromark('|a||\n|-|-|', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n</tr>\n</thead>\n</table>',
    'should support empty last header cells'
  )

  assert.deepEqual(
    micromark('a||b\n-|-|-', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n<th>b</th>\n</tr>\n</thead>\n</table>',
    'should support empty header cells'
  )

  assert.deepEqual(
    micromark('|a|b|\n|-|-|\n||c|', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td></td>\n<td>c</td>\n</tr>\n</tbody>\n</table>',
    'should support empty first body cells'
  )

  assert.deepEqual(
    micromark('|a|b|\n|-|-|\n|c||', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td></td>\n</tr>\n</tbody>\n</table>',
    'should support empty last body cells'
  )

  assert.deepEqual(
    micromark('a|b|c\n-|-|-\nd||e', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n<th>c</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>d</td>\n<td></td>\n<td>e</td>\n</tr>\n</tbody>\n</table>',
    'should support empty body cells'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n- b', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li>b</li>\n</ul>',
    'should support a list after a table'
  )

  assert.deepEqual(
    micromark('> | a |\n| - |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<blockquote>\n<p>| a |\n| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (1)'
  )

  assert.deepEqual(
    micromark('> a\n> | b |\n| - |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<blockquote>\n<p>a\n| b |\n| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (2)'
  )

  assert.deepEqual(
    micromark('| a |\n> | - |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<p>| a |</p>\n<blockquote>\n<p>| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (3)'
  )

  assert.deepEqual(
    micromark('> a\n> | b |\n|-', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<blockquote>\n<p>a\n| b |\n|-</p>\n</blockquote>',
    'should not support a lazy delimiter row (4)'
  )

  assert.deepEqual(
    micromark('> | a |\n> | - |\n| b |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<blockquote>\n<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| b |</p>',
    'should not support a lazy body row (1)'
  )

  assert.deepEqual(
    micromark('> a\n> | b |\n> | - |\n| c |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<blockquote>\n<p>a</p>\n<table>\n<thead>\n<tr>\n<th>b</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| c |</p>',
    'should not support a lazy body row (2)'
  )

  assert.deepEqual(
    micromark('> | A |\n> | - |\n> | 1 |\n| 2 |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<blockquote>\n<table>\n<thead>\n<tr>\n<th>A</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>1</td>\n</tr>\n</tbody>\n</table>\n</blockquote>\n<p>| 2 |</p>',
    'should not support a lazy body row (3)'
  )

  const doc = '   - d\n    - e'

  assert.deepEqual(
    micromark(doc, {extensions: [gfmTable], htmlExtensions: [gfmTableHtml]}),
    micromark(doc),
    'should not change how lists and lazyness work'
  )

  assert.deepEqual(
    micromark('| a |\n   | - |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should form a table if the delimiter row is indented w/ 3 spaces'
  )

  assert.deepEqual(
    micromark('| a |\n    | - |', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<p>| a |\n| - |</p>',
    'should not form a table if the delimiter row is indented w/ 4 spaces'
  )

  assert.deepEqual(
    micromark('| a |\n    | - |', {
      extensions: [gfmTable, {disable: {null: ['codeIndented']}}],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should form a table if the delimiter row is indented w/ 4 spaces and indented code is turned off'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n> block quote?', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<blockquote>\n<p>block quote?</p>\n</blockquote>',
    'should be interrupted by a block quote'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n>', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<blockquote>\n</blockquote>',
    'should be interrupted by a block quote (empty)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n- list?', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li>list?</li>\n</ul>',
    'should be interrupted by a list'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n-', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li></li>\n</ul>',
    'should be interrupted by a list (empty)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n<!-- HTML? -->', {
      allowDangerousHtml: true,
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<!-- HTML? -->',
    'should be interrupted by HTML (flow)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n\tcode?', {
      allowDangerousHtml: true,
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<pre><code>code?\n</code></pre>',
    'should be interrupted by code (indented)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n```js\ncode?', {
      allowDangerousHtml: true,
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<pre><code class="language-js">code?\n</code></pre>\n',
    'should be interrupted by code (fenced)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n***', {
      allowDangerousHtml: true,
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<hr />',
    'should be interrupted by a thematic break'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\n# heading?', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<h1>heading?</h1>',
    'should be interrupted by a heading (ATX)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\nheading\n=', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n<tr>\n<td>=</td>\n</tr>\n</tbody>\n</table>',
    'should *not* be interrupted by a heading (setext)'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\nheading\n---', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n</tbody>\n</table>\n<hr />',
    'should *not* be interrupted by a heading (setext), but interrupt if the underline is also a thematic break'
  )

  assert.deepEqual(
    micromark('| a |\n| - |\nheading\n-', {
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n</tbody>\n</table>\n<ul>\n<li></li>\n</ul>',
    'should *not* be interrupted by a heading (setext), but interrupt if the underline is also an empty list item bullet'
  )
})

test('fixtures', async () => {
  const base = new URL('fixtures/', import.meta.url)

  await createGfmFixtures(base, {rehypeStringify: {closeSelfClosing: true}})

  const files = await fs.readdir(base)
  const extname = '.md'

  let index = -1

  while (++index < files.length) {
    const d = files[index]

    if (!d.endsWith(extname)) {
      continue
    }

    const name = d.slice(0, -extname.length)

    const input = await fs.readFile(new URL(name + '.md', base))
    let expected = String(await fs.readFile(new URL(name + '.html', base)))
    let actual = micromark(input, {
      allowDangerousHtml: true,
      allowDangerousProtocol: true,
      extensions: [gfmTable],
      htmlExtensions: [gfmTableHtml]
    })

    if (actual && !/\n$/.test(actual)) {
      actual += '\n'
    }

    if (name === 'some-escapes') {
      expected = expected
        .replace(/C \| Charlie/, 'C \\')
        .replace(/E \\\| Echo/, 'E \\\\')
    }

    if (name === 'interrupt') {
      actual = actual
        // Comments, declarations, instructions, cdata are filtered out by GitHub.
        .replace(/<!-- c -->/, '')
        .replace(/<!C>/, '')
        .replace(/<\? c \?>/, '')
        .replace(/<!\[CDATA\[c]]>/, '')
        // Unknown elements are filtered out by GitHub.
        .replace(/<x>/, '')
        // `micromark` removes the first line ending (maybe a bug?)
        .replace(/<pre>\n {2}a/, '<pre>  a')

      // GitHub parses the document and adds the missing closing tag.
      actual += '</div>\n'
    }

    assert.deepEqual(actual, expected, name)
  }
})
