/**
 * @import {FlatXoConfig} from 'xo'
 */

/** @type {FlatXoConfig} */
const xoConfig = [
  {ignores: ['test/fixtures/**']},
  {
    name: 'default',
    prettier: 'compat',
    rules: {
      '@typescript-eslint/array-type': ['error', {default: 'generic'}],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      complexity: 'off',
      'jsdoc/check-indentation': 'off',
      'jsdoc/check-line-alignment': 'off',
      'jsdoc/require-asterisk-prefix': 'off',
      'max-depth': 'off',
      'prefer-object-spread': 'off',
      'regexp/prefer-named-capture-group': 'off',
      'require-unicode-regexp': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/no-computed-property-existence-check': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-this-assignment': 'off',
      'unicorn/no-unsafe-string-replacement': 'off',
      'unicorn/prefer-includes-over-repeated-comparisons': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/require-array-sort-compare': 'off'
    },
    space: true
  },
  {files: ['test/**/*.js'], rules: {'no-await-in-loop': 'off'}},
  {rules: {'prefer-arrow-callback': 'off'}}
]

export default xoConfig
