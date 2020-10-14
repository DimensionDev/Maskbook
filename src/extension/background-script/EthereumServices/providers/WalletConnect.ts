import { EthereumAddress } from 'wallet.ts'
import WalletConnect from '@walletconnect/client'
import { setDefaultWallet, updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import { currentWalletConnectChainIdSettings } from '../../../../settings/settings'
import { ChainId } from '../../../../web3/types'
import { ProviderType } from '../../../../web3/types'

//#region tracking chain id
let currentChainId: ChainId = ChainId.Mainnet
currentWalletConnectChainIdSettings.addListener((v) => (currentChainId = v))
//#endregion

let connector: WalletConnect | null = null

/**
 * Create a new connector and destroy the previous one if exists
 */
export async function createConnector() {
    // disconnect previous connector if exists
    if (connector?.connected) await connector.killSession()
    connector = null

    // create a new connector
    connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
    })
    connector.on('connect', onConnect)
    connector.on('session_update', onUpdate)
    connector.on('disconnect', onDisconnect)
    connector.on('error', onDisconnect)
    if (!connector.connected) await connector.createSession()
    return connector
}

export async function createConnectorIfNeeded() {
    if (connector) return connector
    return createConnector()
}

/**
 * Request accounts from WalletConnect
 * @param timeout
 */
export async function requestAccounts() {
    const connector_ = await createConnectorIfNeeded()

    console.log('DEBUG: request accounts')
    console.log(connector_)

    return new Promise<string[]>(async (resolve, reject) => {
        if (connector_.accounts.length) {
            resolve(connector_.accounts)
            return
        }
        connector_.on('connect', () => resolve(connector_.accounts))
        connector_.on('update', () => resolve(connector_.accounts))
        connector_.on('error', reject)
    })
}

const onConnect = async () => {
    if (!connector?.accounts.length) return
    currentWalletConnectChainIdSettings.value = connector.chainId
    for (const account of connector.accounts) await updateWalletInDB(account, connector.peerMeta?.name, true)
}

const onUpdate = async (
    error: Error | null,
    payload: {
        params: {
            chainId: number
            accounts: string[]
        }[]
    },
) => {
    if (error) return
    if (!connector?.accounts.length) return
    currentWalletConnectChainIdSettings.value = connector.chainId
    for (const account of connector.accounts) await updateWalletInDB(account, connector.peerMeta?.name, false)
}

const onDisconnect = async (error: Error | null) => {
    if (connector?.connected) await connector.killSession()
    connector = null
}

async function updateWalletInDB(address: string, name: string = 'WalletConnect', setAsDefault: boolean = false) {
    console.log('DEBUG: updateWalletInDB')
    console.log({
        address,
        name,
        setAsDefault,
    })

    // validate address
    if (!EthereumAddress.isValid(address)) throw new Error('Cannot found account or invalid account')

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.WalletConnect, new Map([[address, { name, address }]]))
    if (setAsDefault) await setDefaultWallet(address)
}
