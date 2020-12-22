/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />
import React from 'react'
import ReactDOM from 'react-dom'
import { setService, WebExtensionExternalChannel } from './API'
import { App } from './App'
import { AsyncCall } from 'async-call-rpc'
// @ts-ignore
import Serialization from '@dimensiondev/maskbook/src/utils/type-transform/Serialization.ts'

// Patch for esbuild (not support JSX new transform)
Object.assign(globalThis, { React })
console.log(Serialization)

ReactDOM.unstable_createBlockingRoot
ReactDOM.render

setService(
    new Proxy({} as any, {
        get(target, prop) {
            if (target[prop]) return target[prop]
            target[prop] = AsyncCall(
                {},
                { channel: new WebExtensionExternalChannel(String(prop)), serializer: Serialization, log: 'all' },
            )
            console.log('Init service', prop)
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
