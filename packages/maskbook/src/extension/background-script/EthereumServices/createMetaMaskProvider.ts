import { MetaMaskInpageProvider } from '@metamask/inpage-provider'
import PortStream from 'extension-port-stream'
import { detect } from 'detect-browser'

const browser = detect()
const CHROME_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn'
const FIREFOX_ID = 'webextension@metamask.io'

export function createMetaMaskProvider(): MetaMaskInpageProvider {
    let provider
    try {
        const currentMetaMaskId = getMetaMaskId()
        const metamaskPort = chrome.runtime.connect(currentMetaMaskId)
        const pluginStream = new PortStream(metamaskPort)
        provider = new MetaMaskInpageProvider(pluginStream)
    } catch (e) {
        throw e
    }
    return provider
}

function getMetaMaskId() {
    switch (browser && browser.name) {
        case 'chrome':
            return CHROME_ID
        case 'firefox':
            return FIREFOX_ID
        default:
            return CHROME_ID
    }
}
