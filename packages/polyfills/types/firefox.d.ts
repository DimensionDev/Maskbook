// Some firefox magics

interface XPCNativeWrapper {
    (val: T): T
    unwrap(val: T): T
}
/** @see https://mdn.io/XPCNativeWrapper */
declare var XPCNativeWrapper: undefined | XPCNativeWrapper

/** @see https://udn.realityripple.com/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.utils.exportFunction Firefox only */
declare var exportFunction:
    | undefined
    | (<F extends Function>(f: F, targetRealm: object, opts?: { defineAs: PropertyKey }) => F)

/** @see https://udn.realityripple.com/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.utils.cloneInto Firefox only */
declare var cloneInto:
    | undefined
    | (<T>(
          object: T,
          targetRealm: object,
          opts?: {
              cloneFunctions?: boolean
              wrapReflectors?: boolean
              __proto__: null
          },
      ) => T)

/** @deprecated Only available in Manifest V2. */
declare var content:
    | undefined
    | { fetch: typeof fetch; WebSocket: typeof WebSocket; XMLHttpRequest: typeof XMLHttpRequest }
