// cSpell:disable
// @ts-check
import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'
import UnusedImportsPlugin from 'eslint-plugin-unused-imports'
// @ts-expect-error
import UnusedClassesPlugin from 'eslint-plugin-tss-unused-classes'
import ReactCompilerPlugin from 'eslint-plugin-react-compiler'
import ImportPlugin from 'eslint-plugin-import-x'
import eslintReact from '@eslint-react/eslint-plugin'
import MasknetPlugin from '@masknet/eslint-plugin'
import tanstackReactQuery from '@tanstack/eslint-plugin-query'
import lingui from 'eslint-plugin-lingui'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

const deferPackages = [
    'wallet.ts',
    'anchorme',
    '@blocto/fcl',
    '@metamask/eth-sig-util',
    '@masknet/gun-utils',
    'twitter-text',
    '@solana/web3.js',
    // add package names here.
]

// Prefer rules from @typescript-eslint > unicorn > other plugins
// Level: if the rule is fixable and can be tolerate during dev, use 'warn' is better.
//        if the fix needs big rewrite (e.g. XHR => fetch), use 'error' to notice the developer early.
//        for RegEx rules, always uses 'error'.

/** @type {Partial<import('eslint/config').Config['rules']>} */
const disabledRules = {
    // Not compatible
    // with TypeScript
    'unicorn/no-optional-chaining-on-undeclared-variable': 'off',
    // TypeScript can do the check
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-invalid-argument-count': 'off',
    // false positives
    'unicorn/no-useless-coercion': 'off',
    'unicorn/prefer-spread': 'off', // TypedArrays
    'unicorn/require-number-to-fixed-digits-argument': 'off', // BigNumber
    // WebExtension: in Firefox content scripts, window !== globalThis (instanceof SandBox).
    'unicorn/no-unnecessary-global-this': 'off',
    'unicorn/prefer-global-this': 'off',
    // ses not up to date to allow Error.isError
    'unicorn/prefer-error-is-error': 'off',
    // with Prettier
    'unicorn/number-literal-case': 'off',

    // bad practice
    'unicorn/prefer-top-level-await': 'off', // top-level await is bad for applications. scripts are ok.

    // too strict
    '@eslint-react/jsx-no-leaked-dollar': 'off', // all use cases in our codebase are not a bug, but a currency amount.
    '@eslint-react/no-array-index-key': 'off',
    '@typescript-eslint/no-deprecated': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'off', // require promise to be then or catch
    '@typescript-eslint/no-misused-promises': 'off', // require promise to be then or catch
    '@typescript-eslint/no-namespace': 'off', // namespace T {}, they won't support type only namespace
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off', // not sure if we can trust our typing
    '@typescript-eslint/no-unnecessary-type-conversion': 'off', // we have some defensive code for untrusted input, not sure if it is safe to remove those
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // we use a lot of || to check falsy string "" in web3 related code. nullish coalescing will break those code.
    '@typescript-eslint/prefer-promise-reject-errors': 'off',
    '@typescript-eslint/triple-slash-reference': 'off', // we need it, maybe
    'lingui/no-expression-in-message': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-await-expression-member': 'off',
    'unicorn/no-break-in-nested-loop': 'off',
    'unicorn/no-computed-property-existence-check': 'off',
    'unicorn/no-top-level-assignment-in-function': 'off',
    'unicorn/no-top-level-side-effects': 'off',

    // too strict, this require elimination of any
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',

    // style, readibility and convention
    'unicorn/consistent-class-member-order': 'off',
    'unicorn/explicit-length-check': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/import-style': 'off',
    'unicorn/max-nested-calls': 'off',
    'unicorn/no-for-each': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-non-function-verb-prefix': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-unreadable-for-of-expression': 'off',
    'unicorn/no-useless-else': 'off', // useless else sometime is more readable than early return.
    'unicorn/prefer-await': 'off', // sometimes a .then/catch more readable
    'unicorn/prefer-includes-over-repeated-comparisons': 'off', // not worth
    'unicorn/prefer-switch': 'off', // switch is bad
    'unicorn/switch-case-braces': 'off', // we have a rule that warns for decelaration in switch case

    // TODO: add back
    '@eslint-react/exhaustive-deps': 'off',
    '@eslint-react/use-state': [
        'warn',
        {
            enforceSetterName: false,
            // enforceAssignment: false,
        },
    ],
    '@tanstack/query/prefer-query-options': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off', // reasonable, but too much work
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/require-await': 'off', // most cases, parameter signature required to
    '@typescript-eslint/restrict-template-expressions': 'off', // recheck with number allowed in template string
    '@typescript-eslint/unbound-method': 'off',
    'unicorn/consistent-boolean-name': 'off',
    'unicorn/consistent-compound-words': 'off',
    'unicorn/name-replacements': 'off',
    'unicorn/prefer-number-coercion': 'off',
}

