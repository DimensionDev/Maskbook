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
import ReactPlugin from '@eslint-react/eslint-plugin'
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
    'web3-eth',
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
    'no-redeclare': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'unicorn/no-optional-chaining-on-undeclared-variable': 'off',
    // TypeScript can do the check
    'getter-return': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-invalid-argument-count': 'off',
    // false positives
    'unicorn/no-useless-coercion': 'off',
    'unicorn/prefer-spread': 'off', // TypedArrays
    'unicorn/require-number-to-fixed-digits-argument': 'off', // BigNumber
    // WebExtension: in Firefox content scripts, window !== globalThis (instanceof SandBox).
    'unicorn/no-unnecessary-global-this': 'off',
    'unicorn/prefer-global-this': 'off',
    // with Prettier
    'unicorn/number-literal-case': 'off',

    // bad practice
    'unicorn/prefer-top-level-await': 'off', // top-level await is bad for applications. scripts are ok.

    // too strict
    'lingui/no-expression-in-message': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-await-expression-member': 'off',
    'unicorn/no-break-in-nested-loop': 'off',
    'unicorn/no-computed-property-existence-check': 'off',

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

    // TODO: review, maybe add them back
    '@tanstack/query/prefer-query-options': 'off',
    'unicorn/consistent-boolean-name': 'off',
    'unicorn/consistent-compound-words': 'off',
    'unicorn/name-replacements': 'off',
    'unicorn/no-top-level-assignment-in-function': 'off',
    'unicorn/no-top-level-side-effects': 'off',
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
    '@eslint-react/no-children-count': 'error',
    '@eslint-react/no-children-for-each': 'error',
    // '@eslint-react/no-children-map': 'error',
    '@eslint-react/no-children-only': 'error',
    // '@eslint-react/no-children-prop': 'error',
    '@eslint-react/no-children-to-array': 'error',
    // '@eslint-react/no-clone-element': 'error',
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
    // '@typescript-eslint/no-invalid-void-type': 'warn', // Disallow void type outside of generic or return types
    '@typescript-eslint/no-misused-new': 'error', // wrong 'new ()' or 'constructor()' signatures
    '@typescript-eslint/no-unsafe-function-type': 'error',
    // '@typescript-eslint/no-unsafe-type-assertion': 'error', // bans `expr as T`
    '@typescript-eslint/no-wrapper-object-types': 'error',
    /// Unicode support
    'require-unicode-regexp': 'error', // RegEx modern RegEx with Unicode support
    // '@masknet/no-builtin-base64': 'warn', // Note: it fixes to Node's Buffer
    /// type safety
    // '@typescript-eslint/method-signature-style': 'warn', // method signature is bivariant
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error', // bans foo?.bar!
    // '@typescript-eslint/no-unsafe-argument': 'error', // bans call(any)
    // '@typescript-eslint/no-unsafe-assignment': 'error', // bans a = any
    // '@typescript-eslint/no-unsafe-call': 'error', // bans any()
    // '@typescript-eslint/no-unsafe-member-access': 'error', // bans a = any.prop
    // '@typescript-eslint/no-unsafe-return': 'error', // bans return any
    '@typescript-eslint/prefer-return-this-type': 'error', // use `: this` properly
    // '@typescript-eslint/restrict-plus-operands': 'error', // stronger `a + b` check
    // '@typescript-eslint/restrict-template-expressions': 'error', // bans `${nonString}`
    // '@typescript-eslint/strict-boolean-expressions': 'error', // stronger check for nullable string/number/boolean
    // '@typescript-eslint/switch-exhaustiveness-check': 'error', // switch should be exhaustive
    // '@typescript-eslint/unbound-method': 'error', // requires `this` to be set properly
    // '@masknet/type-no-force-cast-via-top-type': 'error', // expr as any as T

    // Security
    '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error', // dangerouslySetInnerHTML + children
    '@eslint-react/dom-no-dangerously-set-innerhtml': 'error', // dangerouslySetInnerHTML
    '@eslint-react/dom-no-missing-iframe-sandbox': 'error', // <iframe sandbox="..." />
    '@eslint-react/dom-no-script-url': 'error', // javascript:
    '@eslint-react/dom-no-unsafe-iframe-sandbox': 'error', // <iframe sandbox="..." />
    '@eslint-react/dom-no-unsafe-target-blank': 'error',
    '@masknet/browser-no-set-html': 'error', // .innerHTML =
    '@masknet/unicode-no-bidi': 'error',
    '@masknet/unicode-no-invisible': 'error',
    '@masknet/unicode-specific-set': 'off',
    '@typescript-eslint/no-implied-eval': 'error', // setTimeout('code')
    'no-script-url': 'error', // javascript:
    'unicorn/no-unsafe-dom-html': 'error',
    // '@masknet/string-no-data-url': 'error', // data:...
    // 'unicorn/require-post-message-target-origin': 'warn', // postMessage(data, 'origin')

    // Confusing code
    '@typescript-eslint/no-confusing-non-null-assertion': 'error', // a! == b
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
    '@eslint-react/dom-no-missing-button-type': 'error', // default type is "submit" which refresh the page
    '@typescript-eslint/require-array-sort-compare': 'error', // Array#sort(_required_)
    /// Footgun language features
    '@typescript-eslint/prefer-enum-initializers': 'warn', // add a new item in the middle is an API breaking change.
    'no-new-wrappers': 'error', // wrapper objects are bad
    /// Little-known language features
    '@eslint-react/jsx-no-namespace': 'error', // <svg:rect> react does not support
    '@typescript-eslint/no-mixed-enums': 'error', // enum { a = 1, b = "b" }
    '@typescript-eslint/no-unsafe-declaration-merging': 'error',
    '@typescript-eslint/prefer-literal-enum-member': 'error', // enum { a = outsideVar }
    'no-constructor-return': 'error', // constructor() { return expr }

    // Prevent bugs
    '@eslint-react/dom-no-void-elements-with-children': 'warn', // <img>children</img>
    '@eslint-react/jsx-no-comment-textnodes': 'warn', // <div>// comment</div> will render text!
    '@eslint-react/no-leaked-conditional-rendering': 'error', // <div>{0 && <Something />}</div> will render "0"!
    '@eslint-react/no-nested-component-definitions': 'error', // rerender bugs
    '@eslint-react/no-nested-lazy-component-declarations': 'error', // rerender bugs
    '@eslint-react/rules-of-hooks': 'error', // react hooks
    '@eslint-react/web-api-no-leaked-event-listener': 'warn', // addEventListener in hooks without removeEventListener
    '@eslint-react/web-api-no-leaked-interval': 'warn', // setInterval in hooks without clearInterval
    '@eslint-react/web-api-no-leaked-resize-observer': 'warn', // new ResizeObserver in hooks without disconnect
    '@eslint-react/web-api-no-leaked-timeout': 'warn', // setTimeout in hooks without clearTimeout
    '@masknet/string-no-locale-case': 'error', // in non-i18n cases use locale-aware string methods are wrong
    '@typescript-eslint/no-base-to-string': 'error', // prevent buggy .toString() call
    '@typescript-eslint/no-duplicate-enum-values': 'error', // enum { a = 1, b = 1 }
    '@typescript-eslint/no-loop-func': 'warn', // capture a loop variable might be a bug
    'default-case-last': 'error', // default: should be the last
    'no-duplicate-case': 'error', // switch
    'no-self-compare': 'error', // a === a
    'no-template-curly-in-string': 'error', // "${expr}" looks like a bug
    'no-unmodified-loop-condition': 'error', // loop bug
    'no-unreachable-loop': 'error', // loop bug
    'unicorn/no-invalid-file-input-accept': 'error', // <input type="file" accept="invalid" />
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
    // '@eslint-react/no-duplicate-key': 'warn', // <div key={1} /> <div key={1} /> this rule has bug?
    // 'require-atomic-updates': 'error', // await/yield race condition

    // Performance
    '@eslint-react/no-missing-key': 'warn',
    '@eslint-react/no-unstable-context-value': 'warn',
    '@eslint-react/no-unstable-default-props': 'warn',
    '@eslint-react/set-state-in-effect': 'error',
    '@eslint-react/use-state': [
        'warn',
        { enforceAssignment: false, enforceLazyInitialization: true, enforceSetterName: false },
    ],
}

