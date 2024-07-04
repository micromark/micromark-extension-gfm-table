import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {micromark} from 'micromark'
import {createGfmFixtures} from 'create-gfm-fixtures'
import {gfmTable, gfmTableHtml} from 'micromark-extension-gfm-table'

test('micromark-extension-gfm-table', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('micromark-extension-gfm-table')).sort(),
      ['gfmTable', 'gfmTableHtml']
    )
  })
})

test('markdown -> html (micromark)', async function (t) {
  await t.test(
    'should not support a table w/ the head row ending in an eof (1)',
    async function () {
      assert.deepEqual(
        micromark('| a |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<p>| a |</p>'
      )
    }
  )

  await t.test(
    'should skip table construct if `disable.null` includes `table`',
    async function () {
      assert.deepEqual(
        micromark(`123\n\n| a | b | c |\n| - | - | - |\n| d | e | f |`, {
          extensions: [gfmTable(), {disable: {null: ['table']}}],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<p>123</p>\n<p>| a | b | c |\n| - | - | - |\n| d | e | f |</p>'
      )
    }
  )

  await t.test(
    'should not support a table w/ the head row ending in an eof (2)',
    async function () {
      assert.deepEqual(
        micromark('| a', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<p>| a</p>'
      )
    }
  )

  await t.test(
    'should not support a table w/ the head row ending in an eof (3)',
    async function () {
      assert.deepEqual(
        micromark('a |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<p>a |</p>'
      )
    }
  )

  await t.test(
    'should support a table w/ a delimiter row ending in an eof (1)',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>'
      )
    }
  )

  await t.test(
    'should support a table w/ a delimiter row ending in an eof (2)',
    async function () {
      assert.deepEqual(
        micromark('| a\n| -', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>'
      )
    }
  )

  await t.test(
    'should support a table w/ a body row ending in an eof (1)',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - |\n| b |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>'
      )
    }
  )

  await t.test(
    'should support a table w/ a body row ending in an eof (2)',
    async function () {
      assert.deepEqual(
        micromark('| a\n| -\n| b', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>'
      )
    }
  )

  await t.test(
    'should support a table w/ a body row ending in an eof (3)',
    async function () {
      assert.deepEqual(
        micromark('a|b\n-|-\nc|d', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td>d</td>\n</tr>\n</tbody>\n</table>'
      )
    }
  )

  await t.test(
    'should support rows w/ trailing whitespace (1)',
    async function () {
      assert.deepEqual(
        micromark('| a  \n| -\t\n| b |     ', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>'
      )
    }
  )

  await t.test(
    'should support rows w/ trailing whitespace (2)',
    async function () {
      assert.deepEqual(
        micromark('| a | \n| - |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>'
      )
    }
  )

  await t.test(
    'should support rows w/ trailing whitespace (3)',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - | ', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>'
      )
    }
  )

  await t.test(
    'should support rows w/ trailing whitespace (4)',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - |\n| b | ', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>'
      )
    }
  )

  await t.test('should support empty first header cells', async function () {
    assert.deepEqual(
      micromark('||a|\n|-|-|', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th></th>\n<th>a</th>\n</tr>\n</thead>\n</table>'
    )
  })

  await t.test('should support empty last header cells', async function () {
    assert.deepEqual(
      micromark('|a||\n|-|-|', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n</tr>\n</thead>\n</table>'
    )
  })

  await t.test('should support empty header cells', async function () {
    assert.deepEqual(
      micromark('a||b\n-|-|-', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n<th>b</th>\n</tr>\n</thead>\n</table>'
    )
  })

  await t.test('should support empty first body cells', async function () {
    assert.deepEqual(
      micromark('|a|b|\n|-|-|\n||c|', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td></td>\n<td>c</td>\n</tr>\n</tbody>\n</table>'
    )
  })

  await t.test('should support empty last body cells', async function () {
    assert.deepEqual(
      micromark('|a|b|\n|-|-|\n|c||', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td></td>\n</tr>\n</tbody>\n</table>'
    )
  })

  await t.test('should support empty body cells', async function () {
    assert.deepEqual(
      micromark('a|b|c\n-|-|-\nd||e', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n<th>c</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>d</td>\n<td></td>\n<td>e</td>\n</tr>\n</tbody>\n</table>'
    )
  })

  await t.test('should support a list after a table', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n- b', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li>b</li>\n</ul>'
    )
  })

  await t.test(
    'should not support a lazy delimiter row (1)',
    async function () {
      assert.deepEqual(
        micromark('> | a |\n| - |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<blockquote>\n<p>| a |\n| - |</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should not support a lazy delimiter row (2)',
    async function () {
      assert.deepEqual(
        micromark('> a\n> | b |\n| - |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<blockquote>\n<p>a\n| b |\n| - |</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should not support a lazy delimiter row (3)',
    async function () {
      assert.deepEqual(
        micromark('| a |\n> | - |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<p>| a |</p>\n<blockquote>\n<p>| - |</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should not support a lazy delimiter row (4)',
    async function () {
      assert.deepEqual(
        micromark('> a\n> | b |\n|-', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<blockquote>\n<p>a\n| b |\n|-</p>\n</blockquote>'
      )
    }
  )

  await t.test('should not support a lazy body row (1)', async function () {
    assert.deepEqual(
      micromark('> | a |\n> | - |\n| b |', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<blockquote>\n<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| b |</p>'
    )
  })

  await t.test('should not support a lazy body row (2)', async function () {
    assert.deepEqual(
      micromark('> a\n> | b |\n> | - |\n| c |', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<blockquote>\n<p>a</p>\n<table>\n<thead>\n<tr>\n<th>b</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| c |</p>'
    )
  })

  await t.test('should not support a lazy body row (3)', async function () {
    assert.deepEqual(
      micromark('> | A |\n> | - |\n> | 1 |\n| 2 |', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<blockquote>\n<table>\n<thead>\n<tr>\n<th>A</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>1</td>\n</tr>\n</tbody>\n</table>\n</blockquote>\n<p>| 2 |</p>'
    )
  })

  await t.test(
    'should not change how lists and lazyness work',
    async function () {
      const doc = '   - d\n    - e'

      assert.deepEqual(
        micromark(doc, {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        micromark(doc)
      )
    }
  )

  await t.test(
    'should form a table if the delimiter row is indented w/ 3 spaces',
    async function () {
      assert.deepEqual(
        micromark('| a |\n   | - |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>'
      )
    }
  )

  await t.test(
    'should not form a table if the delimiter row is indented w/ 4 spaces',
    async function () {
      assert.deepEqual(
        micromark('| a |\n    | - |', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<p>| a |\n| - |</p>'
      )
    }
  )

  await t.test(
    'should form a table if the delimiter row is indented w/ 4 spaces and indented code is turned off',
    async function () {
      assert.deepEqual(
        micromark('| a |\n    | - |', {
          extensions: [gfmTable(), {disable: {null: ['codeIndented']}}],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>'
      )
    }
  )

  await t.test('should be interrupted by a block quote', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n> block quote?', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<blockquote>\n<p>block quote?</p>\n</blockquote>'
    )
  })

  await t.test(
    'should be interrupted by a block quote (empty)',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - |\n>', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<blockquote>\n</blockquote>'
      )
    }
  )

  await t.test('should be interrupted by a list', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n- list?', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li>list?</li>\n</ul>'
    )
  })

  await t.test('should be interrupted by a list (empty)', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n-', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li></li>\n</ul>'
    )
  })

  await t.test('should be interrupted by HTML (flow)', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n<!-- HTML? -->', {
        allowDangerousHtml: true,
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<!-- HTML? -->'
    )
  })

  await t.test('should be interrupted by code (indented)', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n\tcode?', {
        allowDangerousHtml: true,
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<pre><code>code?\n</code></pre>'
    )
  })

  await t.test('should be interrupted by code (fenced)', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n```js\ncode?', {
        allowDangerousHtml: true,
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<pre><code class="language-js">code?\n</code></pre>\n'
    )
  })

  await t.test('should be interrupted by a thematic break', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n***', {
        allowDangerousHtml: true,
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<hr />'
    )
  })

  await t.test('should be interrupted by a heading (ATX)', async function () {
    assert.deepEqual(
      micromark('| a |\n| - |\n# heading?', {
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
      }),
      '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<h1>heading?</h1>'
    )
  })

  await t.test(
    'should *not* be interrupted by a heading (setext)',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - |\nheading\n=', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n<tr>\n<td>=</td>\n</tr>\n</tbody>\n</table>'
      )
    }
  )

  await t.test(
    'should *not* be interrupted by a heading (setext), but interrupt if the underline is also a thematic break',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - |\nheading\n---', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n</tbody>\n</table>\n<hr />'
      )
    }
  )

  await t.test(
    'should *not* be interrupted by a heading (setext), but interrupt if the underline is also an empty list item bullet',
    async function () {
      assert.deepEqual(
        micromark('| a |\n| - |\nheading\n-', {
          extensions: [gfmTable()],
          htmlExtensions: [gfmTableHtml()]
        }),
        '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>heading</td>\n</tr>\n</tbody>\n</table>\n<ul>\n<li></li>\n</ul>'
      )
    }
  )
})

test('fixtures', async function (t) {
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

    await t.test(name, async function () {
      const input = await fs.readFile(new URL(name + '.md', base))
      let expected = String(await fs.readFile(new URL(name + '.html', base)))
      let actual = micromark(input, {
        allowDangerousHtml: true,
        allowDangerousProtocol: true,
        extensions: [gfmTable()],
        htmlExtensions: [gfmTableHtml()]
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

      assert.deepEqual(actual, expected)
    })
  }
})
