import { CustomEventId } from '../../utils/constants'
export interface CustomEvents {
    paste: [string | { type: 'image'; value: Array<number> }]
    input: [string]
}
{
    const store: Partial<Record<Events, CallbackMap>> = {}
    const { apply } = Reflect
    const { error } = console
    const hijack = (key: string) => (store[key as keyof DocumentEventMap] = new Map())
    const isHacked = (key: string): key is keyof typeof store => key in store
    const isConnectedGetter = Object.getOwnPropertyDescriptor(Node.prototype, 'isConnected' as keyof Node)!.get!
    const isConnected = (x: unknown) => {
        try {
            return isConnectedGetter.call(x)
        } catch {
            return false
        }
    }
    const getEvent = <T extends Event>(event: T, mocks: Partial<T> = {}) => {
        const mockTable = {
            target: document.activeElement,
            srcElement: document.activeElement,
            // TODO: Since it is bubbled to the <del>document</del> React root.
            currentTarget: document,
            // ? Why ?
            _inherits_from_prototype: true,
            ...mocks,
        }
        return new Proxy(event, {
            get(target: T, key: keyof T) {
                return mockTable[key] ?? target[key]
            },
        })
    }
    const hacks: { [key in keyof CustomEvents & keyof DocumentEventMap]: (...params: CustomEvents[key]) => Event } = {
        paste(textOrImage) {
            const e = new ClipboardEvent('paste', { clipboardData: new DataTransfer() })
            if (typeof textOrImage === 'string') {
                e.clipboardData!.setData('text/plain', textOrImage)
                return getEvent(e, { defaultPrevented: false, preventDefault() {} })
            } else if (textOrImage.type === 'image') {
                const binary = Uint8Array.from(textOrImage.value)
                const blob = new Blob([binary], { type: 'image/png' })
                const file = new File([blob], 'image.png', { lastModified: Date.now(), type: 'image/png' })
                const dt = new Proxy(new DataTransfer(), {
                    get(target, key: keyof DataTransfer) {
                        if (key === 'files') return [file]
                        if (key === 'types') return ['Files']
                        if (key === 'items')
                            return [
                                {
                                    kind: 'file',
                                    type: 'image/png',
                                    getAsFile() {
                                        return file
                                    },
                                },
                            ]
                        if (key === 'getData') return () => ''
                        return target[key]
                    },
                })
                return getEvent(e, { defaultPrevented: false, preventDefault() {}, clipboardData: dt })
            }
            const error = new Error(`Unknown event, got ${textOrImage?.type ?? 'unknown'}`)
            console.error(error)
            throw error
        },
        input(text) {
            // Cause react hooks the input.value getter & setter
            const proto: HTMLInputElement | HTMLTextAreaElement = document.activeElement!.constructor.prototype
            Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(document.activeElement, text)
            return getEvent(new window.InputEvent('input', { inputType: 'insertText', data: text }))
        },
    }
    ;(Object.keys(hacks) as (keyof DocumentEventMap)[]).concat(['keyup', 'input']).forEach(hijack)
    const invokeCustomEvent: EventListenerOrEventListenerObject = (e) => {
        const ev = e as CustomEvent<string>
        type K = keyof CustomEvents
        const [eventName, param]: [K, CustomEvents[K]] = JSON.parse(ev.detail)
        // TODO: handle target
        for (const [f, target] of store[eventName] || []) {
            // Skip for Non-Node target
            if (!isConnected(target)) continue
            try {
                const hack: any = hacks[eventName]
                if (hack) f(hack(...param))
                else f(param as any)
            } catch (e) {
                error(e)
            }
        }
    }
    document.addEventListener(CustomEventId, invokeCustomEvent)
    EventTarget.prototype.addEventListener = new Proxy(EventTarget.prototype.addEventListener, {
        apply(target, thisRef, args) {
            const [[event, f], once] = normalizeArgs(args)
            if (isHacked(event) && f) {
                if (once) store[event]?.set((e) => (store[event]?.delete(f), f(e)), thisRef)
                else store[event]?.set(f, thisRef)
            }
            return apply(target, thisRef, args)
        },
    })
    EventTarget.prototype.removeEventListener = new Proxy(EventTarget.prototype.removeEventListener, {
        apply(target, thisRef, args: Parameters<EventTarget['removeEventListener']>) {
            const [[event, f]] = normalizeArgs(args)
            if (isHacked(event) && f) store[event]?.delete(f)
            return apply(target, thisRef, args)
        },
    })

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
