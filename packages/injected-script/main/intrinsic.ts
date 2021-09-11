export const apply: <T extends (...args: any[]) => any>(
    f: T,
    thisArg: unknown,
    params: Parameters<T>,
) => ReturnType<T> = Reflect.apply
export const { error, warn } = console

const { defineProperties } = Object
//#region document.activeElement
const DocumentActiveElementGetter = Object.getOwnPropertyDescriptors(
    Object.getPrototypeOf(Object.getPrototypeOf(document)),
).activeElement.get!
export const getDocumentActiveElement = (): Element => apply(DocumentActiveElementGetter, document, [])
//#endregion
//#region CustomEvent.prototype.detail
const CustomEventDetailGetter = Object.getOwnPropertyDescriptor(CustomEvent.prototype, 'detail')!.get!
export const getCustomEventDetail = (e: CustomEvent) => apply(CustomEventDetailGetter, e, [])
//#endregion
//#region new Map()
const { Map: _xray_Map } = globalThis
const XRayMapOriginalProtoDesc = Object.getOwnPropertyDescriptors(_xray_Map.prototype)
export function xray_Map() {
    const map = new _xray_Map()
    defineProperties(map, XRayMapOriginalProtoDesc)
    return map
}
//#endregion
export const {
    Proxy: no_xray_Proxy,
    CustomEvent: no_xray_Event,
    dispatchEvent,
    DataTransfer: no_xray_DataTransfer,
    ClipboardEvent: no_xray_ClipboardEvent,
    // The "window."" here is used to create a no-xray version on Firefox
} = globalThis.window
export const _XPCNativeWrapper = typeof XPCNativeWrapper === 'undefined' ? undefined : XPCNativeWrapper
