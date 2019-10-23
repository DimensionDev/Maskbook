import jsQR from 'jsqr'

const self = (globalThis as unknown) as Worker & WindowOrWorkerGlobalScope
self.addEventListener('message', ev => {
    const [data, width, height] = ev.data as Parameters<typeof jsQR>

    self.postMessage(jsQR(data, width, height))
})
