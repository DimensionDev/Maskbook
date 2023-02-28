import TypescriptParser from '@typescript-eslint/parser'

import UnusedImportsPlugin from 'eslint-plugin-unused-imports'
import UnusedClassesPlugin from 'eslint-plugin-tss-unused-classes'
// @ts-expect-error
import ImportPlugin from 'eslint-plugin-import'
import TypeScriptPlugin from '@typescript-eslint/eslint-plugin'
import UnicornPlugin from 'eslint-plugin-unicorn'
import ReactPlugin from 'eslint-plugin-react'
import ReactHooksPlugin from 'eslint-plugin-react-hooks'
// @ts-expect-error
import DimensionDevPlugin from '@dimensiondev/eslint-plugin'

// Note: update our plugin
Object.keys(DimensionDevPlugin.rules)
    .filter((x) => x.includes('/'))
    .forEach((key) => {
        DimensionDevPlugin.rules[key.replace('/', '-')] = DimensionDevPlugin.rules[key]
    })

const basicRules = {
    'constructor-super': 'error',
    'dot-notation': 'error',
    eqeqeq: 'error',
    'object-shorthand': 'warn',
    'no-var': 'error',
    'no-bitwise': 'error',
    'no-debugger': 'error',
    'no-eval': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-new-wrappers': 'error',
    'no-plusplus': 'error',
    'valid-typeof': 'error',
    'no-loss-of-precision': 'error',
    'no-unsafe-optional-chaining': 'error',
    'no-unsafe-negation': 'error',
    'no-unsafe-finally': 'error',
    'no-irregular-whitespace': 'error',
    'no-restricted-globals': ['error', 'event', 'name', 'length', 'closed'],
    'no-restricted-imports': [
        'error',
        {
            paths: [
                { name: 'lodash', message: 'Please use lodash-es instead.' },
                { name: 'date-fns', message: 'Please use date-fns/{submodule} instead.' },
                { name: 'date-fns/esm', message: 'Please use date-fns/{submodule} instead.' },
                { name: '@masknet/typed-message/base', message: 'Please use @masknet/typed-message instead.' },
                {
                    name: '@dimensiondev/holoflows-kit/es',
                    message: 'Please use @dimensiondev/holoflows-kit instead.',
                },
            ],
        },
    ],
    'no-return-await': 'error',
    'no-sparse-arrays': 'error',
    'no-template-curly-in-string': 'error',
    'prefer-const': 'warn',
    'use-isnan': 'error',
    'unused-imports/no-unused-imports-ts': 'error',
    'tss-unused-classes/unused-classes': 'error',
}

const advancedRules = {
    'no-restricted-imports': [
        'error',
        {
            paths: [
                { name: 'lodash', message: 'Please use lodash-es instead.' },
                { name: 'date-fns', message: 'Please use date-fns/{submodule} instead.' },
                { name: 'date-fns/esm', message: 'Please use date-fns/{submodule} instead.' },
                { name: 'idb/with-async-ittr-cjs', message: 'Please use idb/with-async-ittr instead.' },
                { name: '@masknet/typed-message/base', message: 'Please use @masknet/typed-message instead.' },
                {
                    name: '@dimensiondev/holoflows-kit/es',
                    message: 'Please use @dimensiondev/holoflows-kit instead.',
                },
                {
                    name: 'lodash-es',
                    message: 'Avoid using type unsafe methods.',
                    importNames: ['get'],
                },
            ],
        },
    ],
    yoda: 'error',
    radix: 'error',
    eqeqeq: ['error', 'always'],
    'spaced-comment': ['error', 'always', { line: { markers: ['/'] } }],
    'no-cond-assign': 'error',
    'no-constant-condition': 'error',
    'no-extra-boolean-cast': 'error',
    'no-script-url': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-concat': 'error',
    'no-useless-rename': 'error',
    'no-useless-catch': 'error',
    'no-loss-of-precision': 'error',
    'prefer-regex-literals': 'error',
    'react/jsx-boolean-value': 'error',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/jsx-key': 'error',
    'react/no-invalid-html-attribute': 'error',
    'react/no-unknown-property': 'error',
    'react/self-closing-comp': ['warn', { component: true, html: true }],
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'import/no-deprecated': 'off',
    'import/no-duplicates': 'error',
    'unicorn/better-regex': 'error',
    'unicorn/catch-error-name': ['error', { ignore: ['^err$'] }],
    'unicorn/no-instanceof-array': 'error',
    'unicorn/no-new-array': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-thenable': 'error',
    'unicorn/no-useless-promise-resolve-reject': 'error',
    'unicorn/prefer-add-event-listener': 'error',
    'unicorn/prefer-date-now': 'error',
    'unicorn/prefer-dom-node-dataset': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/relative-url-style': ['error', 'always'],
    'unicorn/throw-new-error': 'error',
    'unicorn/prefer-string-slice': 'error',
    '@dimensiondev/array-no-implicit-sort': 'error',
    '@dimensiondev/browser-prefer-location-assign': 'error',
    '@dimensiondev/jsx-no-class-component': 'error',
    '@dimensiondev/jsx-no-template-literal': 'off',
    '@dimensiondev/no-for-in': 'error',
    '@dimensiondev/no-number-constructor': 'off',
    '@dimensiondev/prefer-early-return': 'error',
    '@dimensiondev/string-no-interpolation': 'off',
    '@dimensiondev/string-no-locale-case': 'error',
    '@dimensiondev/string-no-simple-template-literal': 'error',
    '@dimensiondev/string-no-unneeded-to-string': 'error',
    '@dimensiondev/type-no-instanceof-wrapper': 'error',
    '@dimensiondev/type-no-wrapper-type-reference': 'error',
    '@dimensiondev/unicode-specific-set': 'error',
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-base-to-string': 'off',
    '@typescript-eslint/no-implied-eval': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-invalid-this': 'error',
    '@typescript-eslint/no-loop-func': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/prefer-enum-initializers': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-literal-enum-member': 'error',
    // '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'off',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
}

export default [
    {
        ignores: [
            '**/*.d.ts',
            '**/public',
            '**/build',
            '**/dist',
            '**/package.json',
            '**/i18n_generated.ts',
            '**/.storybook',
            'packages/contracts',
            'storybook-static',
            'packages/scripts',
            'packages/netlify/sites',
            'packages/mask/.webpack',
            'setup',
        ],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            // Note: --cache is not supported yet if parser is an object https://github.com/eslint/eslint/issues/16875
            parser: TypescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                project: './tsconfig.eslint.json',
                warnOnUnsupportedTypeScriptVersion: false,
            },
        },
        plugins: {
            'tss-unused-classes': UnusedClassesPlugin,
            react: ReactPlugin,
            import: ImportPlugin,
            unicorn: UnicornPlugin,
            '@typescript-eslint': TypeScriptPlugin,
            '@dimensiondev': DimensionDevPlugin,
            'unused-imports': UnusedImportsPlugin,
            'react-hooks': ReactHooksPlugin,
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        rules: {
            ...basicRules,
            ...advancedRules,
        },
    },
]
