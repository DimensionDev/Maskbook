const public_path = (Reflect.get(window, 'browser') || Reflect.get(window, 'chrome')).runtime.getURL('/')
__webpack_public_path__ = public_path
const orig = Object.getOwnPropertyDescriptor(HTMLScriptElement, 'src')!
const chunks = new WeakSet<Node>()
if (document.head) {
    const old = document.head.appendChild
    document.head.appendChild = <T extends Node>(e: T) => {
        if (chunks.has(e)) return e
        return old.call(document.head, e) as T
    }
}
Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    configurable: true,
    enumerable: false,
    get() {
        return orig.get!.call(this)
    },
    set(this: HTMLScriptElement, val: string) {
        if (val.startsWith(public_path)) {
            console.log('Hijacking', val)
            fetch(val)
                .then(data => data.text())
                .then(eval)
            chunks.add(this)
            return true
        } else {
            return orig.set!.call(this, val)
        }
    },
})
const { GetContext } = require('@holoflows/kit/es') as typeof import('@holoflows/kit/es')
const { uiSetup } = require('./setup') as typeof import('./setup')
if (process.env.NODE_ENV === 'development') {
    try {
        require('react-devtools')
    } catch {}
}
if (GetContext() === 'content') {
    uiSetup().then(() => {
        console.log('Maskbook content script loaded')
        require('./extension/content-script/index')
    })
}
export default undefined
