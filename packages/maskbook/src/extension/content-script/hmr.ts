// If the content script runs in https, webpack will connect https://localhost:HMR_PORT
if (import.meta.webpackHot) {
    globalThis.WebSocket = new Proxy(WebSocket, {
        construct(target, args, newTarget) {
            args[0] = removeWss(args[0])
            return Reflect.construct(target, args, newTarget)
        },
    })
}
function removeWss(x: string) {
    if (x.startsWith('wss://localhost')) return x.replace(/^wss/, 'ws')
    return x
}
export {}
