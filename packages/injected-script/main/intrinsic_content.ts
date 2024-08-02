export const takeThisF: <Args extends readonly unknown[], This, Return>(
    f: (this: This, ...args: Args) => Return,
) => <AssignedThis extends This>(self: AssignedThis, ...args: Args) => Return = Function.prototype.bind.bind(
    Function.prototype.call,
)
export const takeThis: <Args extends readonly unknown[], This, Return>(
    f: (this: This, ...args: Args) => Return,
) => (self: This, ...args: Args) => Return = takeThisF
export const bind: {
    // bind 1 arg
    // <This, Return, Arg1, RestArg extends readonly unknown[]>(f: (this: This, arg1: Arg1, ...args: RestArg) => Return, thisArg: This, arg1: Arg1): (...args: RestArg) => Return
    <Args extends readonly unknown[], This, Return>(
        f: (this: This, ...args: Args) => Return,
        thisArg: This,
        ...args: Args
    ): () => Return
} = takeThis(Function.prototype.bind) as any

// #region ECMAScript intrinsic
// ECMAScript
export const { String, Promise, Boolean } = globalThis
export const getOwnPropertyDescriptor: <T, K extends keyof T>(object: T, key: K) => TypedPropertyDescriptor<T, T[K]> =
    Object.getOwnPropertyDescriptor as any
export const setPrototypeOf: <const T extends object>(o: T, proto: object | null) => T = Object.setPrototypeOf
export const { defineProperty, defineProperties, getOwnPropertyDescriptors, getPrototypeOf, create, freeze } = Object
export const { deleteProperty } = Reflect
export const apply: <Args extends readonly unknown[], This, Return>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    f: ((this: This, ...args: Args) => Return) | Function,
    thisArg: This,
    args: Readonly<Args> | IArguments,
) => Return = Reflect.apply as any
export const { parse: JSON_parse, stringify: JSON_stringify } = JSON
export let hasOwn = Object.hasOwn
if (!hasOwn) {
    const { hasOwnProperty } = Object.prototype
    hasOwn = (o, v) => Reflect.apply(hasOwnProperty, o, [v])
}
export const StringSplit = takeThisF(globalThis.String.prototype.split)<string>
export const StringToLowerCase = takeThisF(globalThis.String.prototype.toLowerCase)<string>
export const StringStartsWith = takeThisF(globalThis.String.prototype.startsWith)<string>
export const StringEndsWith = takeThisF(globalThis.String.prototype.endsWith)<string>
export const StringInclude = takeThisF(globalThis.String.prototype.includes)<string>
export const ArrayFilter = takeThisF(globalThis.Array.prototype.filter)<readonly unknown[]>
export const ArrayIncludes = takeThisF(globalThis.Array.prototype.includes)<readonly unknown[]>
export const ArrayUnshift: <T>(self: T[], ...args: T[]) => number = takeThisF(globalThis.Array.prototype.unshift)
export const ArrayPush: <T>(self: T[], ...args: T[]) => number = takeThisF(globalThis.Array.prototype.push)
export const PromiseResolve = globalThis.Promise.resolve.bind(globalThis.Promise)
export const DateNow = globalThis.Date.now
export const Uint8Array_from = globalThis.Uint8Array.from.bind(globalThis.Uint8Array)
// #endregion