/** @type {Partial<import('eslint/config').Config['rules']>} */
const codeStyleRules = {
    // Deprecated
    '@eslint-react/no-class-component': 'error',
    '@eslint-react/no-context-provider': 'error',
    '@eslint-react/no-forward-ref': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error', // but if you really need to, don't use `module T {}`
    'no-alert': 'warn', // alert()
    'no-proto': 'error', // __proto__ accessor
    'no-var': 'error', // var x
    // '@typescript-eslint/no-namespace': 'error', // namespace T {}, they won't support type only namespace

    // Useless code
    '@eslint-react/jsx-no-useless-fragment': ['warn', { allowEmptyFragment: true }],
    '@eslint-react/no-missing-context-display-name': 'warn',
    '@masknet/string-no-simple-template-literal': 'warn', // prefer simple string
    '@masknet/string-no-unneeded-to-string': 'warn', // useless .toString()
    '@typescript-eslint/await-thenable': 'warn', // await 1
    '@typescript-eslint/no-extra-non-null-assertion': 'warn', // foo!!!.bar
    '@typescript-eslint/no-meaningless-void-operator': 'warn', // void a_void_call()
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'warn', // foo! ?? bar
    '@typescript-eslint/no-unnecessary-qualifier': 'warn', // no extra qualifier in enum/namespace
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn', // provided type argument equals the default
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn', // T extends any
    'no-extra-bind': 'warn', // unused bind on a function that does not uses this
    'no-extra-label': 'warn', // break/continue is ok without label
    'no-unneeded-ternary': 'warn', // expr ? true : false
    'no-useless-call': 'warn', // expr.call(undefined, ...)
    'no-useless-concat': 'warn', // "a" + "b"
    // '@eslint-react/no-unused-props': 'warn',
    // '@masknet/array-no-unneeded-flat-map': 'warn', // bans Array#flatMap((x) => x)
    // '@typescript-eslint/no-empty-interface': 'warn', // interface T extends Q {}
    // '@typescript-eslint/no-inferrable-types': 'warn', // let x: number = 1
    // '@typescript-eslint/no-redundant-type-constituents': 'warn', // type Q = any | T
    // '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn', // no if (nullable_bool === true)
    // '@typescript-eslint/no-unnecessary-condition': 'warn', // no if (some_object)
    // '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // non_nullable!
    // '@typescript-eslint/no-useless-constructor': 'warn', // empty constructor
    // '@typescript-eslint/no-useless-empty-export': 'warn', // export {}
    // 'no-lone-blocks': 'warn', // no block that not introducing a new scope
    // Note: this rule seems like does not have the correct type checking behavior. before typescript-eslint has project reference support, don't use it.

    // Prefer modern things
    'prefer-const': 'warn',
    'prefer-object-has-own': 'warn',
    'unicorn/prefer-dispose': 'warn',
    'unicorn/prefer-error-is-error': 'warn',
    'unicorn/prefer-import-meta-properties': 'warn',
    'unicorn/prefer-iterator-concat': 'warn',
    'unicorn/prefer-uint8array-base64': 'warn',
    'prefer-exponentiation-operator': 'warn', // **
    // 'prefer-named-capture-group': 'warn', // RegEx
    // 'prefer-object-spread': 'warn', // { ... } than Object.assign
    // 'prefer-rest-params': 'warn',

    // Prefer modern things (web)
    '@masknet/browser-prefer-location-assign': 'warn',
    '@masknet/jsx-no-class-component': 'error',
    '@masknet/prefer-fetch': 'error',
    '@typescript-eslint/no-for-in-array': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-includes': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    'unicorn/prefer-explicit-viewport-units': 'warn',
    // '@masknet/array-prefer-from': 'warn',
    // '@masknet/no-unsafe-date': 'error', // use date-fns or Temporal instead
    // '@masknet/type-no-number-constructor': 'warn',
    // '@typescript-eslint/prefer-nullish-coalescing': 'warn',

    // Better debug
    'symbol-description': 'warn', // Symbol(desc)
    'unicorn/catch-error-name': ['warn', { ignore: ['^err$'] }], // catch (err)
    // '@eslint-react/no-missing-component-display-name': 'warn',
    // '@typescript-eslint/only-throw-error': 'warn', // no throw 'string'
    // 'prefer-promise-reject-errors': 'warn', // Promise.reject(need_error)

    // API design
    // '@typescript-eslint/no-extraneous-class': 'error', // no class with only static members
    // '@typescript-eslint/prefer-readonly-parameter-types': 'error',
    // '@typescript-eslint/prefer-readonly': 'error',

    // More readable code
    '@typescript-eslint/prefer-as-const': 'warn',
    'object-shorthand': 'warn',
    'prefer-numeric-literals': 'warn', // 0b111110111 === 503
    'prefer-regex-literals': 'warn', // RegEx
    'spaced-comment': ['warn', 'always', { line: { markers: ['/'] } }],
    // '@typescript-eslint/no-unnecessary-type-conversion': 'warn', // for code like str.toString()
    // 'max-lines': ['warn', { max: 400 }],
    // 'no-else-return': 'warn',
    // 'unicorn/comment-content': 'warn', // comment content should use corret spelling

    // Consistency
    '@masknet/prefer-early-return': 'warn',
    '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }], // prefer T[] than Array<T>
    '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'as' /* objectLiteralTypeAssertions: 'never' */ },
    ], // prefer a as T than <T>a, and bans it on object literal
    '@typescript-eslint/dot-notation': 'warn', // prefer a.b than a['b']
    '@typescript-eslint/no-array-constructor': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
    'unicorn/relative-url-style': ['warn', 'always'], // prefer relative url starts with ./
    // '@masknet/jsx-no-template-literal': 'warn',
    // '@masknet/no-redundant-variable': 'warn',
    // '@masknet/no-single-return': 'warn',
    // '@typescript-eslint/consistent-generic-constructors': 'warn', // prefer const map = new Map<string, number>() than generics on the left
    // '@typescript-eslint/consistent-type-definitions': 'warn', // prefer interface, also has better performance when type checking
    // '@typescript-eslint/non-nullable-type-assertion-style': 'warn', // prefer a! than a as T
    // '@typescript-eslint/prefer-function-type': 'warn',
    // '@typescript-eslint/sort-type-constituents': 'warn',
    // '@typescript-eslint/triple-slash-reference': ['error', { lib: 'never', path: 'never', types: 'always' }],
    // '@typescript-eslint/unified-signatures': 'warn', // prefer merging overload
    yoda: 'warn',

    // Naming convention
    // 'func-name-matching': 'warn',
    // 'new-cap': 'warn',
    // @eslint-react/naming-convention-context-name
    // @eslint-react/naming-convention-id-name
    // @eslint-react/naming-convention-ref-name

    // Bad practice
    '@typescript-eslint/default-param-last': 'warn', // (a, b = 1, c)
    '@typescript-eslint/no-dynamic-delete': 'error', // this usually means you should use Map/Set
    '@typescript-eslint/return-await': 'warn', // return await expr
    'no-multi-assign': 'warn', // a = b = c
    'no-promise-executor-return': 'error', // new Promise(() => result)
    'no-return-assign': 'warn', // return x = expr
    // '@typescript-eslint/no-floating-promises': 'warn', // unhandled promises
    // '@typescript-eslint/promise-function-async': 'warn', // avoid Zalgo
    // 'no-param-reassign': 'warn',
    /// Async functions / Promise bad practice

    // No unused
    'tss-unused-classes/unused-classes': 'warn',
    // '@typescript-eslint/no-unused-expressions': 'warn',
    // '@typescript-eslint/no-unused-vars': 'warn',
    // 'unicorn/no-unused-properties': 'warn',
}

/** @type {Partial<import('eslint/config').Config['rules']>} */
const moduleSystemRules = {
    '@typescript-eslint/no-restricted-imports': [
        'error',
        {
            paths: [
                { name: 'uuid', message: 'Use crypto.randomUUID() instead.' },
                { name: '@sentry/browser', message: 'Use Sentry.* global object instead.', allowTypeImports: true },
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
    '@eslint-react': ReactPlugin,
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
