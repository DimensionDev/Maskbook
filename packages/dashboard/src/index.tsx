/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />
import React from 'react'
import ReactDOM from 'react-dom'
import { setService, WebExtensionExternalChannel } from './API'
import { App } from './App'
import { AsyncCall } from 'async-call-rpc'
import Serialization from '@dimensiondev/maskbook/dist/src/utils/type-transform/Serialization'

// Patch for esbuild (not support JSX new transform)
Object.assign(globalThis, { React })
setService(
    new Proxy({} as any, {
        get(target, prop) {
            if (target[prop]) return target[prop]
            target[prop] = AsyncCall(
                {},
                { channel: new WebExtensionExternalChannel(String(prop)), serializer: Serialization, log: 'all' },
            )
            return target[prop]
        },
    }),
)

ReactDOM.unstable_createRoot(document.getElementById('root')!).render(<App />)

if (!import.meta.hot) {
    throw new Error('This app is not used to run as an isolated web site currently')
} else {
    import.meta.hot.accept()
}
