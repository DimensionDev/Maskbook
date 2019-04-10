import {} from '@holoflows/kit'
{
    const store: Partial<Record<keyof DocumentEventMap, Set<any>>> = {}
    function hijack(key: keyof DocumentEventMap) {
        store[key] = new Set()
    }
    function isEnabled(key: any): key is keyof typeof store {
        return key in store
    }

    document.addEventListener('debug', () => {
        console.log(store)
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
