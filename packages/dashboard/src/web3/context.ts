import { createWeb3Context } from '@masknet/web3-shared'
import { Messages, PluginMessages, PluginServices, Services } from '../API'

export const Web3Provider = createExternalProvider()

export const Web3Context = createWeb3Context(Web3Provider, {
    MaskMessages: Messages,
    MaskServices: Services,
    PluginMessages,
    PluginServices,
})

export function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        request: Services.Ethereum.request,
        send: Services.Ethereum.requestSend,
        sendAsync: Services.Ethereum.requestSend,
    }
}
