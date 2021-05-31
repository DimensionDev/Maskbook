import { first } from 'lodash-es'
import { ProviderType } from '@dimensiondev/web3-shared'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import * as CustomNetwork from './providers/CustomNetwork'
import { getWallets } from '../../../plugins/Wallet/services'

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
    if (connector.connected) return first(connector.accounts)
    const accounts = await WalletConnect.requestAccounts()
    return first(accounts)
}
//#endregion

export async function connectMetaMask() {
    const accounts = await MetaMask.requestAccounts()
    return first(accounts)
}

export async function connectMaskbook() {
    const wallets = await getWallets(ProviderType.Maskbook)
    return first(wallets)
}

export async function connectCustomNetwork() {
    const accounts = await CustomNetwork.requestAccounts()
    return first(accounts)
}
