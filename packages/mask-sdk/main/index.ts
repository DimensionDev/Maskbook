import type { Mask } from '../public-api/index.js'
import { contentScript, readyPromise } from './bridge.js'
import { ethereum } from './wallet.js'

if (location.protocol.includes('-extension')) throw new TypeError('Mask SDK: this is not expected to run in extension.')
document.currentScript?.remove()

const MaskSDK: {
    [key in keyof typeof Mask as undefined extends (typeof Mask)[key] ? never : key]: (typeof Mask)[key]
} & { reload?(): Promise<void> } = {
    sdkVersion: 0,
    ethereum,
}
Object.assign(globalThis, { Mask: MaskSDK })

readyPromise.then((init) => {
    if (init.debuggerMode) {
        if (location.href === 'https://metamask.github.io/test-dapp/' || location.href === 'http://localhost:9011/') {
            Object.assign(window, { ethereum })
            Object.assign(ethereum, { isMetaMask: true })
        }
        MaskSDK.reload = () => contentScript.reload()
    }

    ethereum.request({ method: 'eth_chainId', params: [] }).then((chainId) => {
        ethereum.dispatchEvent(new CustomEvent('connect', { detail: { chainId } }))
    })
})

undefined
