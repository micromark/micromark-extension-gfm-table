# micromark-extension-gfm-table

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to support GitHub flavored markdown [tables][].
This syntax extension matches the GFM spec and github.com.

This package provides the low-level modules for integrating with the micromark
tokenizer and the micromark HTML compiler.

You probably shouldn’t use this package directly, but instead use
[`mdast-util-gfm-table`][mdast-util-gfm-table] with
**[mdast][]**.

## Install

[npm][]:

```sh
npm install micromark-extension-gfm-table
```

## API

### `html`

### `syntax`

> Note: `syntax` is the default export of this module, `html` is available at
> `micromark-extension-gfm-table/html`.

Support [tables][].
The exports are extensions for the micromark parser (to tokenize tables; can be
passed in `extensions`) and the default HTML compiler (to compile as `<table>`
elements; can be passed in `htmlExtensions`).

## Related

*   [`remarkjs/remark`][remark]
    — markdown processor powered by plugins
*   [`micromark/micromark`][micromark]
    — the smallest commonmark-compliant markdown parser that exists
*   [`syntax-tree/mdast-util-gfm-table`](https://github.com/syntax-tree/mdast-util-gfm-table)
    — mdast utility to support tables
*   [`syntax-tree/mdast-util-from-markdown`][from-markdown]
    — mdast parser using `micromark` to create mdast from markdown
*   [`syntax-tree/mdast-util-to-markdown`][to-markdown]
    — mdast serializer to create markdown from mdast

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/micromark/micromark-extension-gfm-table.svg

[build]: https://travis-ci.org/micromark/micromark-extension-gfm-table

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-table.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-table

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-table.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-table

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-table.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-table

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[micromark]: https://github.com/micromark/micromark

[from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[remark]: https://github.com/remarkjs/remark

[mdast]: https://github.com/syntax-tree/mdast

[mdast-util-gfm-table]: https://github.com/syntax-tree/mdast-util-gfm-table

[tables]: https://github.github.com/gfm/#tables-extension-
