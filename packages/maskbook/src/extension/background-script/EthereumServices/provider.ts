import { first } from 'lodash-es'
import * as WalletConnect from './providers/WalletConnect'
import * as MetaMask from './providers/MetaMask'
import { getWallets } from '../../../plugins/Wallet/services'
import { ProviderType } from '../../../web3/types'

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
