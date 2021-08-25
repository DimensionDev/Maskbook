// Some firefox magics

/** @see https://mdn.io/XPCNativeWrapper */
declare var XPCNativeWrapper:
    | undefined
    | {
          unwrap<T>(object: T): T
      }

/** @see https://mdn.io/Component.utils.exportFunction Firefox only */
declare var exportFunction:
    | undefined
    | ((f: Function, target: object, opts: { defineAs: string | number | symbol }) => void)

/** @see https://mdn.io/Component.utils.cloneInto Firefox only */
declare var cloneInto: undefined | (<T>(f: T, target: object, opts: { cloneFunctions: boolean }) => T)