/** @type {Partial<import('eslint/config').Config['rules']>} */
const avoidMistakeRules = {
    // Libraries
    '@tanstack/query/no-rest-destructuring': 'error',
    'lingui/no-plural-inside-trans': 'error',

    // Code quality
    '@typescript-eslint/ban-ts-comment': [
        'error',
        {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
            'ts-nocheck': true,
            'ts-check': false,
            minimumDescriptionLength: 5,
        },
    ], // disable a rule requires a reason
    /// React bad practice
    'react-compiler/react-compiler': 'error',
    /// TypeScript bad practice
    '@typescript-eslint/no-restricted-types': [
        'error',
        {
            types: {
                FC: {
                    message:
                        "To declare a component, you don't have to use FC to annotate it. To type something that accepts/is a React Component, use ComponentType<T>.",
                    fixWith: 'ComponentType',
                },
                ReactElement: {
                    message:
                        'In most cases, you want ReactNode. Only ignore this rule when you want to use cloneElement.',
                    fixWith: 'ReactNode',
                },
                'React.FC': {
                    message:
                        "To declare a component, you don't have to use React.FC to annotate it. To type something that accepts/is a React Component, use React.ComponentType<T>.",
                    fixWith: 'React.ComponentType',
                },
                'React.ReactElement': {
                    message:
                        'In most cases, you want React.ReactNode. Only ignore this rule when you want to use cloneElement.',
                    fixWith: 'React.ReactNode',
                },
            },
        },
    ],
    '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    /// Unicode support
    'require-unicode-regexp': 'error', // RegEx modern RegEx with Unicode support
    // '@masknet/no-builtin-base64': 'warn', // Note: it fixes to Node's Buffer
    /// type safety
    // '@typescript-eslint/method-signature-style': 'warn', // method signature is bivariant
    // '@typescript-eslint/strict-boolean-expressions': 'error', // stronger check for nullable string/number/boolean
    // '@typescript-eslint/switch-exhaustiveness-check': 'error', // switch should be exhaustive
    // '@masknet/type-no-force-cast-via-top-type': 'error', // expr as any as T

    // Security
    '@masknet/browser-no-set-html': 'error', // .innerHTML =
    '@masknet/unicode-no-bidi': 'error',
    '@masknet/unicode-no-invisible': 'error',
    '@masknet/unicode-specific-set': 'off',
    'no-script-url': 'error', // javascript:
    'unicorn/no-unsafe-dom-html': 'error',
    // '@masknet/string-no-data-url': 'error', // data:...
    // 'unicorn/require-post-message-target-origin': 'warn', // postMessage(data, 'origin')

    // Confusing code
    'no-bitwise': 'error', // need mark out
    'no-div-regex': 'error', // RegEx
    'no-label-var': 'warn', // name collision
    'no-plusplus': 'warn', // ++i? i++?
    'no-sequences': 'warn', // (a, b)

    // Problematic language features
    /// API with trap
    radix: 'warn', // parseInt('1', _required_)
    // This rule breaks BigNumber class which has different .toFixed() default value.
    // 'unicorn/require-number-to-fixed-digits-argument': 'warn', // Number#toFixed(_required_)
    '@typescript-eslint/require-array-sort-compare': 'error', // Array#sort(_required_)
    /// Footgun language features
    '@typescript-eslint/prefer-enum-initializers': 'warn', // add a new item in the middle is an API breaking change.
    'no-new-wrappers': 'error', // wrapper objects are bad
    /// Little-known language features
    'no-constructor-return': 'error', // constructor() { return expr }

    // Prevent bugs
    '@eslint-react/no-leaked-conditional-rendering': 'error', // <div>{0 && <Something />}</div> will render "0"!
    '@masknet/string-no-locale-case': 'error', // in non-i18n cases use locale-aware string methods are wrong
    '@typescript-eslint/no-loop-func': 'warn', // capture a loop variable might be a bug
    'default-case-last': 'error', // default: should be the last
    'no-duplicate-case': 'error', // switch
    'no-self-compare': 'error', // a === a
    'no-template-curly-in-string': 'error', // "${expr}" looks like a bug
    'no-unmodified-loop-condition': 'error', // loop bug
    'no-unreachable-loop': 'error', // loop bug
    'no-restricted-syntax': [
        'error',
        {
            selector:
                "MemberExpression[object.type='MemberExpression'][object.object.type='Identifier'][object.object.name='theme'][object.property.type='Identifier'][object.property.name='palette']",
            message:
                'Use theme.vars.palette for color values and theme.applyStyles() for color-scheme-specific styles.',
        },
        {
            selector: "JSXAttribute[name.name='style'] ObjectExpression > Property[key.value=/^--/]",
            message:
                'Use sx={(theme) => ({ ...theme.applyStyles(...) })} for CSS custom properties that vary by color scheme.',
        },
    ],
    // 'array-callback-return': 'error', // .map .some ... calls should have a return value
    eqeqeq: 'error', // ===
    'no-restricted-globals': [
        'error',
        // source of bug (those names are too common)
        'error',
        'event',
        'name',
        'length',
        'closed',
        // no localStorage & sessionStorage in a web extension
        {
            name: 'localStorage',
            message:
                "If you're in the background script, localStorage is banned. It will cause Manifest V3 to crash. If you're in the chrome-extension:// pages, localStorage is discouraged. If you're in the content scripts, we can only use localStorage to read websites' data and MUST NOT store our own data.",
        },
        {
            name: 'sessionStorage',
            message:
                "If you're in the background script, sessionStorage is banned. It will cause Manifest V3 to crash. If you're in the chrome-extension:// pages, sessionStorage is discouraged. If you're in the content scripts, we can only use sessionStorage to read websites' data and MUST NOT store our own data.",
        },
    ],
    // 'require-atomic-updates': 'error', // await/yield race condition
}

