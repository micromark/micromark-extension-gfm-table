import fs from 'fs'
import path from 'path'
import test from 'tape'
import {micromark} from 'micromark'
import {gfmTable as syntax, gfmTableHtml as html} from '../index.js'

var input = fs.readFileSync(path.join('test', 'input.md'))
var output = fs.readFileSync(path.join('test', 'output.html'), 'utf8')

test('markdown -> html (micromark)', function (t) {
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

  t.end()
})
