'use strict'

const neostandard = require('neostandard')

module.exports = [
  {
    ignores: [
      '.nyc_output/**',
      '.tap/**',
      'coverage/**',
      'docs/**',
      'node_modules/**',
      'public/**',
      '**/*.ldif',
      '**/*.tar.*',
      '**/*.tgz'
    ]
  },
  ...neostandard({
    env: ['node'],
    noJsx: true
  }),
  {
    rules: {
      'no-shadow': 'error',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrors: 'none'
      }],
      'object-shorthand': 'off'
    }
  },
  {
    files: [
      'test/**/*.js',
      'test-integration/**/*.js'
    ],
    rules: {
      'no-shadow': 'off'
    }
  }
]
