import { CustomEventId } from '../../utils/constants'
import type { CustomEvents } from './CustomEvents'

{
    const store: Partial<Record<Events, CallbackMap>> = {}
    const { apply } = Reflect
    const { error } = console
    const hijack = (key: string) => (store[key as keyof DocumentEventMap] = new Map())
    const isHacked = (key: string): key is keyof typeof store => key in store
    const isConnectedGetter: () => boolean = Object.getOwnPropertyDescriptor(Node.prototype, 'isConnected')!.get!
    const isConnected = (x: unknown) => {
        try {
            return isConnectedGetter.call(x)
        } catch {
            return false
        }
    }
    const getEvent = <T extends Event>(event: T, mocks: Partial<T> = {}) => {
        const mockTable = {
            target: un_xray(document.activeElement),
            srcElement: un_xray(document.activeElement),
            // TODO: Since it is bubbled to the <del>document</del> React root.
            currentTarget: un_xray(document),
            // ? Why ?
            _inherits_from_prototype: true,
            defaultPrevented: false,
            ...mocks,
        }
        // The "window."" here is used to create a un-xrayed Proxy on Firefox
        return new globalThis.window.Proxy(
            event,
            clone_into({
                get(target: T, key: keyof T) {
                    if (key === 'preventDefault') return clone_into(() => {})
                    return mockTable[key] ?? un_xray(target)[key]
                },
            }),
        )
    }
    const hacks: { [key in keyof CustomEvents & keyof DocumentEventMap]: (...params: CustomEvents[key]) => Event } = {
        paste(textOrImage) {
            const data = new DataTransfer()
            const e = new ClipboardEvent('paste', {
                clipboardData: data,
                // @ts-ignore Firefox only API
                dataType: typeof textOrImage === 'string' ? 'text/plain' : void 0,
                data: typeof textOrImage === 'string' ? textOrImage : void 0,
                bubbles: true,
                cancelable: true,
            })
            if (typeof textOrImage === 'string') {
                data.setData('text/plain', textOrImage)
                document.activeElement!.dispatchEvent(e)
                return undefined!
            } else if (textOrImage.type === 'image') {
                const Uint8Array = globalThis.Uint8Array ? globalThis.Uint8Array : globalThis.window.Uint8Array
                const xray_binary = Uint8Array.from(textOrImage.value)
                const xray_blob = new Blob([clone_into(xray_binary)], { type: 'image/png' })
                const file = un_xray(
                    new File([un_xray(xray_blob)], 'image.png', {
                        lastModified: Date.now(),
                        type: 'image/png',
                    }),
                )
                const dt = new globalThis.window.Proxy(
                    un_xray(data),
                    clone_into({
                        get(target, key: keyof DataTransfer) {
                            if (key === 'files') return clone_into([file])
                            if (key === 'types') return clone_into(['Files'])
                            if (key === 'items')
                                return clone_into([
                                    {
                                        kind: 'file',
                                        type: 'image/png',
                                        getAsFile() {
                                            return file
                                        },
                                    },
                                ])
                            if (key === 'getData') return clone_into(() => '')
                            return un_xray(target[key])
                        },
                    }),
                )
                return getEvent(e, { clipboardData: dt })
            }
            const error = new Error(`Unknown event, got ${textOrImage?.type ?? 'unknown'}`)
            console.error(error)
            throw error
        },
        input(text) {
            // Cause react hooks the input.value getter & setter
            const proto: HTMLInputElement | HTMLTextAreaElement = document.activeElement!.constructor.prototype
            Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(document.activeElement, text)
            return getEvent(
                new globalThis.window.InputEvent('input', clone_into({ inputType: 'insertText', data: text })),
            )
        },
    }
    ;(Object.keys(hacks) as (keyof DocumentEventMap)[]).concat(['keyup', 'input']).forEach(hijack)
    function invoke<T extends keyof CustomEvents>(eventName: T, param: CustomEvents[T]) {
        const _ = store[eventName]
        if (!_) return
        // TODO: handle DOM tree hierarchy
        for (const [f, target] of _ as CallbackMap) {
            // Skip for Non-Node target
            if (!isConnected(target)) continue
            try {
                const hack: Function = hacks[eventName]
                const result = hack(...param)
                if (!result) return
                if (hack) f(result)
                else f(param as any)
            } catch (e) {
                error(e)
            }
        }
    }
    if (process.env.NODE_ENV === 'development') console.log(`Invoke custom event:`, clone_into(invoke), store)
    const invokeCustomEvent: EventListenerOrEventListenerObject = (e) => {
        const ev = e as CustomEvent<string>
        type K = keyof CustomEvents
        const [eventName, param]: [K, CustomEvents[K]] = JSON.parse(ev.detail)
        invoke(eventName, param)
    }
    document.addEventListener(CustomEventId, invokeCustomEvent)
    redefine('addEventListener', (raw, _this: EventTarget, args: Parameters<EventTarget['addEventListener']>) => {
        const [[event, f], once] = normalizeArgs(args)
        if (isHacked(event) && f) {
            if (once) store[event]?.set((e) => (store[event]?.delete(f), f(e)), _this)
            else store[event]?.set(f, _this)
        }
        return apply(raw, _this, args)
    })
    redefine('removeEventListener', (raw, _this: EventTarget, args: Parameters<EventTarget['removeEventListener']>) => {
        const [[event, f], once] = normalizeArgs(args)
        if (isHacked(event) && f) store[event]?.delete(f)
        return apply(raw, _this, args)
    })

    function redefine<K extends keyof EventTarget>(key: K, f: NonNullable<ProxyHandler<EventTarget[K]>['apply']>) {
        try {
            if (typeof XPCNativeWrapper !== 'undefined') {
                console.log('Redefine with Firefox private API, cool!')
                const raw = XPCNativeWrapper.unwrap(globalThis.window.EventTarget.prototype)
                const rawF = raw[key]
                exportFunction(
                    function (this: any, ...args: unknown[]) {
                        return f(rawF, this, args)
                    },
                    raw,
                    { defineAs: key },
                )
                return
            }
        } catch {
            console.error('Redefine failed...')
        }
        EventTarget.prototype[key] = new Proxy(EventTarget.prototype[key], { apply: f })
    }
    /** get the un xrayed version of a _DOM_ object */
    function un_xray<T>(x: T) {
        if (typeof XPCNativeWrapper !== 'undefined') return XPCNativeWrapper.unwrap(x)
        return x
    }

    /** Clone a object into the page realm */
    function clone_into<T>(x: T) {
        if (typeof cloneInto === 'function') return cloneInto(x, window, { cloneFunctions: true })
        return x
    }

    const normalizeArgs = (args: Parameters<EventTarget['addEventListener']>) => {
        const [type, listener, options] = args
        let f: EventListener | undefined
        if (typeof listener === 'function') f = listener
        else if (typeof listener === 'object') f = listener?.handleEvent.bind(listener)

        // let capture: boolean
        // if (typeof options === 'boolean') capture = options
        // else if (typeof options === 'object') capture = options?.capture ?? false

        let once = false
        if (typeof options === 'object') once = options?.once ?? false
        return [[type, f, options], once] as const
    }
}
type Events = keyof DocumentEventMap
type Callback = (event: Event) => void
type CallbackMap = Map<Callback, EventTarget>
/** @see https://mdn.io/XPCNativeWrapper Firefox only */
declare namespace XPCNativeWrapper {
    function unwrap<T>(object: T): T
}
/** @see https://mdn.io/Component.utils.exportFunction Firefox only */
declare function exportFunction(f: Function, target: object, opts: { defineAs: string }): void
/** @see https://mdn.io/Component.utils.cloneInto Firefox only */
declare function cloneInto<T>(f: T, target: object, opts: { cloneFunctions: boolean }): T
