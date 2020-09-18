import { web3 } from './web3'
import * as WalletConnect from './providers/WalletConnect'
import * as MetaMask from './providers/MetaMask'
import type { HttpProvider } from 'web3-core'
import type { EthereumNetwork } from '../../../web3/types'
import { getManagedWallets, updateExoticWalletsFromSource } from '../../../plugins/Wallet/wallet'
import type { ExoticWalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletProviderType } from '../../../plugins/shared/findOutProvider'

//#region connect WalletConnect
export async function connectWalletConnectURI() {
    return (await WalletConnect.createConnector()).uri
}

export async function connectWalletConnect() {
    const connector = await WalletConnect.createConnector()
    if (connector.connected) return connector.accounts[0]
    return new Promise<string>((resolve, reject) => {
        const done = (err: Error | null) => {
            if (err) reject(err)
            else resolve(connector.accounts[0])
        }
        connector.on('connect', done)
        connector.on('session_update', done)
    })
}
//#endregion

export async function connectMetaMask() {
    web3.setProvider(MetaMask.createProvider() as HttpProvider)
    const address = (await web3.eth.requestAccounts())[0]
    const record: Partial<ExoticWalletRecord> = { address, _wallet_is_default: true }
    await updateExoticWalletsFromSource(WalletProviderType.metamask, new Map([[address, record]]))
    return address
}

export async function connectMaskbook() {
    const { wallets } = await getManagedWallets()
    const defaultWallet = wallets.find((x) => x._wallet_is_default)
    if (defaultWallet) return defaultWallet.address
    return wallets[0].address
}