/** @type {Partial<import('eslint/config').Config['rules']>} */
const codeStyleRules = {
    // Deprecated
    'no-alert': 'warn', // alert()
    'no-proto': 'error', // __proto__ accessor

    // Useless code
    '@masknet/string-no-simple-template-literal': 'warn', // prefer simple string
    '@masknet/string-no-unneeded-to-string': 'warn', // useless .toString()
    '@typescript-eslint/no-unnecessary-qualifier': 'warn', // no extra qualifier in enum/namespace
    'no-unused-private-class-members': 'off',
    '@typescript-eslint/no-unused-private-class-members': 'warn',
    'no-extra-bind': 'warn', // unused bind on a function that does not uses this
    'no-extra-label': 'warn', // break/continue is ok without label
    'no-unneeded-ternary': 'warn', // expr ? true : false
    'no-useless-call': 'warn', // expr.call(undefined, ...)
    'no-useless-concat': 'warn', // "a" + "b"
    // '@eslint-react/no-unused-props': 'warn',
    // '@masknet/array-no-unneeded-flat-map': 'warn', // bans Array#flatMap((x) => x)
    '@typescript-eslint/no-useless-empty-export': 'warn', // export {}
    // 'no-lone-blocks': 'warn', // no block that not introducing a new scope
    // Note: this rule seems like does not have the correct type checking behavior. before typescript-eslint has project reference support, don't use it.

    // Prefer modern things
    'prefer-object-has-own': 'warn',
    'unicorn/prefer-dispose': 'warn',
    'unicorn/prefer-import-meta-properties': 'warn',
    'unicorn/prefer-uint8array-base64': 'warn',
    'prefer-exponentiation-operator': 'warn', // **
    // 'unicorn/prefer-iterator-concat': 'warn', // no TypeScript .d yet
    // 'prefer-named-capture-group': 'warn', // RegEx
    // 'prefer-object-spread': 'warn', // { ... } than Object.assign

    // Prefer modern things (web)
    '@masknet/browser-prefer-location-assign': 'warn',
    '@masknet/jsx-no-class-component': 'error',
    '@masknet/prefer-fetch': 'error',
    // '@masknet/array-prefer-from': 'warn',
    // '@masknet/no-unsafe-date': 'error', // use date-fns or Temporal instead
    // '@masknet/type-no-number-constructor': 'warn',

    // Better debug
    'symbol-description': 'warn', // Symbol(desc)
    'unicorn/catch-error-name': ['warn', { ignore: ['^err$'] }], // catch (err)
    '@eslint-react/no-missing-context-display-name': 'warn',

    // More readable code
    // '@typescript-eslint/consistent-indexed-object-style': ['warn', 'index-signature'], // index signature includes key's name, e.g. { [what_it_should_be: string]: T } than Record<string, T>
    '@typescript-eslint/consistent-indexed-object-style': 'off', // index signature includes key's name, e.g. { [what_it_should_be: string]: T } than Record<string, T>
    'object-shorthand': 'warn',
    'prefer-numeric-literals': 'warn', // 0b111110111 === 503
    'prefer-regex-literals': 'warn', // RegEx
    'spaced-comment': ['warn', 'always', { line: { markers: ['/'] } }],
    // 'no-else-return': 'warn',
    // 'unicorn/comment-content': 'warn', // comment content should use corret spelling

    // Consistency
    '@masknet/prefer-early-return': 'warn',
    '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }], // prefer T[] than Array<T>
    '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'as' /* objectLiteralTypeAssertions: 'never' */ },
    ], // prefer a as T than <T>a, and bans it on object literal
    'unicorn/relative-url-style': ['warn', 'always'], // prefer relative url starts with ./
    // '@masknet/jsx-no-template-literal': 'warn',
    // '@masknet/no-redundant-variable': 'warn',
    // '@masknet/no-single-return': 'warn',
    yoda: 'warn',

    // Naming convention
    // 'func-name-matching': 'warn',
    // 'new-cap': 'warn',

    // Bad practice
    '@typescript-eslint/default-param-last': 'warn', // (a, b = 1, c)
    'no-multi-assign': 'warn', // a = b = c
    'no-promise-executor-return': 'error', // new Promise(() => result)
    'no-return-assign': 'warn', // return x = expr
    // 'no-param-reassign': 'warn',
    /// Async functions / Promise bad practice

    // No unused
    'tss-unused-classes/unused-classes': 'warn',
    // 'unicorn/no-unused-properties': 'warn',
}

