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
// Level: if the rule is fixable, use 'warn' is better.

const avoidMistakeRules = {
    // Code quality
    'no-invalid-regexp': 'error', // RegEx
    'unicorn/no-abusive-eslint-disable': 'error', // disable a rule requires a reason
    /// Async functions / Promise bad practice
    'no-async-promise-executor': 'error', // new Promise(async (resolve) => )
    'no-promise-executor-return': 'error', // new Promise(() => result)
    '@typescript-eslint/no-floating-promises': 'warn', // unhandled promises
    '@typescript-eslint/promise-function-async': 'warn', // avoid Zalgo
    '@typescript-eslint/return-await': 'warn', // return await expr
    /// React bad practice
    'react/no-invalid-html-attribute': 'error',
    'react/void-dom-elements-no-children': 'error', // <img>children</img>
    /// TypeScript bad practice
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-invalid-void-type': 'error', // Disallow void type outside of generic or return types
    '@typescript-eslint/no-misused-new': 'error', // wrong 'new ()' or 'constructor()' signatures
    /// Unicode support
    'no-misleading-character-class': 'error', // RegEx
    'unicorn/prefer-code-point': 'error',
    '@dimensiondev/no-builtin-base64': 'warn',
    /// Have modern alternatives
    'unicorn/no-document-cookie': 'error', // even if you have to do so, use CookieJar
    'unicorn/prefer-keyboard-event-key': 'warn',
    /// Deprecated
    'no-proto': 'error', // __proto__ accessor
    'no-prototype-builtins': 'error', // bans `obj.hasOwnProperty()` etc
    'unicorn/no-new-buffer': 'error', // NodeJS
    'react/no-deprecated': 'error',
    'react/no-find-dom-node': 'error',
    /// type safety
    '@typescript-eslint/method-signature-style': 'warn', // method signature is bivariant
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error', // bans foo?.bar!
    '@typescript-eslint/no-unsafe-argument': 'error', // bans call(any)
    '@typescript-eslint/no-unsafe-assignment': 'error', // bans a = any
    '@typescript-eslint/no-unsafe-call': 'error', // bans any()
    '@typescript-eslint/no-unsafe-member-access': 'error', // bans a = any.prop
    '@typescript-eslint/no-unsafe-return': 'error', // bans return any
    '@typescript-eslint/prefer-return-this-type': 'error', // use `: this` properly
    '@typescript-eslint/restrict-plus-operands': 'error', // stronger `a + b` check
    '@typescript-eslint/restrict-template-expressions': 'error', // bans `${nonString}`
    '@typescript-eslint/strict-boolean-expressions': 'error', // stronger check for nullable string/number/boolean
    '@typescript-eslint/switch-exhaustiveness-check': 'error', // switch should be exhaustive
    '@typescript-eslint/unbound-method': 'error', // requires `this` to be set properly

    // Security
    'no-script-url': 'error', // javascript:
    'unicorn/require-post-message-target-origin': 'warn', // postMessage(data, 'origin')
    'react/iframe-missing-sandbox': 'warn', // <iframe sandbox="..." />
    'react/jsx-no-script-url': 'error', // javascript:
    'react/no-danger': 'error', // dangerouslySetInnerHTML
    'react/no-danger-with-children': 'error', // dangerouslySetInnerHTML + children
    '@typescript-eslint/no-implied-eval': 'error', // setTimeout('code')
    '@dimensiondev/browser-no-set-html': 'error', // .innerHTML =

    // Confusing code
    'no-control-regex': 'error', // RegEx
    'unicorn/no-keyword-prefix': 'warn', // bans variable names like newT or classT
    'react/no-unescaped-entities': 'warn', // <div> >1 </div>
    '@typescript-eslint/default-param-last': 'error', // (a, b = 1, c)
    '@typescript-eslint/no-confusing-non-null-assertion': 'error', // a! == b

    // Problematic language features
    /// API with trap
    'unicorn/require-array-join-separator': 'warn', // Array.join(_required_)
    'unicorn/require-number-to-fixed-digits-argument': 'warn', // Number#toFixed(_required_)
    'react/button-has-type': 'error', // default type is "submit" which refresh the page
    '@typescript-eslint/require-array-sort-compare': 'error', // Array#sort(_required_)
    '@dimensiondev/type-no-instanceof-wrapper': 'warn', // bans `expr instanceof String` etc
    /// Footgun language features
    'no-case-declarations': 'error', // case 1: let a = 1; case 2: a
    'no-compare-neg-zero': 'error', // x === -0
    'no-new-wrappers': 'error', // wrapper objects are bad
    'no-sequences': 'error', // bans (a, b)
    'no-unsafe-finally': 'error', // finally { return expr }
    'unicorn/no-thenable': 'error', // export function then()
    '@typescript-eslint/no-loss-of-precision': 'error', // 5123000000000000000000000000001 is 5123000000000000000000000000000 actually
    '@typescript-eslint/prefer-enum-initializers': 'warn', // add a new item in the middle is an API breaking change.
    '@dimensiondev/no-unsafe-date': 'error', // use date-fns or Temporal instead
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
    'no-constant-binary-expression': 'error', // a + b ?? c
    'no-constant-condition': 'error', // if (false)
    'no-duplicate-case': 'error', // switch
    'no-empty-character-class': 'error', // RegEx /[]/ means a empty character class, not "[]"
    'no-global-assign': 'error', // onmessage = ...
    'no-self-assign': 'error', // a = a
    'no-self-compare': 'error', // a === a
    'no-sparse-arrays': 'error', // [, 1]
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
    '@typescript-eslint/no-loop-func': 'warn', // capture a loop variable might be a bug
    '@typescript-eslint/no-duplicate-enum-values': 'error', // enum { a = 1, b = 1 }
    '@dimensiondev/string-no-locale-case': 'error', // in non-i18n cases use locale-aware string methods are wrong

    // Performance
    'react/jsx-key': ['warn', { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true, warnOnDuplicates: true }], // key={data.key}
    'react/jsx-no-constructed-context-values': 'warn', // <Provider value={{}}> (should be cached!)
    'react/no-array-index-key': 'warn', // no key={index}
    'react/no-object-type-as-default-prop': 'warn', // function Component({ items = [] })
    'unicorn/no-unsafe-regex': 'warn', // prevent RegExDoS
}
const codeStyleRules = {
    'unicorn/better-regex': 'warn',
    'unicorn/catch-error-name': ['warn', { ignore: ['^err$'] }],
    '@typescript-eslint/no-base-to-string': 'warn',
    'unicorn/consistent-function-scoping': 'warn',
    'no-useless-backreference': 'error', // RegEx
    'unicorn/custom-error-definition': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    'unicorn/error-message': 'warn',
    'unicorn/escape-case': 'warn',
    'unicorn/no-object-as-default-parameter': 'warn',
    'unicorn/switch-case-braces': 'warn',
    '@typescript-eslint/prefer-readonly-parameter-types': 'error',
    'unicorn/no-array-method-this-argument': 'warn',
    'unicorn/no-array-push-push': 'warn',
    'unicorn/no-array-reduce': 'warn',
    'unicorn/no-console-spaces': 'warn',
    'unicorn/no-empty-file': 'warn',
    'unicorn/no-hex-escape': 'warn',
    'unicorn/no-lonely-if': 'warn',
    'unicorn/no-negated-condition': 'warn',
    'unicorn/no-nested-ternary': 'warn',
    'unicorn/no-typeof-undefined': 'warn',
    'unicorn/no-unreadable-array-destructuring': 'warn',
    'unicorn/no-unreadable-iife': 'warn',
    'unicorn/no-unused-properties': 'warn',
    'unicorn/no-useless-fallback-in-spread': 'warn',
    'unicorn/no-useless-length-check': 'warn',
    'unicorn/no-useless-promise-resolve-reject': 'warn',
    'unicorn/no-useless-spread': 'warn',
    'unicorn/no-useless-switch-case': 'warn',
    'unicorn/no-useless-undefined': 'warn',
    'unicorn/no-zero-fractions': 'warn',
    'unicorn/number-literal-case': 'warn',
    'unicorn/numeric-separators-style': 'warn',
    'unicorn/prefer-array-find': 'warn',
    'unicorn/prefer-array-flat': 'warn',
    'unicorn/prefer-array-flat-map': 'warn',
    'unicorn/prefer-array-index-of': 'warn',
    'unicorn/prefer-array-some': 'warn',
    'unicorn/prefer-at': 'warn',
    'unicorn/prefer-date-now': 'warn',
    'unicorn/prefer-export-from': 'warn',
    'unicorn/prefer-includes': 'warn',
    'unicorn/prefer-add-event-listener': 'error',
    'unicorn/prefer-logical-operator-over-ternary': 'warn',
    'unicorn/prefer-math-trunc': 'warn',
    'unicorn/prefer-modern-math-apis': 'warn',
    'unicorn/prefer-native-coercion-functions': 'warn',
    'unicorn/prefer-negative-index': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'unicorn/prefer-object-from-entries': 'warn',
    'unicorn/prefer-optional-catch-binding': 'warn',
    'unicorn/prefer-prototype-methods': 'warn',
    'unicorn/prefer-reflect-apply': 'warn',
    'unicorn/prefer-set-has': 'warn',
    'unicorn/prefer-set-size': 'warn',
    'unicorn/prefer-spread': 'warn',
    'unicorn/prefer-string-replace-all': 'warn',
    'unicorn/prefer-string-slice': 'warn',
    'unicorn/prefer-string-trim-start-end': 'warn',
    'unicorn/prefer-type-error': 'warn',
    'unicorn/relative-url-style': ['warn', 'always'],
    'unicorn/text-encoding-identifier-case': 'warn',
    '@typescript-eslint/no-dynamic-delete': 'error', // this usually means you should use Map/Set
    'unicorn/throw-new-error': 'warn',
    'tss-unused-classes/unused-classes': 'warn',
    'react/boolean-prop-naming': 'warn',
    'react/prefer-read-only-props': 'warn',
    'react/display-name': ['warn', { checkContextObjects: true }],
    'react/function-component-definition': [
        'warn',
        {
            namedComponents: 'function-declaration',
            unnamedComponents: 'function-expression',
        },
    ],
    'react/hook-use-state': ['warn', { allowDestructuredState: true }],
    'react/jsx-boolean-value': ['never', { always: ['value'] }],
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/jsx-fragments': ['warn', 'syntax'],
    'react/jsx-handler-names': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-pascal-case': 'warn',
    'react/no-children-prop': 'warn',
    'react/self-closing-comp': 'warn',
    'no-debugger': 'warn',
    'no-dupe-else-if': 'warn',
    'no-empty-pattern': 'warn',
    'no-ex-assign': 'warn',
    'no-irregular-whitespace': 'error',
    'func-name-matching': 'warn',
    'max-lines': ['warn', { max: 400 }],
    'new-cap': 'warn',
    'no-alert': 'error',
    'no-bitwise': 'error',
    'no-div-regex': 'warn',
    'no-else-return': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-boolean-cast': 'warn',
    'no-extra-label': 'warn',
    'no-label-var': 'warn',
    'no-lone-blocks': 'warn',
    'no-lonely-if': 'warn',
    'no-multi-assign': 'warn',
    'no-param-reassign': 'error',
    'no-plusplus': 'error',
    'no-regex-spaces': 'error',
    'no-return-assign': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-labels': 'error',
    'no-useless-call': 'error',
    'no-useless-catch': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'warn',
    'prefer-exponentiation-operator': 'warn',
    'prefer-named-capture-group': 'warn',
    'prefer-numeric-literals': 'warn',
    'prefer-object-has-own': 'warn',
    'prefer-object-spread': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'prefer-regex-literals': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    radix: 'warn',
    'require-unicode-regexp': 'warn',
    'symbol-description': 'warn',
    yoda: 'warn',
    '@dimensiondev/array-no-unneeded-flat-map': 'error',
    '@dimensiondev/array-prefer-from': 'error',
    '@dimensiondev/browser-prefer-dataset': 'error',
    '@dimensiondev/browser-prefer-location-assign': 'error',
    '@dimensiondev/jsx-no-class-component': 'error',
    '@dimensiondev/jsx-no-logical': 'error',
    '@dimensiondev/jsx-no-template-literal': 'error',
    '@dimensiondev/string-no-data-url': 'error',
    '@dimensiondev/string-no-simple-template-literal': 'error',
    '@dimensiondev/string-no-unneeded-to-string': 'error',
    '@dimensiondev/type-no-number-constructor': 'error',
    '@dimensiondev/unicode-no-bidi': 'error',
    '@dimensiondev/unicode-no-invisible': 'error',
    '@dimensiondev/no-redundant-variable': 'error',
    '@dimensiondev/no-single-return': 'error',
    '@dimensiondev/prefer-early-return': 'error',
    '@dimensiondev/prefer-fetch': 'error',
    'spaced-comment': ['error', 'always', { line: { markers: ['/'] } }],
    '@dimensiondev/unicode-specific-set': 'error',

    // DOM
    'unicorn/prefer-dom-node-append': 'warn',
    'unicorn/prefer-dom-node-dataset': 'warn',
    'unicorn/prefer-dom-node-remove': 'warn',
    'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-event-target': 'warn',
    'unicorn/prefer-modern-dom-apis': 'warn',
    'unicorn/prefer-query-selector': 'warn',

    // TypeScript
    '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
    '@typescript-eslint/await-thenable': 'error',
    // '@typescript-eslint/ban-ts-comment': {
    //     'ts-expect-error': 'allow-with-description',
    //     'ts-ignore': false,
    //     'ts-nocheck': false,
    //     'ts-check': true,
    //     minimumDescriptionLength: 5,
    // },
    '@typescript-eslint/consistent-generic-constructors': 'warn',
    '@typescript-eslint/consistent-type-assertions': 'warn',
    '@typescript-eslint/consistent-type-definitions': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-extra-non-null-assertion': 'warn',
    '@typescript-eslint/no-extraneous-class': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    // '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/no-meaningless-void-operator': 'warn',
    // '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-redundant-type-constituents': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unnecessary-qualifier': 'warn',
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
    '@typescript-eslint/no-useless-empty-export': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-function-type': 'warn',
    '@typescript-eslint/prefer-includes': 'warn',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    // '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    '@typescript-eslint/sort-type-constituents': 'warn',
    '@typescript-eslint/triple-slash-reference': { lib: 'never', path: 'never', types: 'always' },
    '@typescript-eslint/unified-signatures': 'warn',
    '@typescript-eslint/non-nullable-type-assertion-style': 'warn', // prefer a! than a as T
    '@typescript-eslint/dot-notation': 'warn',
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-throw-literal': 'warn',
    '@typescript-eslint/no-useless-constructor': 'warn',
    '@dimensiondev/type-no-force-cast-via-top-type': 'error',
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
    'import/no-anonymous-default-export': 'error',
    'import/no-duplicates': 'warn', // duplicate specifiers
    'import/no-empty-named-blocks': 'warn', // bans import T, {}
    'unused-imports/no-unused-imports': 'warn',
    'unicorn/prefer-node-protocol': 'warn',
    '@typescript-eslint/consistent-type-exports': { fixMixedExportsWithInlineTypeSpecifier: true },
    '@typescript-eslint/consistent-type-imports': {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
        fixStyle: 'inline-type-imports',
    },
    'no-useless-rename': 'error',

    // Avoid mistake
    'import/first': 'warn', // ES import always runs first even if you inserted some statements inside.
    'import/no-absolute-path': 'error',
    'import/no-cycle': 'warn',
    'import/no-extraneous-dependencies': 'error', // import from devDependencies might be a mistake
    'import/no-nodejs-modules': 'error',
    'import/no-relative-packages': 'error', // bans import '../../another-package', should import the workspace package instead
    'import/no-self-import': 'error',
    'import/no-unassigned-import': 'error', // bans `import 'x'`. side-effect only imports should be explicitly marked.
    '@typescript-eslint/no-import-type-side-effects': 'warn',
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
