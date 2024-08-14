/// <reference types="@masknet/global-types/web-extension" />
import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { type BridgeServiceResponse, type IframeToMain } from './types.js'

const iframe = document.createElement('iframe')
iframe.src = browser.runtime.getURL('dashboard.html#/setup/welcome')
Object.assign(iframe.style, {
    width: '100vw',
    height: '100vh',
    border: 'none',
    position: 'fixed',
    top: '0',
    left: '0',
} as CSSStyleDeclaration)
document.body.appendChild(iframe)
document.querySelectorAll('script').forEach((tag) => tag.remove())

// Load the application
const sandbox = iframe.contentWindow!
const channel = new WebExtensionMessage<any>({ domain: '$' })

const allowedServices: readonly string[] = ['Helper', 'Identity', 'Settings', 'Wallet']
allowedServices.forEach((name) => {
    channel.events[name].on((data) => {
        sandbox.postMessage({ type: 'service', name, data } satisfies BridgeServiceResponse, '*')
    })
})
window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow) return
    const message = event.data as IframeToMain

    if (message.type === 'service') {
        if (!allowedServices.includes(message.name)) {
            console.error(`Service.${message.name} is not allowed`)
            return
        }
        channel.events[message.name].sendToBackgroundPage(message.data)
    }
})
