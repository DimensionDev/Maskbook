import { first } from 'lodash-es'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import * as CustomNetwork from './providers/CustomNetwork'

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
    if (connector.connected)
        return {
            account: first(connector.accounts),
            chainId: connector.chainId,
        }
    const { accounts, chainId } = await WalletConnect.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}
//#endregion

export async function connectMetaMask() {
    const { accounts, chainId } = await MetaMask.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function connectMaskbook() {
    const { accounts, chainId } = await Maskbook.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function connectCustomNetwork() {
    const { accounts, chainId } = await CustomNetwork.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}
