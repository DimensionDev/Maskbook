import Gun from 'gun'
Object.assign(globalThis, { Gun })

if (typeof importScripts !== 'function') {
    console.warn('Loading gun in main frame is deprecated. Please load it in a OnDemandWorker')
}

if (typeof location === 'object' && !location.protocol.includes('extension')) {
    console.warn('Loading gun in SNS is deprecated. Please use RPC and run gun in the background.')
}
