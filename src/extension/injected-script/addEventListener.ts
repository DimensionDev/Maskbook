import { CustomPasteEventId } from '../../utils/Names'
{
    const store: Partial<Record<keyof DocumentEventMap, Set<(event: Event) => void>>> = {}
    function hijack(key: keyof DocumentEventMap) {
        store[key] = new Set()
    }
    function isEnabled(key: any): key is keyof typeof store {
        return key in store
    }

    document.addEventListener(CustomPasteEventId, e => {
        const ev = e as CustomEvent<string>
        const transfer = new DataTransfer()
        transfer.setData('text/plain', ev.detail)
        const event = {
            clipboardData: transfer,
            defaultPrevented: false,
            preventDefault: () => {},
            target: document.activeElement,
            // ! Magic. Why?
            _inherits_from_prototype: true,
        }
        for (const f of store.paste || []) {
            try {
                f(event as any)
            } catch (e) {
                console.error(e)
            }
        }
    })

    hijack('paste')
    hijack('click')

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