// #region  DOM<EventTarget>
export const { URL, Blob, File, DOMException, Event, ClipboardEvent, CustomEvent, InputEvent, EventTarget } = globalThis
export const setTimeout = globalThis.setTimeout.bind(window)
export const clearTimeout = globalThis.clearTimeout.bind(window)
export const addEventListener = takeThisF(EventTarget.prototype.addEventListener)<EventTarget>
export const removeEventListener = takeThisF(EventTarget.prototype.removeEventListener)<EventTarget>
export const dispatchEvent = takeThisF(EventTarget.prototype.dispatchEvent)
export const console_error = console.error
export const AbortSignal_aborted = takeThis(getOwnPropertyDescriptor(AbortSignal.prototype, 'aborted')!.get!)
export const URL_origin = takeThis(getOwnPropertyDescriptor(URL.prototype, 'origin')!.get!)
export const Window_document = takeThis(getOwnPropertyDescriptor(window, 'document')!.get!)
export const Node_nodeName = takeThis(getOwnPropertyDescriptor(Node.prototype, 'nodeName')!.get!)
export const Node_parentNode = takeThis(getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!)
export const Node_ownerDocument = takeThis(getOwnPropertyDescriptor(Node.prototype, 'ownerDocument')!.get!)
export const Node_getRootNode = takeThisF(Node.prototype.getRootNode)<Node>
export const Document_defaultView = takeThis(getOwnPropertyDescriptor(Document.prototype, 'defaultView')!.get!)
export const Document_body = takeThis(getOwnPropertyDescriptor(Document.prototype, 'body')!.get!)
export const ShadowRoot_host = takeThis(getOwnPropertyDescriptor(ShadowRoot.prototype, 'host')!.get!)
export const ShadowRoot_mode = takeThis(getOwnPropertyDescriptor(ShadowRoot.prototype, 'mode')!.get!)
export const HTMLTextAreaElement_value_setter = takeThis(
    getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!,
)
export const HTMLInputElement_value_setter = takeThis(
    getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!,
)
export const DocumentActiveElement = getOwnPropertyDescriptor(Document.prototype, 'activeElement').get!.bind(document)
export const CustomEvent_detail = takeThis(getOwnPropertyDescriptor(CustomEvent.prototype, 'detail')!.get!)
export const Performance_now = globalThis.performance.now.bind(globalThis.performance)
export const Blob_type = takeThis(getOwnPropertyDescriptor(Blob.prototype, 'type')!.get!)
export const EventPrototype = window.Event.prototype
export const EventPrototypeDesc = getOwnPropertyDescriptors(EventPrototype)
export const ClipboardEventPrototype = window.ClipboardEvent.prototype
export const ClipboardEventPrototypeDesc = getOwnPropertyDescriptors(ClipboardEventPrototype)
export const UIEventPrototype = window.UIEvent.prototype
export const UIEventPrototypeDesc = getOwnPropertyDescriptors(UIEventPrototype)
export const InputEventPrototype = window.InputEvent.prototype
export const InputEventPrototypeDesc = getOwnPropertyDescriptors(InputEventPrototype)

export const EventTargetPrototype = window.EventTarget.prototype
export const EventTargetPrototypeDesc = getOwnPropertyDescriptors(EventTargetPrototype)
export const { pushState, replaceState } = window.history
export const HistoryPrototype = window.History.prototype
export const DataTransferPrototype = window.DataTransfer.prototype
export const DataTransferPrototypeDesc = getOwnPropertyDescriptors(DataTransferPrototype)
export const DataTransferItemPrototype = window.DataTransferItem.prototype
export const DataTransferItemPrototypeDesc = getOwnPropertyDescriptors(DataTransferItemPrototype)
export const DataTransferItemListPrototype = window.DataTransferItemList.prototype
export const DataTransferItemListPrototypeDesc = getOwnPropertyDescriptors(DataTransferItemListPrototype)
export const FileListPrototype = window.FileList.prototype
export const FileListPrototypeDesc = getOwnPropertyDescriptors(FileListPrototype)
export const HTMLElementPrototype = window.HTMLElement.prototype
export const HTMLElementPrototype_click = takeThisF(window.HTMLElement.prototype.click)<HTMLElement>
export const HTMLInputElementPrototype = window.HTMLInputElement.prototype
export const HTMLInputElementPrototype_files_get = takeThis(
    getOwnPropertyDescriptor(HTMLInputElementPrototype, 'files').get!,
)
export const HTMLInputElementPrototype_files_set = takeThis(
    getOwnPropertyDescriptor(HTMLInputElementPrototype, 'files').set!,
)
export const querySelector = takeThisF(document.querySelector)<ParentNode>
export const querySelectorAll = takeThisF(document.querySelectorAll)<ParentNode>
export const NodeList_forEach = takeThisF(NodeList.prototype.forEach)<NodeList>
// #endregion

// #region Firefox magic
export const wrapXRayVision: <const T extends object>(val: T) => T =
    typeof XPCNativeWrapper !== 'undefined' ? XPCNativeWrapper : Object
export const isFirefox = typeof XPCNativeWrapper !== 'undefined'
// #endregion
interface TypedPropertyDescriptor<T, V> {
    enumerable?: boolean
    configurable?: boolean
    writable?: boolean
    value?: V
    get?: (this: T) => V
    set?: (this: T, value: V) => void
}
