import { CustomEventId } from '../../utils/constants'
export interface CustomEvents {
    paste: [string]
    input: [string]
}
{
    const store: Partial<Record<keyof DocumentEventMap, Set<(event: Event) => void>>> = {}
    function hijack(key: string) {
        store[key as keyof DocumentEventMap] = new Set()
    }
    function isEnabled(key: string): key is keyof typeof store {
        return key in store
    }

    function getEvent<T extends Event>(x: T, mocks: Partial<T> = {}) {
        const mockTable = {
            target: document.activeElement,
            srcElement: document.activeElement,
            // Since it is bubbled to the document.
            currentTarget: document,
            // ! Why?
            _inherits_from_prototype: true,
            ...mocks,
        }
        return new Proxy(x, {
            get(target: T, key: keyof T) {
                return (mockTable as any)[key] || target[key]
            },
        })
    }

    const hacks: { [key in keyof CustomEvents & keyof DocumentEventMap]: (...params: CustomEvents[key]) => Event } = {
        paste(text) {
            const e = new ClipboardEvent('paste', { clipboardData: new DataTransfer() })
            e.clipboardData!.setData('text/plain', text)
            // ! Why?
            return getEvent(e, { defaultPrevented: false, preventDefault() {} })
        },
        input(text) {
            // Cause react hooks the input.value getter & setter
            const proto: HTMLInputElement | HTMLTextAreaElement = document.activeElement!.constructor.prototype
            Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(document.activeElement, text)
            return getEvent(new window.InputEvent('input', { inputType: 'insertText', data: text }))
        },
    }
    ;(Object.keys(hacks) as (keyof DocumentEventMap)[]).concat(['keyup', 'input']).forEach(hijack)
    const invokeCustomEvent: EventListenerOrEventListenerObject = e => {
        const ev = e as CustomEvent<string>
        const [eventName, param]: [keyof CustomEvents, CustomEvents[keyof CustomEvents]] = JSON.parse(ev.detail)

        for (const f of store[eventName] || []) {
            try {
                const hack = hacks[eventName]
                if (hack) f(hack(...param))
                else f(param as any)
            } catch (e) {
                console.error(e)
            }
        }
    }
    document.addEventListener(CustomEventId, invokeCustomEvent)
    document.addEventListener = new Proxy(document.addEventListener, {
        apply(target, thisRef, [event, callback, ...args]) {
            if (isEnabled(event)) store[event]!.add(callback)
            return Reflect.apply(target, thisRef, [event, callback, ...args])
        },
    })
    document.removeEventListener = new Proxy(document.removeEventListener, {
        apply(target, thisRef, [event, callback, ...args]) {
            if (isEnabled(event)) store[event]!.delete(callback)
            return Reflect.apply(target, thisRef, [event, callback, ...args])
        },
    })
}
