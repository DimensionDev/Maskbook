// cSpell:disable
// @ts-check
import tseslint from 'typescript-eslint'
import UnicornPlugin from 'eslint-plugin-unicorn'
import UnusedImportsPlugin from 'eslint-plugin-unused-imports'
import UnusedClassesPlugin from 'eslint-plugin-tss-unused-classes'
import ReactHooksPlugin from 'eslint-plugin-react-hooks'
// @ts-expect-error
import ImportPlugin from 'eslint-plugin-i'
import ReactPlugin from '@eslint-react/eslint-plugin'
import MasknetPlugin from '@masknet/eslint-plugin'
import ReactQueryPlugin from '@tanstack/eslint-plugin-query'
// @ts-expect-error
import LinguiPlugin from 'eslint-plugin-lingui'
import { fixupPluginRules } from '@eslint/compat'

const deferPackages = [
    'wallet.ts',
    'anchorme',
    '@blocto/fcl',
    '@metamask/eth-sig-util',
    '@masknet/gun-utils',
    'web3-eth',
    'web3-eth-accounts',
    'twitter-text',
    'web3-utils',
    'web3-eth-abi',
    '@solana/web3.js',
    '@project-serum/sol-wallet-adapter',
    // add package names here.
]

// Prefer rules from @typescript-eslint > unicorn > other plugins
// Level: if the rule is fixable and can be tolerate during dev, use 'warn' is better.
//        if the fix needs big rewrite (e.g. XHR => fetch), use 'error' to notice the developer early.
//        for RegEx rules, always uses 'error'.

