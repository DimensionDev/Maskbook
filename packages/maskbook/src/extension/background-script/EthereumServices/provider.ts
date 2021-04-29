import { first } from 'lodash-es'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { getWallet, getWallets } from '../../../plugins/Wallet/services'
import { ProviderType } from '../../../web3/types'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { unreachable } from '../../../utils/utils'

//#region connect WalletConnect
// step 1:
// Generate the connection URI and render a QRCode for scanning by the user
export async function createConnectionURI() {
    return (await WalletConnect.createConnector()).uri
}

// step2:
// If user confirmed the request we will receive the 'connect' event
export async function connectWalletConnect() {
    const connector = await WalletConnect.createConnectorIfNeeded()
    if (connector.connected) return connector.accounts[0]
    const accounts = await WalletConnect.requestAccounts()
    return accounts[0]
}
//#endregion

export async function connectMetaMask() {
    const accounts = await MetaMask.requestAccounts()
    return accounts[0]
}

export async function connectMaskbook() {
    const wallets = await getWallets(ProviderType.Maskbook)
    // return the first managed wallet
    return first(wallets)
}

export async function createWeb3() {
    const wallet = await getWallet()
    if (!wallet) throw new Error('cannot find any wallet')
    const providerType = currentSelectedWalletProviderSettings.value
    switch (providerType) {
        case ProviderType.Maskbook:
            if (!wallet._private_key_ || wallet._private_key_ === '0x') throw new Error('cannot sign with given wallet')
            return Maskbook.createWeb3({
                privKeys: [wallet._private_key_],
            })
        case ProviderType.MetaMask:
            return await MetaMask.createWeb3()
        case ProviderType.WalletConnect:
            return WalletConnect.createWeb3()
        default:
            unreachable(providerType)
    }
}