/** @type {Partial<import('eslint/config').Config['rules']>} */
const moduleSystemRules = {
    '@typescript-eslint/no-restricted-imports': [
        'error',
        {
            paths: [
                { name: 'uuid', message: 'Use crypto.randomUUID() instead.' },
                { name: 'async-call-rpc', message: 'Please use async-call-rpc/full instead.', allowTypeImports: true },
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
                {
                    name: '@mui/material',
                    importNames: ['alpha'],
                    message: 'Use theme.vars.palette and alpha from @masknet/theme instead.',
                },
                {
                    name: 'viem',
                    message:
                        'Use toHex from @masknet/shared-base. They have different behaviors on "0x-" strings. If you want to use the original toHex, import it like import { toHex as viem_toHex } from "viem".',
                    importNames: ['toHex'],
                },
                {
                    name: 'react-use',
                    importNames: ['useLocalStorage'],
                    message:
                        "If you're in the chrome-extension:// pages, localStorage is discouraged. If you're in the content scripts, we can only use localStorage to read websites' data and MUST NOT store our own data.",
                },
                {
                    name: '@masknet/kit',
                    importNames: ['formatFileSize'],
                    message: 'Please use formatFileSize in @masknet/shared instead.',
                },
            ],
        },
    ],
    'import/no-restricted-paths': [
        'error',
        {
            zones: [
                {
                    target: './packages/mask/background/**',
                    from: './packages/mask/shared-ui/',
                    message: 'Background cannot import Ui specific code.',
                },
                {
                    target: './packages/mask/shared/**',
                    from: './packages/mask/shared-ui/',
                    message: 'packages/mask/shared cannot import services. Move it to packages/mask/shared-ui instead.',
                },
                {
                    target: './packages/mask/!(background)/**',
                    from: './packages/mask/background/',
                    message: 'Use Services.* instead.',
                },
                {
                    target: './packages/mask/',
                    from: [
                        './packages/plugin-infra/src/dom/context.ts',
                        './packages/plugin-infra/src/site-adaptor/context.ts',
                    ],
                    message: 'Use Services.* instead.',
                },
                // ideally shared folder should also bans import plugin context
                // but that requires a lot of context passing. we leave it as a legacy escape path.
                {
                    target: './packages/!(plugins|plugin-infra|shared)/**',
                    from: [
                        './packages/plugin-infra/src/dom/context.ts',
                        './packages/plugin-infra/src/site-adaptor/context.ts',
                    ],
                    message: 'Only plugins can import plugin context.',
                },
            ],
        },
    ],

    // Style
    'import/no-named-default': 'warn', // bans import { default as T }
    'import/no-useless-path-segments': 'warn',
    'import/no-webpack-loader-syntax': 'error',
    // 'import/no-anonymous-default-export': 'error',
    'import/no-duplicates': 'warn', // duplicate specifiers
    'import/no-empty-named-blocks': 'warn', // bans import T, {}
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/consistent-type-exports': ['warn', { fixMixedExportsWithInlineTypeSpecifier: true }],
    '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
            prefer: 'type-imports',
            disallowTypeAnnotations: false,
            fixStyle: 'inline-type-imports',
        },
    ],
    'no-useless-rename': 'error',

    // Avoid mistake
    // 'import/first': 'warn', // ES import always runs first even if you inserted some statements inside.
    // TypeError: context.getDeclaredVariables is not a function
    'import/no-absolute-path': 'error',
    // 'import/no-cycle': 'warn',
    // 'import/no-extraneous-dependencies': 'error', // import from devDependencies might be a mistake
    // 'import/no-nodejs-modules': 'error',
    // 'import/no-relative-packages': 'error', // bans import '../../another-package', should import the workspace package instead
    'import/no-self-import': 'error',
    // 'import/no-unassigned-import': 'error', // bans `import 'x'`. side-effect only imports should be explicitly marked.
    '@typescript-eslint/no-import-type-side-effects': 'warn',
    '@masknet/require-project-reference': [
        'error',
        { ignore: ['@masknet/web3-contracts', '@bonfida/spl-name-service', '@masknet/icons', '@scamsniffer/detector'] },
    ],

    // performance
    '@masknet/prefer-defer-import': [
        'warn',
        {
            deferPackages,
        },
    ],
}

