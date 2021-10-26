import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import {micromark} from 'micromark'
import {gfmTable as syntax, gfmTableHtml as html} from '../dev/index.js'

const input = fs.readFileSync(path.join('test', 'input.md'))
const output = fs.readFileSync(path.join('test', 'output.html'), 'utf8')

test('markdown -> html (micromark)', (t) => {
  t.deepEqual(
    micromark(input, {
      allowDangerousHtml: true,
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    output,
    'should support tables just like how GH does it'
  )

  t.deepEqual(
    micromark('| a |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>| a |</p>',
    'should not support a table w/ the head row ending in an eof (1)'
  )

  t.deepEqual(
    micromark('| a', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>| a</p>',
    'should not support a table w/ the head row ending in an eof (2)'
  )

  t.deepEqual(
    micromark('a |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>a |</p>',
    'should not support a table w/ the head row ending in an eof (3)'
  )

  t.deepEqual(
    micromark('| a |\n| - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support a table w/ a delimiter row ending in an eof (1)'
  )

  t.deepEqual(
    micromark('| a\n| -', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support a table w/ a delimiter row ending in an eof (2)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n| b |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (1)'
  )

  t.deepEqual(
    micromark('| a\n| -\n| b', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (2)'
  )

  t.deepEqual(
    micromark('a|b\n-|-\nc|d', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td>d</td>\n</tr>\n</tbody>\n</table>',
    'should support a table w/ a body row ending in an eof (3)'
  )

  t.deepEqual(
    micromark('| a  \n| -\t\n| b |     ', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support rows w/ trailing whitespace (1)'
  )

  t.deepEqual(
    micromark('| a | \n| - |', {extensions: [syntax], htmlExtensions: [html]}),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support rows w/ trailing whitespace (2)'
  )

  t.deepEqual(
    micromark('| a |\n| - | ', {extensions: [syntax], htmlExtensions: [html]}),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support rows w/ trailing whitespace (3)'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n| b | ', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>',
    'should support rows w/ trailing whitespace (4)'
  )

  t.deepEqual(
    micromark('||a|\n|-|-|', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th></th>\n<th>a</th>\n</tr>\n</thead>\n</table>',
    'should support empty first header cells'
  )

  t.deepEqual(
    micromark('|a||\n|-|-|', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n</tr>\n</thead>\n</table>',
    'should support empty last header cells'
  )

  t.deepEqual(
    micromark('a||b\n-|-|-', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th></th>\n<th>b</th>\n</tr>\n</thead>\n</table>',
    'should support empty header cells'
  )

  t.deepEqual(
    micromark('|a|b|\n|-|-|\n||c|', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td></td>\n<td>c</td>\n</tr>\n</tbody>\n</table>',
    'should support empty first body cells'
  )

  t.deepEqual(
    micromark('|a|b|\n|-|-|\n|c||', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>c</td>\n<td></td>\n</tr>\n</tbody>\n</table>',
    'should support empty last body cells'
  )

  t.deepEqual(
    micromark('a|b|c\n-|-|-\nd||e', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n<th>b</th>\n<th>c</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>d</td>\n<td></td>\n<td>e</td>\n</tr>\n</tbody>\n</table>',
    'should support empty body cells'
  )

  t.deepEqual(
    micromark('| a |\n| - |\n- b', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n<ul>\n<li>b</li>\n</ul>',
    'should support a list after a table'
  )

  t.deepEqual(
    micromark('> | a |\n| - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>| a |\n| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (1)'
  )

  t.deepEqual(
    micromark('> a\n> | b |\n| - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>a\n| b |\n| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (2)'
  )

  t.deepEqual(
    micromark('| a |\n> | - |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>| a |</p>\n<blockquote>\n<p>| - |</p>\n</blockquote>',
    'should not support a lazy delimiter row (3)'
  )

  t.deepEqual(
    micromark('> a\n> | b |\n|-', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>a\n| b |\n|-</p>\n</blockquote>',
    'should not support a lazy delimiter row (4)'
  )

  t.deepEqual(
    micromark('> | a |\n> | - |\n| b |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| b |</p>',
    'should not support a lazy body row (1)'
  )

  t.deepEqual(
    micromark('> a\n> | b |\n> | - |\n| c |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<p>a</p>\n<table>\n<thead>\n<tr>\n<th>b</th>\n</tr>\n</thead>\n</table>\n</blockquote>\n<p>| c |</p>',
    'should not support a lazy body row (2)'
  )

  t.deepEqual(
    micromark('> | A |\n> | - |\n> | 1 |\n| 2 |', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<blockquote>\n<table>\n<thead>\n<tr>\n<th>A</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>1</td>\n</tr>\n</tbody>\n</table>\n</blockquote>\n<p>| 2 |</p>',
    'should not support a lazy body row (3)'
  )

  const doc = '   - d\n    - e'

  t.deepEqual(
    micromark(doc, {extensions: [syntax], htmlExtensions: [html]}),
    micromark(doc),
    'should not change how lists and lazyness work'
  )

  t.end()
})
