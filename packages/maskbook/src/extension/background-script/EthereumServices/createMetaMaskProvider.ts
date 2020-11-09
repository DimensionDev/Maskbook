import { MetaMaskInpageProvider } from '@metamask/inpage-provider'
import PortStream from 'extension-port-stream'
import { detect } from 'detect-browser'
import { once } from 'lodash'

const detectBrowser = detect()
const idMapping: Record<string, string> = {
    chrome: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
    firefox: 'webextension@metamask.io',
}

export function createMetaMaskProvider(): MetaMaskInpageProvider {
    let provider
    try {
        const currentMetaMaskId = once(() => idMapping[detectBrowser?.name ?? 'chrome'])()
        const metamaskPort = browser.runtime.connect(currentMetaMaskId)
        const pluginStream = new PortStream(metamaskPort)
        provider = new MetaMaskInpageProvider(pluginStream)
    } catch (e) {
        throw e
    }
    return provider
}
