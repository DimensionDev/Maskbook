import { first } from 'lodash-es'
import * as MaskWallet from './providers/Mask'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import * as CustomNetwork from './providers/CustomNetwork'
import * as FortMatic from './providers/FortMatic'
import type { ChainId } from '@masknet/web3-shared-evm'

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

export async function connectMask() {
    const { accounts, chainId } = await MaskWallet.requestAccounts()
    return {
        account: first(accounts),
        chainId,
    }
}

export async function connectFortMatic(chainId: ChainId) {
    const { accounts } = await FortMatic.requestAccounts(chainId)
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