const avoidMistakeRules = {
    // Libraries
    '@tanstack/query/stable-query-client': 'error',
    '@tanstack/query/no-rest-destructuring': 'error',
    '@lingui/no-single-tag-to-translate': 'error',
    // '@lingui/no-single-variables-to-translate': 'error', // we're mixing two i18n frameworks, a lot of false positive reports
    // https://github.com/lingui/eslint-plugin/issues/46
    // '@lingui/no-unlocalized-strings': 'error',
    '@lingui/no-trans-inside-trans': 'error',
    '@lingui/t-call-in-function': 'error',

    // Code quality
    'no-invalid-regexp': 'error', // RegEx
    'unicorn/no-abusive-eslint-disable': 'error', // disable a rule requires a reason
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
    'react/no-children-count': 'error',
    'react/no-children-for-each': 'error',
    // 'react/no-children-map': 'error',
    'react/no-children-only': 'error',
    // 'react/no-children-prop': 'error',
    'react/no-children-to-array': 'error',
    // 'react/no-clone-element': 'error',
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
    '@typescript-eslint/no-wrapper-object-types': 'error',
    /// Unicode support
    'no-misleading-character-class': 'error', // RegEx
    // 'require-unicode-regexp': 'error', // RegEx modern RegEx with Unicode support
    // 'unicorn/prefer-code-point': 'error',
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
    'no-script-url': 'error', // javascript:
    // 'unicorn/require-post-message-target-origin': 'warn', // postMessage(data, 'origin')
    'react/dom/no-dangerously-set-innerhtml': 'error', // dangerouslySetInnerHTML
    'react/dom/no-dangerously-set-innerhtml-with-children': 'error', // dangerouslySetInnerHTML + children
    'react/dom/no-missing-iframe-sandbox': 'error', // <iframe sandbox="..." />
    'react/dom/no-script-url': 'error', // javascript:
    'react/dom/no-unsafe-iframe-sandbox': 'error', // <iframe sandbox="..." />
    'react/dom/no-unsafe-target-blank': 'error',
    '@typescript-eslint/no-implied-eval': 'error', // setTimeout('code')
    '@masknet/browser-no-set-html': 'error', // .innerHTML =
    // '@masknet/string-no-data-url': 'error', // data:...
    '@masknet/unicode-no-bidi': 'error',
    '@masknet/unicode-no-invisible': 'error',
    '@masknet/unicode-specific-set': 'off',

    // Confusing code
    'no-bitwise': 'error', // need mark out
    'no-constant-binary-expression': 'error', // a + b ?? c
    'no-control-regex': 'error', // RegEx
    'no-div-regex': 'error', // RegEx
    'no-label-var': 'warn', // name collision
    'no-plusplus': 'warn', // ++i? i++?
    'no-sequences': 'warn', // (a, b)
    '@typescript-eslint/no-confusing-non-null-assertion': 'error', // a! == b

    // Problematic language features
    /// API with trap
    radix: 'warn', // parseInt('1', _required_)
    'unicorn/require-array-join-separator': 'warn', // Array.join(_required_)
    // This rule breaks BigNumber class which has different .toFixed() default value.
    // 'unicorn/require-number-to-fixed-digits-argument': 'warn', // Number#toFixed(_required_)
    'react/dom/no-missing-button-type': 'error', // default type is "submit" which refresh the page
    '@typescript-eslint/require-array-sort-compare': 'error', // Array#sort(_required_)
    '@masknet/type-no-instanceof-wrapper': 'warn', // bans `expr instanceof String` etc
    /// Footgun language features
    'no-compare-neg-zero': 'error', // x === -0 is wrong
    'no-new-wrappers': 'error', // wrapper objects are bad
    'no-unsafe-finally': 'error', // finally { return expr }
    'unicorn/no-thenable': 'error', // export function then()
    'no-loss-of-precision': 'error', // 5123000000000000000000000000001 is 5123000000000000000000000000000 actually
    '@typescript-eslint/prefer-enum-initializers': 'warn', // add a new item in the middle is an API breaking change.
    /// Little-known language features
    'no-constructor-return': 'error', // constructor() { return expr }
    'react/dom/no-namespace': 'error', // <svg:rect> react does not support
    '@typescript-eslint/no-unsafe-declaration-merging': 'error',
    '@typescript-eslint/no-mixed-enums': 'error', // enum { a = 1, b = "b" }
    '@typescript-eslint/prefer-literal-enum-member': 'error', // enum { a = outsideVar }

    // Prevent bugs
    // 'array-callback-return': 'error', // .map .some ... calls should have a return value
    'default-case-last': 'error', // default: should be the last
    eqeqeq: 'error', // ===
    'no-cond-assign': 'error', // if (a = b)
    'no-duplicate-case': 'error', // switch
    'no-empty-character-class': 'error', // RegEx /[]/ means a empty character class, not "[]"
    'no-global-assign': 'error', // onmessage = ...
    'no-self-assign': 'error', // a = a
    'no-self-compare': 'error', // a === a
    'no-sparse-arrays': 'error', // [,, 1]
    'no-unmodified-loop-condition': 'error', // loop bug
    'no-unreachable-loop': 'error', // loop bug
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
    'no-template-curly-in-string': 'error', // "${expr}" looks like a bug
    // 'require-atomic-updates': 'error', // await/yield race condition
    'valid-typeof': 'error', // typeof expr === undefined
    'unicorn/no-invalid-remove-event-listener': 'error', // removeEventListener('click', f.bind(...))
    'unicorn/no-negation-in-equality-check': 'error', // !foo === bar
    'react/dom/no-children-in-void-dom-elements': 'warn', // <img>children</img>
    'react/web-api/no-leaked-event-listener': 'warn', // addEventListener in hooks without removeEventListener
    'react/web-api/no-leaked-interval': 'warn', // setInterval in hooks without clearInterval
    'react/web-api/no-leaked-timeout': 'warn', // setTimeout in hooks without clearTimeout
    'react/no-comment-textnodes': 'warn', // <div>// comment</div> will render text!
    // 'react/no-duplicate-key': 'warn', // <div key={1} /> <div key={1} /> this rule has bug?
    'react/no-leaked-conditional-rendering': 'error', // <div>{0 && <Something />}</div> will render "0"!
    'react/no-nested-components': 'error', // rerender bugs
    'react-hooks/rules-of-hooks': 'error', // react hooks
    '@typescript-eslint/no-base-to-string': 'error', // prevent buggy .toString() call
    '@typescript-eslint/no-loop-func': 'warn', // capture a loop variable might be a bug
    '@typescript-eslint/no-duplicate-enum-values': 'error', // enum { a = 1, b = 1 }
    '@masknet/string-no-locale-case': 'error', // in non-i18n cases use locale-aware string methods are wrong

    // Performance
    'react/no-missing-key': 'warn',
    'react/no-unstable-context-value': 'warn',
    'react/no-unstable-default-props': 'warn',
    // 'react/hooks-extra/ensure-use-callback-has-non-empty-deps': 'warn',
    // 'react/hooks-extra/ensure-use-memo-has-non-empty-deps': 'warn',
    'react/hooks-extra/no-direct-set-state-in-use-effect': 'error',
    'react/hooks-extra/prefer-use-state-lazy-initialization': 'warn',
    'unicorn/consistent-function-scoping': 'warn', // hoist unnecessary higher order functions
}
const codeStyleRules = {
    // Deprecated
    'no-alert': 'warn', // alert()
    'no-proto': 'error', // __proto__ accessor
    'no-prototype-builtins': 'error', // bans `obj.hasOwnProperty()` etc
    'no-var': 'error', // var x
    'unicorn/no-new-buffer': 'error', // NodeJS
    'react/no-class-component': 'error',
    // Let's wait for https://github.com/typescript-eslint/typescript-eslint/issues/6572
    // '@typescript-eslint/no-namespace': 'error', // namespace T {}
    '@typescript-eslint/prefer-namespace-keyword': 'error', // but if you really need to, don't use `module T {}`

    // Useless code
    'no-constant-condition': 'warn', // if (false)
    'no-debugger': 'warn',
    'no-extra-bind': 'warn', // unused bind on a function that does not uses this
    'no-extra-boolean-cast': 'warn', // if (!!expr)
    'no-empty-pattern': 'warn', // const { a: {} } = expr
    'no-extra-label': 'warn', // break/continue is ok without label
    'no-unneeded-ternary': 'warn', // expr ? true : false
    'no-useless-backreference': 'error', // RegEx
    'no-useless-call': 'warn', // expr.call(undefined, ...)
    'no-useless-catch': 'warn', // catch (e) { throw e }
    'no-useless-concat': 'warn', // "a" + "b"
    'no-useless-escape': 'warn', // "hol\a"
    // 'no-lone-blocks': 'warn', // no block that not introducing a new scope
    'react/no-useless-fragment': 'warn',
    'unicorn/no-console-spaces': 'warn', // console.log('id: ', id)
    'unicorn/no-empty-file': 'warn',
    'unicorn/no-useless-fallback-in-spread': 'warn', // {...(foo || {})}
    'unicorn/no-useless-length-check': 'warn', // array.length === 0 || array.every(...)
    'unicorn/no-useless-promise-resolve-reject': 'warn', // return Promise.resolve(value) in async function
    // 'unicorn/no-useless-spread': 'warn', // new Set([...iterable])
    'unicorn/no-zero-fractions': 'warn', // 1.0
    'unicorn/prefer-export-from': 'warn', // prefer export { } from than import-and-export
    'unicorn/prefer-native-coercion-functions': 'warn', // no coercion wrapper v => Boolean(v)
    '@typescript-eslint/await-thenable': 'warn', // await 1
    // '@typescript-eslint/no-empty-interface': 'warn', // interface T extends Q {}
    '@typescript-eslint/no-extra-non-null-assertion': 'warn', // foo!!!.bar
    // '@typescript-eslint/no-inferrable-types': 'warn', // let x: number = 1
    '@typescript-eslint/no-meaningless-void-operator': 'warn', // void a_void_call()
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'warn', // foo! ?? bar
    // '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn', // no if (nullable_bool === true)
    // '@typescript-eslint/no-unnecessary-condition': 'warn', // no if (some_object)
    '@typescript-eslint/no-unnecessary-qualifier': 'warn', // no extra qualifier in enum/namespace
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn', // provided type argument equals the default
    // Note: this rule seems like does not have the correct type checking behavior. before typescript-eslint has project reference support, don't use it.
    // '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // non_nullable!
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn', // T extends any
    // '@typescript-eslint/no-useless-constructor': 'warn', // empty constructor
    // '@typescript-eslint/no-useless-empty-export': 'warn', // export {}
    // '@typescript-eslint/no-redundant-type-constituents': 'warn', // type Q = any | T
    // '@masknet/array-no-unneeded-flat-map': 'warn', // bans Array#flatMap((x) => x)
    '@masknet/string-no-unneeded-to-string': 'warn', // useless .toString()
    '@masknet/string-no-simple-template-literal': 'warn', // prefer simple string

    // Prefer modern things
    'prefer-const': 'warn',
    // 'prefer-exponentiation-operator': 'warn', // **
    // 'prefer-named-capture-group': 'warn', // RegEx
    'prefer-object-has-own': 'warn',
    // 'prefer-object-spread': 'warn', // { ... } than Object.assign
    // 'prefer-rest-params': 'warn',

    'unicorn/no-document-cookie': 'error', // even if you have to do so, use CookieJar
    'unicorn/prefer-keyboard-event-key': 'warn',
    'unicorn/prefer-add-event-listener': 'warn',
    // 'unicorn/prefer-array-find': 'warn',
    // 'unicorn/prefer-array-flat': 'warn',
    // 'unicorn/prefer-array-flat-map': 'warn',
    'unicorn/prefer-array-index-of': 'warn',
    // 'unicorn/prefer-array-some': 'warn',
    'unicorn/prefer-at': 'warn',
    'unicorn/prefer-blob-reading-methods': 'warn',
    'unicorn/prefer-date-now': 'warn',
    // 'unicorn/prefer-dom-node-append': 'warn',
    'unicorn/prefer-dom-node-dataset': 'warn',
    // 'unicorn/prefer-dom-node-remove': 'warn',
    // 'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-event-target': 'warn', // prevent use of Node's EventEmitter
    'unicorn/prefer-math-trunc': 'warn',
    'unicorn/prefer-modern-dom-apis': 'warn',
    'unicorn/prefer-modern-math-apis': 'warn',
    // 'unicorn/prefer-object-from-entries': 'warn',
    // 'unicorn/prefer-query-selector': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'unicorn/prefer-reflect-apply': 'warn',
    // 'unicorn/prefer-set-has': 'warn',
    'unicorn/prefer-set-size': 'warn',
    // 'unicorn/prefer-spread': 'warn', // prefer [...] than Array.from
    'unicorn/prefer-string-replace-all': 'warn', // str.replaceAll(...)
    'unicorn/prefer-string-slice': 'warn',
    'unicorn/prefer-string-trim-start-end': 'warn', // str.trimStart(...)
    '@typescript-eslint/no-this-alias': 'warn',
    '@masknet/jsx-no-class-component': 'error',
    // '@masknet/type-no-number-constructor': 'warn',
    // '@masknet/array-prefer-from': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-includes': 'warn',
    '@typescript-eslint/no-for-in-array': 'warn',
    // '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@masknet/browser-prefer-location-assign': 'warn',
    // '@masknet/no-unsafe-date': 'error', // use date-fns or Temporal instead
    '@masknet/prefer-fetch': 'error',

    // Better debug
    // 'prefer-promise-reject-errors': 'warn', // Promise.reject(need_error)
    'symbol-description': 'warn', // Symbol(desc)
    // 'react/no-missing-component-display-name': 'warn',
    'unicorn/catch-error-name': ['warn', { ignore: ['^err$'] }], // catch (err)
    // 'unicorn/custom-error-definition': 'warn', // correctly extends the native error
    // 'unicorn/error-message': 'warn', // error must have a message
    // 'unicorn/prefer-type-error': 'warn', // prefer TypeError
    // '@typescript-eslint/only-throw-error': 'warn', // no throw 'string'

    // API design
    // '@typescript-eslint/no-extraneous-class': 'error', // no class with only static members
    // '@typescript-eslint/prefer-readonly': 'error',
    // '@typescript-eslint/prefer-readonly-parameter-types': 'error',

    // More readable code
    // 'max-lines': ['warn', { max: 400 }],
    // 'no-dupe-else-if': 'warn', // different condition with same if body
    // 'no-else-return': 'warn',
    'no-regex-spaces': 'error', // RegEx
    'object-shorthand': 'warn',
    'prefer-numeric-literals': 'warn', // 0b111110111 === 503
    'prefer-regex-literals': 'warn', // RegEx
    'spaced-comment': ['warn', 'always', { line: { markers: ['/'] } }],
    // 'unicorn/no-array-reduce': 'warn',
    // 'unicorn/no-array-push-push': 'warn',
    // 'unicorn/no-lonely-if': 'warn', // else if (a) { if (b) expr }
    // 'unicorn/no-negated-condition': 'warn', // if (!a) else
    // 'unicorn/no-nested-ternary': 'warn', // a ? b : c ? d : e
    // 'unicorn/no-typeof-undefined': 'warn', // typeof expr !== 'undefined'
    // 'unicorn/no-unreadable-array-destructuring': 'warn', // [,, foo] = parts
    'unicorn/no-unreadable-iife': 'warn', // (bar => (bar ? bar.baz : baz))(getBar())
    // 'unicorn/prefer-negative-index': 'warn',
    'unicorn/throw-new-error': 'warn',
    // 'unicorn/prefer-logical-operator-over-ternary': 'warn', // prefer ?? and ||
    // 'unicorn/prefer-optional-catch-binding': 'warn', // prefer to omit catch binding
    'react/prefer-shorthand-boolean': 'warn',
    'react/prefer-shorthand-fragment': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',

    // Consistency
    'no-irregular-whitespace': 'warn', // unusual but safe
    yoda: 'warn',
    'unicorn/better-regex': 'error', // RegEx
    'unicorn/escape-case': 'warn', // correct casing of escape '\xA9'
    'unicorn/no-hex-escape': 'warn', // correct casing of escape '\u001B'
    // 'unicorn/numeric-separators-style': 'warn', // correct using of 1_234_567
    'unicorn/prefer-prototype-methods': 'warn', // prefer Array.prototype.slice than [].slice
    'unicorn/relative-url-style': ['warn', 'always'], // prefer relative url starts with ./
    // 'unicorn/text-encoding-identifier-case': 'warn', // prefer 'utf-8' than 'UTF-8'
    '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }], // prefer T[] than Array<T>
    // '@typescript-eslint/consistent-generic-constructors': 'warn', // prefer const map = new Map<string, number>() than generics on the left
    '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'as' /* objectLiteralTypeAssertions: 'never' */ },
    ], // prefer a as T than <T>a, and bans it on object literal
    // '@typescript-eslint/consistent-type-definitions': 'warn', // prefer interface, also has better performance when type checking
    '@typescript-eslint/dot-notation': 'warn', // prefer a.b than a['b']
    '@typescript-eslint/no-array-constructor': 'warn',
    // '@typescript-eslint/non-nullable-type-assertion-style': 'warn', // prefer a! than a as T
    // '@typescript-eslint/prefer-function-type': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
    // '@typescript-eslint/sort-type-constituents': 'warn',
    // '@typescript-eslint/triple-slash-reference': ['error', { lib: 'never', path: 'never', types: 'always' }],
    // '@typescript-eslint/unified-signatures': 'warn', // prefer merging overload
    '@masknet/prefer-early-return': 'warn',
    // '@masknet/no-redundant-variable': 'warn',
    // '@masknet/no-single-return': 'warn',
    // '@masknet/jsx-no-template-literal': 'warn',

    // Naming convension
    // 'func-name-matching': 'warn',
    // 'new-cap': 'warn',
    'react/naming-convention/component-name': ['warn', { rule: 'PascalCase' }],
    // 'react/naming-convention/file-name': ['warn', { rule: 'PascalCase' }],

    // Bad practice
    'no-ex-assign': 'warn', // reassign err in catch
    // 'no-multi-assign': 'warn', // a = b = c
    // 'no-param-reassign': 'warn',
    // 'no-return-assign': 'warn', // return x = expr
    // 'unicorn/no-object-as-default-parameter': 'warn',
    // '@typescript-eslint/default-param-last': 'warn', // (a, b = 1, c)
    // '@typescript-eslint/no-dynamic-delete': 'error', // this usually means you should use Map/Set
    /// Async functions / Promise bad practice
    'no-async-promise-executor': 'error', // new Promise(async (resolve) => )
    'no-promise-executor-return': 'error', // new Promise(() => result)
    // '@typescript-eslint/no-floating-promises': 'warn', // unhandled promises
    // '@typescript-eslint/promise-function-async': 'warn', // avoid Zalgo
    '@typescript-eslint/return-await': 'warn', // return await expr

    // No unused
    'no-unused-labels': 'warn',
    'tss-unused-classes/unused-classes': 'warn',
    // 'unicorn/no-unused-properties': 'warn',
    // '@typescript-eslint/no-unused-expressions': 'warn',
    // '@typescript-eslint/no-unused-vars': 'warn',
}
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
                    name: 'react-use',
                    importNames: ['useLocalStorage'],
                    message:
                        "If you're in the chrome-extension:// pages, localStorage is discouraged. If you're in the content scripts, we can only use localStorage to read websites' data and MUST NOT store our own data.",
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
    // 'unicorn/prefer-node-protocol': 'warn',
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
    // '@typescript-eslint/no-import-type-side-effects': 'warn',

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
    'tss-unused-classes': UnusedClassesPlugin,
    react: ReactPlugin,
    import: ImportPlugin,
    unicorn: UnicornPlugin,
    '@typescript-eslint': tseslint.plugin,
    '@masknet': MasknetPlugin,
    'unused-imports': UnusedImportsPlugin,
    'react-hooks': ReactHooksPlugin,
    '@tanstack/query': ReactQueryPlugin,
    '@lingui': fixupPluginRules(LinguiPlugin),
}
export default tseslint.config(
    {
        settings: {
            react: { version: '18.3' },
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {},
            },
        },
    },
    {
        ignores: [
            '**/*.d.ts',
            '**/public',
            '**/build',
            '**/dist',
            '**/i18n_generated.ts',
            '**/languages.ts',
            'packages/contracts',
            'packages/scripts',
            'packages/mask/.webpack',
        ],
    },
    {
        files: ['packages/**/*.ts', 'packages/**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                projectService: true,
                // @ts-expect-error
                tsconfigRootDir: import.meta.dirname,
                warnOnUnsupportedTypeScriptVersion: false,
                allowAutomaticSingleRunInference: true,
            },
        },
        plugins,
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        rules: /** @type {any} */ ({
            ...avoidMistakeRules,
            ...codeStyleRules,
            ...moduleSystemRules,
        }),
    },
    {
        files: ['packages/mask/background/**/*.ts'],
        plugins,
        rules: {
            'no-restricted-globals': ['error', 'setTimeout', 'setInterval'],
        },
    },
    {
        files: ['packages/**/tests/**/*.ts'],
        rules: {
            'unicorn/consistent-function-scoping': 'off',
        },
    },
    {
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
