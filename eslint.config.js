import TypescriptParser from '@typescript-eslint/parser'

import UnicornPlugin from 'eslint-plugin-unicorn'
import UnusedImportsPlugin from 'eslint-plugin-unused-imports'
import UnusedClassesPlugin from 'eslint-plugin-tss-unused-classes'
import ReactPlugin from 'eslint-plugin-react'
import ReactHooksPlugin from 'eslint-plugin-react-hooks'
// @ts-expect-error
import ImportPlugin from 'eslint-plugin-import'
import TypeScriptPlugin from '@typescript-eslint/eslint-plugin'
// @ts-expect-error
import DimensionDevPlugin from '@dimensiondev/eslint-plugin'

import { pathToFileURL } from 'url'
// this is a patch to https://github.com/typescript-eslint/typescript-eslint/issues/3811
if (pathToFileURL(process.argv[1]).toString().includes('eslint/bin/eslint.js')) {
    // cspell: disable-next-line
    process.env.TSESTREE_SINGLE_RUN = 'true'
}

// Note: update our plugin
Object.keys(DimensionDevPlugin.rules)
    .filter((x) => x.includes('/'))
    .forEach((key) => {
        DimensionDevPlugin.rules[key.replace('/', '-')] = DimensionDevPlugin.rules[key]
    })

// Prefer rules from @typescript-eslint > unicorn > other plugins
// Level: if the rule is fixable and can be tolerate during dev, use 'warn' is better.
//        if the fix needs big rewrite (e.g. XHR => fetch), use 'error' to notice the developer early.
//        for RegEx rules, always uses 'error'.