/** @type {any} */
const plugins = {
    js: eslint,
    'tss-unused-classes': UnusedClassesPlugin,
    import: ImportPlugin,
    unicorn: unicorn,
    '@typescript-eslint': tseslint.plugin,
    '@masknet': MasknetPlugin,
    'unused-imports': UnusedImportsPlugin,
    'react-compiler': ReactCompilerPlugin,
    '@tanstack/query': tanstackReactQuery,
    lingui: lingui,
}
export default defineConfig(
    {
        name: 'maskbook/settings',
        settings: {
            react: { version: '18.3' },
            'import-x/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import-x/resolver-next': [createTypeScriptImportResolver({})],
        },
    },
    {
        name: 'maskbook/ignores',
        ignores: [
            '**/*.d.ts',
            '**/public',
            '**/build',
            '**/dist',
            '**/i18n_generated.ts',
            '**/languages.ts',
            'packages/contracts',
            'packages/mask/.webpack',
        ],
    },
    {
        name: 'maskbook/typescript',
        files: ['packages/**/*.ts', 'packages/**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                warnOnUnsupportedTypeScriptVersion: false,
                allowAutomaticSingleRunInference: true,
            },
        },
        plugins,
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        extends: [
            eslint.configs.recommended,
            unicorn.configs.recommended,
            lingui.configs['flat/recommended'],
            ...tanstackReactQuery.configs['flat/recommended-strict'],
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            eslintReact.configs['strict-type-checked'],
            eslintReact.configs['disable-rsc'],
        ],
        rules: {
            ...disabledRules,
            ...avoidMistakeRules,
            ...codeStyleRules,
            ...moduleSystemRules,
        },
    },
    {
        name: 'maskbook/background',
        files: ['packages/mask/background/**/*.ts'],
        plugins,
        rules: {
            'no-restricted-globals': ['error', 'setTimeout', 'setInterval'],
        },
    },
    {
        name: 'maskbook/tests',
        files: ['packages/**/tests/**/*.ts'],
        rules: {
            'unicorn/consistent-function-scoping': 'off',
            'unicorn/template-indent': 'off',
        },
    },
    {
        name: 'scripts',
        files: ['packages/**/scripts/**/*.ts'],
        rules: {
            'unicorn/no-process-exit': 'off',
        },
    },
    {
        name: 'maskbook/shared',
        files: ['packages/mask/shared/**/*.ts', 'packages/mask/shared/**/*.tsx'],
        rules: {
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: '#services',
                            message:
                                'packages/mask/shared cannot import services. Move it to packages/mask/shared-ui instead.',
                        },
                    ],
                },
            ],
        },
    },
    {
        name: 'maskbook/non-ui-lingui',
        files: ['packages/**/*.ts', 'packages/**/*.tsx'],
        ignores: [
            'packages/shared/**/*',
            'packages/shared-base-ui/**/*',
            'packages/mask/content-script/**/*',
            'packages/mask/dashboard/**/*',
            'packages/mask/popups/**/*',
            'packages/mask/shared/**/*',
            'packages/mask/shared-ui/**/*',
            'packages/mask/swap/**/*',
            'packages/theme/**/*',
            'packages/plugins/**/*',
        ],
        rules: {
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    paths: [
                        { name: '@lingui/react', message: 'Non-UI packages must not reference @lingui/react.' },
                        { name: '@lingui/marco', message: 'Non-UI packages must not reference @lingui/marco.' },
                    ],
                },
            ],
        },
    },
)
