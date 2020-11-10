import { MetaMaskInpageProvider } from '@metamask/inpage-provider'
import PortStream from 'extension-port-stream'
import { detect } from 'detect-browser'
import { once } from 'lodash'

const detectBrowser = detect()
const idMapping: Record<string, string> = {
    chrome: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
    firefox: 'webextension@metamask.io',
}
const initCurrentMetaMaskId = once(() => idMapping[detectBrowser?.name ?? 'chrome'])

export function createMetaMaskProvider(): MetaMaskInpageProvider {
    const currentMetaMaskId = initCurrentMetaMaskId()
    const metamaskPort = browser.runtime.connect(currentMetaMaskId)
    const pluginStream = new PortStream(metamaskPort)
    return new MetaMaskInpageProvider(pluginStream)
}