const avoidMistakeRules = {
    // Code quality
    'no-invalid-regexp': 'error', // RegEx
    // 'unicorn/no-abusive-eslint-disable': 'error', // disable a rule requires a reason
    // '@typescript-eslint/ban-ts-comment': {
    //     'ts-expect-error': 'allow-with-description',
    //     'ts-ignore': false,
    //     'ts-nocheck': false,
    //     'ts-check': true,
    //     minimumDescriptionLength: 5,
    // }, // disable a rule requires a reason
    /// React bad practice
    'react/no-invalid-html-attribute': 'warn',
    'react/void-dom-elements-no-children': 'error', // <img>children</img>
    /// TypeScript bad practice
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-invalid-void-type': 'warn', // Disallow void type outside of generic or return types
    '@typescript-eslint/no-misused-new': 'error', // wrong 'new ()' or 'constructor()' signatures
    /// Unicode support
    'no-misleading-character-class': 'error', // RegEx
    // 'require-unicode-regexp': 'error', // RegEx modern RegEx with Unicode support
    'unicorn/prefer-code-point': 'error',
    // '@dimensiondev/no-builtin-base64': 'warn', // Note: it fixes to Node's Buffer
    /// type safety
    // '@typescript-eslint/method-signature-style': 'warn', // method signature is bivariant
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error', // bans foo?.bar!
    // '@typescript-eslint/no-unsafe-argument': 'error', // bans call(any)
    // '@typescript-eslint/no-unsafe-assignment': 'error', // bans a = any
    // '@typescript-eslint/no-unsafe-call': 'error', // bans any()
    // '@typescript-eslint/no-unsafe-member-access': 'error', // bans a = any.prop
    // '@typescript-eslint/no-unsafe-return': 'error', // bans return any
    '@typescript-eslint/prefer-return-this-type': 'error', // use `: this` properly
    '@typescript-eslint/restrict-plus-operands': 'error', // stronger `a + b` check
    '@typescript-eslint/restrict-template-expressions': 'error', // bans `${nonString}`
    '@typescript-eslint/strict-boolean-expressions': 'error', // stronger check for nullable string/number/boolean
    '@typescript-eslint/switch-exhaustiveness-check': 'error', // switch should be exhaustive
    '@typescript-eslint/unbound-method': 'error', // requires `this` to be set properly
    // '@dimensiondev/type-no-force-cast-via-top-type': 'error', // expr as any as T

    // Security
    'no-script-url': 'error', // javascript:
    'unicorn/require-post-message-target-origin': 'warn', // postMessage(data, 'origin')
    'react/iframe-missing-sandbox': 'warn', // <iframe sandbox="..." />
    'react/jsx-no-script-url': 'error', // javascript:
    'react/no-danger': 'error', // dangerouslySetInnerHTML
    'react/no-danger-with-children': 'error', // dangerouslySetInnerHTML + children
    '@typescript-eslint/no-implied-eval': 'error', // setTimeout('code')
    '@dimensiondev/browser-no-set-html': 'error', // .innerHTML =
    '@dimensiondev/string-no-data-url': 'error', // data:...
    '@dimensiondev/unicode-no-bidi': 'error',
    '@dimensiondev/unicode-no-invisible': 'error',
    '@dimensiondev/unicode-specific-set': 'warn',

    // Confusing code
    'no-bitwise': 'error', // need mark out
    'no-constant-binary-expression': 'error', // a + b ?? c
    'no-control-regex': 'error', // RegEx
    'no-div-regex': 'error', // RegEx
    'no-label-var': 'warn', // name collision
    'no-plusplus': 'warn', // ++i? i++?
    'no-sequences': 'warn', // (a, b)
    'unicorn/no-keyword-prefix': 'warn', // bans variable names like newT or classT
    'react/no-unescaped-entities': 'warn', // <div> >1 </div>
    '@typescript-eslint/no-confusing-non-null-assertion': 'error', // a! == b

    // Problematic language features
    /// API with trap
    radix: 'warn', // parseInt('1', _required_)
    'unicorn/require-array-join-separator': 'warn', // Array.join(_required_)
    'unicorn/require-number-to-fixed-digits-argument': 'warn', // Number#toFixed(_required_)
    'react/button-has-type': 'error', // default type is "submit" which refresh the page
    '@typescript-eslint/require-array-sort-compare': 'error', // Array#sort(_required_)
    '@dimensiondev/type-no-instanceof-wrapper': 'warn', // bans `expr instanceof String` etc
    /// Footgun language features
    'no-case-declarations': 'error', // case 1: let a = 1; case 2: a
    'no-compare-neg-zero': 'error', // x === -0 is wrong
    'no-new-wrappers': 'error', // wrapper objects are bad
    'no-unsafe-finally': 'error', // finally { return expr }
    'unicorn/no-thenable': 'error', // export function then()
    '@typescript-eslint/no-loss-of-precision': 'error', // 5123000000000000000000000000001 is 5123000000000000000000000000000 actually
    '@typescript-eslint/prefer-enum-initializers': 'warn', // add a new item in the middle is an API breaking change.
    /// Little-known language features
    'no-constructor-return': 'error', // constructor() { return expr }
    'react/no-namespace': 'error', // <svg:rect> react does not support
    '@typescript-eslint/no-unsafe-declaration-merging': 'error',
    '@typescript-eslint/no-mixed-enums': 'error', // enum { a = 1, b = "b" }
    '@typescript-eslint/prefer-literal-enum-member': 'error', // enum { a = outsideVar }

    // Prevent bugs
    'array-callback-return': 'error', // .map .some ... calls should have a return value
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
    'no-restricted-globals': ['error', 'event', 'name', 'length', 'closed'], // source of bug (those names are too common)
    'no-template-curly-in-string': 'error', // "${expr}" looks like a bug
    'require-atomic-updates': 'error', // await/yield race condition
    'valid-typeof': 'error', // typeof expr === undefined
    'unicorn/no-invalid-remove-event-listener': 'error', // removeEventListener('click', f.bind(...))
    'react/jsx-no-comment-textnodes': 'warn', // <div>// comment</div> will render text!
    'react/jsx-no-leaked-render': 'error', // <div>{0 && <Something />}</div> will render "0"!
    'react/no-unstable-nested-components': 'error', // rerender bugs
    'react-hooks/rules-of-hooks': 'error', // react hooks
    '@typescript-eslint/no-base-to-string': 'error', // prevent buggy .toString() call
    '@typescript-eslint/no-loop-func': 'warn', // capture a loop variable might be a bug
    '@typescript-eslint/no-duplicate-enum-values': 'error', // enum { a = 1, b = 1 }
    '@dimensiondev/string-no-locale-case': 'error', // in non-i18n cases use locale-aware string methods are wrong

    // Performance
    'react/jsx-key': ['warn', { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true, warnOnDuplicates: true }], // key={data.key}
    'react/jsx-no-constructed-context-values': 'warn', // <Provider value={{}}> (should be cached!)
    // 'react/no-array-index-key': 'warn', // no key={index}
    // 'react/no-object-type-as-default-prop': 'warn', // function Component({ items = [] })
    'unicorn/consistent-function-scoping': 'warn', // hoist unnecessary higher order functions
    'unicorn/no-unsafe-regex': 'warn', // prevent RegExDoS
}
const codeStyleRules = {
    // Deprecated
    'no-alert': 'warn', // alert()
    'no-proto': 'error', // __proto__ accessor
    'no-prototype-builtins': 'error', // bans `obj.hasOwnProperty()` etc
    'no-var': 'error', // var x
    'unicorn/no-new-buffer': 'error', // NodeJS
    'react/no-deprecated': 'error',
    'react/no-find-dom-node': 'error',
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
    'no-lone-blocks': 'warn', // no block that not introducing a new scope
    'react/jsx-no-useless-fragment': 'warn', // <><TheOnlyChild /></>
    'unicorn/no-console-spaces': 'warn', // console.log('id: ', id)
    'unicorn/no-empty-file': 'warn',
    'unicorn/no-useless-fallback-in-spread': 'warn', // {...(foo || {})}
    'unicorn/no-useless-length-check': 'warn', // array.length === 0 || array.every(...)
    'unicorn/no-useless-promise-resolve-reject': 'warn', // return Promise.resolve(value) in async function
    'unicorn/no-useless-spread': 'warn', // new Set([...iterable])
    'unicorn/no-useless-switch-case': 'warn', // case 1: default:
    // 'unicorn/no-useless-undefined': 'warn', // let x = undefined
    'unicorn/no-zero-fractions': 'warn', // 1.0
    'unicorn/prefer-export-from': 'warn', // prefer export { } from than import-and-export
    'unicorn/prefer-native-coercion-functions': 'warn', // no coercion wrapper v => Boolean(v)
    '@typescript-eslint/await-thenable': 'warn', // await 1
    '@typescript-eslint/no-empty-interface': 'warn', // interface T extends Q {}
    '@typescript-eslint/no-extra-non-null-assertion': 'warn', // foo!!!.bar
    // '@typescript-eslint/no-inferrable-types': 'warn', // let x: number = 1
    '@typescript-eslint/no-meaningless-void-operator': 'warn', // void a_void_call()
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'warn', // foo! ?? bar
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn', // no if (nullable_bool === true)
    '@typescript-eslint/no-unnecessary-condition': 'warn', // no if (some_object)
    '@typescript-eslint/no-unnecessary-qualifier': 'warn', // no extra qualifier in enum/namespace
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn', // provided type argument equals the default
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // non_nullable!
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn', // T extends any
    '@typescript-eslint/no-useless-constructor': 'warn', // empty constructor
    '@typescript-eslint/no-useless-empty-export': 'warn', // export {}
    '@typescript-eslint/no-redundant-type-constituents': 'warn', // type Q = any | T
    '@dimensiondev/array-no-unneeded-flat-map': 'warn', // bans Array#flatMap((x) => x)
    '@dimensiondev/string-no-unneeded-to-string': 'warn', // useless .toString()
    '@dimensiondev/string-no-simple-template-literal': 'warn', // prefer simple string

    // Prefer modern things
    'prefer-const': 'warn',
    'prefer-exponentiation-operator': 'warn', // **
    'prefer-named-capture-group': 'warn', // RegEx
    'prefer-object-has-own': 'warn',
    // 'prefer-object-spread': 'warn', // { ... } than Object.assign
    'prefer-rest-params': 'warn',
    'unicorn/no-document-cookie': 'error', // even if you have to do so, use CookieJar
    'unicorn/prefer-keyboard-event-key': 'warn',
    'unicorn/prefer-add-event-listener': 'warn',
    'unicorn/prefer-array-find': 'warn',
    'unicorn/prefer-array-flat': 'warn',
    'unicorn/prefer-array-flat-map': 'warn',
    'unicorn/prefer-array-index-of': 'warn',
    'unicorn/prefer-array-some': 'warn',
    'unicorn/prefer-at': 'warn',
    'unicorn/prefer-date-now': 'warn',
    'unicorn/prefer-dom-node-append': 'warn',
    'unicorn/prefer-dom-node-dataset': 'warn',
    'unicorn/prefer-dom-node-remove': 'warn',
    'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-event-target': 'warn', // prevent use of Node's EventEmitter
    'unicorn/prefer-math-trunc': 'warn',
    'unicorn/prefer-modern-dom-apis': 'warn',
    'unicorn/prefer-modern-math-apis': 'warn',
    'unicorn/prefer-object-from-entries': 'warn',
    'unicorn/prefer-query-selector': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'unicorn/prefer-reflect-apply': 'warn',
    'unicorn/prefer-set-has': 'warn',
    'unicorn/prefer-set-size': 'warn',
    // 'unicorn/prefer-spread': 'warn', // prefer [...] than Array.from
    'unicorn/prefer-string-replace-all': 'warn', // str.replaceAll(...)
    'unicorn/prefer-string-slice': 'warn',
    'unicorn/prefer-string-trim-start-end': 'warn', // str.trimStart(...)
    '@typescript-eslint/no-this-alias': 'warn',
    '@dimensiondev/jsx-no-class-component': 'error',
    '@dimensiondev/type-no-number-constructor': 'warn',
    '@dimensiondev/array-prefer-from': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-includes': 'warn',
    '@typescript-eslint/no-for-in-array': 'warn',
    // '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    // '@typescript-eslint/prefer-optional-chain': 'warn',
    '@dimensiondev/browser-prefer-dataset': 'warn',
    '@dimensiondev/browser-prefer-location-assign': 'warn',
    '@dimensiondev/no-unsafe-date': 'error', // use date-fns or Temporal instead
    '@dimensiondev/prefer-fetch': 'error',

    // Better debug
    // 'prefer-promise-reject-errors': 'warn', // Promise.reject(need_error)
    'symbol-description': 'warn', // Symbol(desc)
    // 'react/display-name': ['warn', { checkContextObjects: true }], // .displayName = '...'
    'unicorn/catch-error-name': ['warn', { ignore: ['^err$'] }], // catch (err)
    'unicorn/custom-error-definition': 'warn', // correctly extends the native error
    'unicorn/error-message': 'warn', // error must have a message
    'unicorn/prefer-type-error': 'warn', // prefer TypeError
    '@typescript-eslint/no-throw-literal': 'warn', // no throw 'string'

    // API design
    // 'react/prefer-read-only-props': 'error',
    '@typescript-eslint/no-extraneous-class': 'error', // no class with only static members
    // '@typescript-eslint/prefer-readonly': 'error',
    // '@typescript-eslint/prefer-readonly-parameter-types': 'error',

    // More readable code
    'max-lines': ['warn', { max: 400 }],
    // 'no-dupe-else-if': 'warn', // different condition with same if body
    // 'no-else-return': 'warn',
    'no-regex-spaces': 'error', // RegEx
    'object-shorthand': 'warn',
    'prefer-numeric-literals': 'warn', // 0b111110111 === 503
    'prefer-regex-literals': 'warn', // RegEx
    'spaced-comment': ['warn', 'always', { line: { markers: ['/'] } }],
    // 'unicorn/no-array-reduce': 'warn',
    'unicorn/no-array-push-push': 'warn',
    // 'unicorn/no-lonely-if': 'warn', // else if (a) { if (b) expr }
    // 'unicorn/no-negated-condition': 'warn', // if (!a) else
    // 'unicorn/no-nested-ternary': 'warn', // a ? b : c ? d : e
    'unicorn/no-typeof-undefined': 'warn', // typeof expr !== 'undefined'
    'unicorn/no-unreadable-array-destructuring': 'warn', // [,, foo] = parts
    'unicorn/no-unreadable-iife': 'warn', // (bar => (bar ? bar.baz : baz))(getBar())
    'unicorn/prefer-negative-index': 'warn',
    'unicorn/throw-new-error': 'warn',
    // 'unicorn/prefer-logical-operator-over-ternary': 'warn', // prefer ?? and ||
    'unicorn/prefer-optional-catch-binding': 'warn', // prefer to omit catch binding
    // 'react/function-component-definition': [
    //     'warn',
    //     {
    //         namedComponents: 'function-declaration',
    //         unnamedComponents: 'function-expression',
    //     },
    // ],
    'react/jsx-boolean-value': ['never', { always: ['value'] }],
    // 'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/jsx-fragments': ['warn', 'syntax'],
    // 'react/no-children-prop': 'warn',
    'react/self-closing-comp': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',

    // Consistency
    'no-irregular-whitespace': 'warn', // unusual but safe
    yoda: 'warn',
    'unicorn/better-regex': 'error', // RegEx
    'unicorn/escape-case': 'warn', // correct casing of escape '\xA9'
    'unicorn/no-hex-escape': 'warn', // correct casing of escape '\u001B'
    'unicorn/numeric-separators-style': 'warn', // correct using of 1_234_567
    'unicorn/number-literal-case': 'warn', // correct casing of 0xFF
    'unicorn/prefer-prototype-methods': 'warn', // prefer Array.prototype.slice than [].slice
    'unicorn/relative-url-style': ['warn', 'always'], // prefer relative url starts with ./
    'unicorn/text-encoding-identifier-case': 'warn', // prefer 'utf-8' than 'UTF-8'
    '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }], // prefer T[] than Array<T>
    '@typescript-eslint/consistent-generic-constructors': 'warn', // prefer const map = new Map<string, number>() than generics on the left
    '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'as' /* objectLiteralTypeAssertions: 'never' */ },
    ], // prefer a as T than <T>a, and bans it on object literal
    // '@typescript-eslint/consistent-type-definitions': 'warn', // prefer interface, also has better performance when type checking
    '@typescript-eslint/dot-notation': 'warn', // prefer a.b than a['b']
    '@typescript-eslint/no-array-constructor': 'warn',
    '@typescript-eslint/non-nullable-type-assertion-style': 'warn', // prefer a! than a as T
    '@typescript-eslint/prefer-function-type': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
    // '@typescript-eslint/sort-type-constituents': 'warn',
    // '@typescript-eslint/triple-slash-reference': { lib: 'never', path: 'never', types: 'always' },
    // '@typescript-eslint/unified-signatures': 'warn', // prefer merging overload
    '@dimensiondev/prefer-early-return': 'warn',
    // '@dimensiondev/no-redundant-variable': 'warn',
    // '@dimensiondev/no-single-return': 'warn',
    '@dimensiondev/jsx-no-template-literal': 'warn',

    // Naming convension
    // 'func-name-matching': 'warn',
    'new-cap': 'warn',
    // 'react/boolean-prop-naming': 'warn',
    // 'react/hook-use-state': ['warn', { allowDestructuredState: true }],
    // 'react/jsx-handler-names': 'warn',
    // 'react/jsx-pascal-case': 'warn',

    // Bad practice
    'no-ex-assign': 'warn', // reassign err in catch
    'no-multi-assign': 'warn', // a = b = c
    'no-param-reassign': 'warn',
    'no-return-assign': 'warn', // return x = expr
    // 'unicorn/no-object-as-default-parameter': 'warn',
    // '@typescript-eslint/default-param-last': 'warn', // (a, b = 1, c)
    // '@typescript-eslint/no-dynamic-delete': 'error', // this usually means you should use Map/Set
    /// Async functions / Promise bad practice
    'no-async-promise-executor': 'error', // new Promise(async (resolve) => )
    'no-promise-executor-return': 'error', // new Promise(() => result)
    // '@typescript-eslint/no-floating-promises': 'warn', // unhandled promises
    '@typescript-eslint/promise-function-async': 'warn', // avoid Zalgo
    '@typescript-eslint/return-await': 'warn', // return await expr

    // No unused
    'no-unused-labels': 'warn',
    'tss-unused-classes/unused-classes': 'warn',
    // 'unicorn/no-unused-properties': 'warn',
    // '@typescript-eslint/no-unused-expressions': 'warn',
    // '@typescript-eslint/no-unused-vars': 'warn',
}
const moduleSystemRules = {
    '@typescript-eslint/no-restricted-imports': {
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

    // Style
    'import/no-named-default': 'warn', // bans import { default as T }
    'import/no-useless-path-segments': 'warn',
    'import/no-webpack-loader-syntax': 'error',
    // 'import/no-anonymous-default-export': 'error',
    'import/no-duplicates': 'warn', // duplicate specifiers
    'import/no-empty-named-blocks': 'warn', // bans import T, {}
    'unused-imports/no-unused-imports': 'warn',
    'unicorn/prefer-node-protocol': 'warn',
    // '@typescript-eslint/consistent-type-exports': { fixMixedExportsWithInlineTypeSpecifier: true },
    // '@typescript-eslint/consistent-type-imports': {
    //     prefer: 'type-imports',
    //     disallowTypeAnnotations: false,
    //     fixStyle: 'inline-type-imports',
    // },
    'no-useless-rename': 'error',

    // Avoid mistake
    // 'import/first': 'warn', // ES import always runs first even if you inserted some statements inside.
    'import/no-absolute-path': 'error',
    // 'import/no-cycle': 'warn',
    // 'import/no-extraneous-dependencies': 'error', // import from devDependencies might be a mistake
    'import/no-nodejs-modules': 'error',
    // 'import/no-relative-packages': 'error', // bans import '../../another-package', should import the workspace package instead
    'import/no-self-import': 'error',
    // 'import/no-unassigned-import': 'error', // bans `import 'x'`. side-effect only imports should be explicitly marked.
    // '@typescript-eslint/no-import-type-side-effects': 'warn',
}
// TODO: enable rule @typescript-eslint/explicit-module-boundary-types for "./packages/mask/background/services/*"
// TODO: ban uses of localStorage or sessionStorage

const plugins = {
    'tss-unused-classes': UnusedClassesPlugin,
    react: ReactPlugin,
    import: ImportPlugin,
    unicorn: UnicornPlugin,
    '@typescript-eslint': TypeScriptPlugin,
    '@dimensiondev': DimensionDevPlugin,
    'unused-imports': UnusedImportsPlugin,
    'react-hooks': ReactHooksPlugin,
}
export default [
    {
        ignores: [
            '**/*.d.ts',
            '**/public',
            '**/build',
            '**/dist',
            '**/i18n_generated.ts',
            '**/.storybook',
            'packages/contracts',
            'storybook-static',
            'packages/scripts',
            'packages/netlify/sites',
            'packages/mask/.webpack',
        ],
    },
    {
        files: ['packages/**/*.ts', 'packages/**/*.tsx'],
        languageOptions: {
            // Note: --cache is not supported yet if parser is an object https://github.com/eslint/eslint/issues/16875
            parser: TypescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                project: './tsconfig.eslint.json',
                warnOnUnsupportedTypeScriptVersion: false,
                allowAutomaticSingleRunInference: true,
            },
        },
        plugins,
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        rules: {
            ...avoidMistakeRules,
            ...codeStyleRules,
            ...moduleSystemRules,
        },
    },
]
