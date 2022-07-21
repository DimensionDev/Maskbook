/** Bless an internal object so it methods can be called directly. */
export const bless = <T>(object: T, descriptors: Record<keyof T, PropertyDescriptor>) =>
    $.defineProperties(object, descriptors)

/** Create a HOF that can be called without this. */
export function takeThis<F extends (...args: any) => any>(f: F) {
    return <T>(self: T, ...args: Parameters<F>): ReturnType<F> => $.Reflect.apply(f, self, args)
}

type Setter<T> = (val: T) => void
type Getter<T> = () => T

// The "window." here is used to create a no-xray version on Firefox
export const $NoXRay = {
    dispatchEvent: takeThis(window.dispatchEvent)<EventTarget>,
    Proxy: window.Proxy,
    Event: window.Event,
    DataTransfer: window.DataTransfer,
    ClipboardEvent: window.ClipboardEvent,
    CustomEvent: window.CustomEvent,
    InputEvent: window.InputEvent,

    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    EventTargetPrototype: window.EventTarget.prototype,

    Blob: window.Blob,
    File: window.File,
}

export const $ = {
    __proto__: null,
    // JS
    Boolean,

    Reflect: Object.create(null, Object.getOwnPropertyDescriptors(Reflect)) as typeof Reflect,
    defineProperties: Object.defineProperties,
    getOwnPropertyDescriptors: Object.getOwnPropertyDescriptors,

    MapDesc: Object.getOwnPropertyDescriptors(Map.prototype),
    WeakMapDesc: Object.getOwnPropertyDescriptors(WeakMap.prototype),
    SetDesc: Object.getOwnPropertyDescriptors(Set.prototype),
    ArrayDesc: Object.getOwnPropertyDescriptors(Array.prototype) as any,
    GeneratorDesc: Object.getOwnPropertyDescriptors(
        Object.getPrototypeOf(Object.getPrototypeOf((function* () {})())),
    ) as any,

    StringSplit: takeThis(String.prototype.split)<string>,
    StringInclude: takeThis(String.prototype.includes)<string>,
    ArrayFilter: takeThis(Array.prototype.filter)<readonly any[]>,
    ArrayIncludes: takeThis(Array.prototype.includes)<readonly any[]>,
    ArrayForEach: takeThis(Array.prototype.forEach)<readonly any[]>,
    ArrayShift: takeThis(Array.prototype.shift)<any[]>,

    PromiseResolve: Promise.resolve.bind(Promise),
    DateNow: Date.now,

    // DOM
    ConsoleWarn: console.warn,
    ConsoleError: console.error,
    URL,
    URL_origin_getter: takeThis<Getter<URL['origin']>>(
        Object.getOwnPropertyDescriptor(URL.prototype, 'origin')!.get!,
    )<URL>,
    Node_parentNode: takeThis<Getter<Node['parentNode']>>(
        Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!,
    )<Node>,

    HTMLTextAreaElement_value_setter: takeThis<Setter<HTMLTextAreaElement['value']>>(
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!,
    )<HTMLTextAreaElement>,
    HTMLInputElement_value_setter: takeThis<Setter<HTMLInputElement['value']>>(
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!,
    )<HTMLInputElement>,
    DataTransfer_setData: takeThis(DataTransfer.prototype.setData)<DataTransfer>,

    DocumentActiveElement: Object.getOwnPropertyDescriptors(
        Object.getPrototypeOf(Object.getPrototypeOf(document)),
    ).activeElement.get!.bind(document) as () => Document['activeElement'],

    CustomEvent_detail_getter: takeThis<Getter<CustomEvent['detail']>>(
        Object.getOwnPropertyDescriptor(CustomEvent.prototype, 'detail')!.get!,
    )<CustomEvent>,

    // Firefox magic
    XPCNativeWrapper: typeof XPCNativeWrapper === 'undefined' ? undefined : XPCNativeWrapper,
}

export const $Blessed = {
    Map: (
        (Map) =>
        <K, V>() =>
            bless(new Map<K, V>(), $.MapDesc)
    )(Map),
    WeakMap: (
        (WeakMap) =>
        <K extends object, V>() =>
            bless(new WeakMap<K, V>(), $.WeakMapDesc)
    )(WeakMap),
    Set: (
        (Set) =>
        <T>(iterable?: Iterable<T> | null | undefined) =>
            bless(new Set<T>(iterable), $.SetDesc)
    )(Set),
    // Array: () => bless([], $.ArrayDesc),
}
