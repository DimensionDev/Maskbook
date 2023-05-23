import { $Content, type Getter, type Setter } from './intrinsic.js'

export const takeThis: <F extends (...args: any) => any>(
    f: F,
) => <T>(self: T, ...args: Parameters<F>) => ReturnType<F> = Function.prototype.bind.bind(Function.prototype.call)
export const bind: <Args extends readonly unknown[], This, Return>(
    f: (this: This, ...args: Args) => Return,
    thisArg: This,
    ...args: Args
) => Return = takeThis(Function.prototype.bind) as any

// #region ECMAScript intrinsic
// ECMAScript
export const { String, Promise, Boolean } = globalThis
export const { defineProperty, defineProperties, getOwnPropertyDescriptors, getPrototypeOf, setPrototypeOf, create } =
    Object
export const Reflect = Object.create(
    null,
    Object.getOwnPropertyDescriptors(globalThis.Reflect),
) as typeof globalThis.Reflect
export const { apply } = Reflect
export const { parse: JSON_parse, stringify: JSON_stringify } = JSON
export let hasOwn = Object.hasOwn
if (!hasOwn) {
    const { hasOwnProperty } = Object.prototype
    hasOwn = (o, v) => Reflect.apply(hasOwnProperty, o, [v])
}
export const StringSplit = takeThis(globalThis.String.prototype.split)<string>
export const StringInclude = takeThis(globalThis.String.prototype.includes)<string>
export const ArrayFilter = takeThis(globalThis.Array.prototype.filter)<readonly unknown[]>
export const ArrayIncludes = takeThis(globalThis.Array.prototype.includes)<readonly unknown[]>
export const ArrayShift = takeThis(globalThis.Array.prototype.shift)<unknown[]>
export const ArrayUnshift = takeThis(globalThis.Array.prototype.unshift)<unknown[]>
export const ArrayPush = takeThis(globalThis.Array.prototype.push)<unknown[]>
export const PromiseResolve = globalThis.Promise.resolve.bind(globalThis.Promise)
export const DateNow = globalThis.Date.now
// #endregion

// #region  DOM
export const { URL } = globalThis
export const ConsoleError = console.error
export const AbortSignal_aborted = takeThis<Getter<AbortSignal['aborted']>>(
    Object.getOwnPropertyDescriptor(AbortSignal.prototype, 'aborted')!.get!,
)<AbortSignal>
export const URL_origin_getter = takeThis<Getter<URL['origin']>>(
    Object.getOwnPropertyDescriptor(URL.prototype, 'origin')!.get!,
)<URL>
export const Window_document = takeThis<Getter<Window['document']>>(
    Object.getOwnPropertyDescriptor(window, 'document')!.get!,
)<Window>
export const Node_nodeName = takeThis<Getter<Node['nodeName']>>(
    Object.getOwnPropertyDescriptor(Node.prototype, 'nodeName')!.get!,
)<Node>
export const Node_parentNode = takeThis<Getter<Node['parentNode']>>(
    Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!,
)<Node>
export const Node_ownerDocument = takeThis<Getter<Node['ownerDocument']>>(
    Object.getOwnPropertyDescriptor(Node.prototype, 'ownerDocument')!.get!,
)<Node>
export const Node_getRootNode = takeThis(Node.prototype.getRootNode)<Node>
export const Document_defaultView = takeThis<Getter<Document['defaultView']>>(
    Object.getOwnPropertyDescriptor(Document.prototype, 'defaultView')!.get!,
)<Document>
export const Document_body = takeThis<Getter<Document['body']>>(
    Object.getOwnPropertyDescriptor(Document.prototype, 'body')!.get!,
)<Document>
export const ShadowRoot_host = takeThis<Getter<ShadowRoot['host']>>(
    Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'host')!.get!,
)<ShadowRoot>
export const ShadowRoot_mode = takeThis<Getter<ShadowRoot['mode']>>(
    Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'mode')!.get!,
)<ShadowRoot>
export const HTMLTextAreaElement_value_setter = takeThis<Setter<HTMLTextAreaElement['value']>>(
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!,
)<HTMLTextAreaElement>
export const HTMLInputElement_value_setter = takeThis<Setter<HTMLInputElement['value']>>(
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!,
)<HTMLInputElement>
export const DocumentActiveElement = Object.getOwnPropertyDescriptors(
    Object.getPrototypeOf(Object.getPrototypeOf(document)),
).activeElement.get!.bind(document) as () => Document['activeElement']
export const CustomEvent_detail_getter = takeThis<Getter<CustomEvent['detail']>>(
    Object.getOwnPropertyDescriptor(CustomEvent.prototype, 'detail')!.get!,
)<CustomEvent>
export const Performance_now = globalThis.performance.now.bind(globalThis.performance)
// #endregion

// #region Firefox magic
const _cloneInto = typeof cloneInto !== 'undefined' ? cloneInto : null
const _exportFunction = typeof exportFunction !== 'undefined' ? exportFunction : null
export const unwrapXRayVision: <T extends object>(value: T) => T =
    typeof XPCNativeWrapper !== 'undefined' ? XPCNativeWrapper.unwrap.bind(XPCNativeWrapper) : Object
export const cloneIntoContent: <T extends object>(value: T) => T =
    _exportFunction && _cloneInto
        ? function (value) {
              if (typeof value === 'function') return _exportFunction(value, $Content.window)
              return _cloneInto(value, $Content.window, {
                  cloneFunctions: true,
                  __proto__: null,
              })
          }
        : Object
export const cloneIntoContentAny: <T>(value: T) => T =
    _exportFunction && _cloneInto ? (cloneIntoContent as any) : (x) => x

export { _exportFunction as exportFunction }
export const isFirefox = !!_cloneInto
// #endregion
