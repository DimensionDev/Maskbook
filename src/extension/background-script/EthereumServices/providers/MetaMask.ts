import createMetaMaskProvider, { MetamaskInpageProvider } from 'metamask-extension-provider'
import { ChainId } from '../../../../web3/types'
import { currentMetaMaskChainIdSettings } from '../../../../settings/settings'
import Web3 from 'web3'
import { EthereumAddress } from 'wallet.ts'
import type { ExoticWalletRecord } from '../../../../plugins/Wallet/database/types'
import { updateExoticWalletsFromSource } from '../../../../plugins/Wallet/wallet'
import { WalletProviderType } from '../../../../plugins/shared/findOutProvider'

//#region tracking chain id
let currentChainId: ChainId = ChainId.Mainnet
currentMetaMaskChainIdSettings.addListener((v) => (currentChainId = v))
//#endregion

let provider: MetamaskInpageProvider | null = null

export function createProvider() {
    if (!provider) provider = createMetaMaskProvider()
    provider.on('data', async (event: { method: string; result: string[] }) => {
        if (event.method !== 'wallet_accountsChanged') return
        await updateWalletInDB(event.result[0] ?? '', false)
    })
    provider.on('networkChanged', (id: string) => {
        currentMetaMaskChainIdSettings.value = Number.parseInt(id) as ChainId
    })
    return provider
}

export async function requestAccounts() {
    const provider = createProvider()
    const web3 = new Web3()
    web3.setProvider(provider)
    const accounts = await web3.eth.requestAccounts()
    await updateWalletInDB(accounts[0] ?? '', true)
    return accounts[0]
}

async function updateWalletInDB(address: string, setAsDefault: boolean = false) {
    // validate address
    if (!!EthereumAddress.isValid(address)) throw new Error('Cannot found account or invalid account')

    // update wallet in the DB
    await updateExoticWalletsFromSource(
        WalletProviderType.metamask,
        new Map([[address, { address, _wallet_is_default: setAsDefault }]]),
    )
}
