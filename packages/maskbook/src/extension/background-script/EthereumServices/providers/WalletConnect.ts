import type { JsonRpcResponse } from 'web3-core-helpers'
import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import WalletConnect from '@walletconnect/client'
import type { IJsonRpcRequest } from '@walletconnect/types'
import { ProviderType, getNetworkTypeFromChainId, NetworkType, ChainId } from '@masknet/web3-shared'
import * as Maskbook from '../providers/Maskbook'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import {
    currentChainIdSettings,
    currentAccountSettings,
    currentProviderSettings,
    currentNetworkSettings,
} from '../../../../plugins/Wallet/settings'

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
        clientMeta: {
            name: 'Mask Netowrk',
            description: 'Mask Network',
            url: 'https://mask.io',
            icons: ['https://mask.io/apple-touch-icon.png'],
        },
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

//#region rpc
export async function signPersonalMessage(data: string, address: string, password: string) {
    if (!connector) throw new Error('Connection Lost.')
    return (await connector.signPersonalMessage([data, address, password])) as string
}

export async function sendCustomRequest(payload: IJsonRpcRequest) {
    if (!connector) throw new Error('Connection Lost.')
    return (await connector.sendCustomRequest(payload as IJsonRpcRequest)) as JsonRpcResponse
}
//#endregion

// Wrap promise as PromiEvent because WalletConnect returns transaction hash only
// docs: https://docs.walletconnect.org/client-api
export function createWeb3(chainId = currentChainIdSettings.value) {
    return Maskbook.createWeb3({
        chainId,
    })
}
//#endregion

/**
 * Request accounts from WalletConnect
 * @param timeout
 */
export async function requestAccounts() {
    const connector_ = await createConnectorIfNeeded()
    return new Promise<{ accounts: string[]; chainId: ChainId }>(async (resolve, reject) => {
        function resolve_() {
            resolve({
                accounts: connector_.accounts,
                chainId: connector_.chainId,
            })
        }
        if (connector_.accounts.length) {
            resolve_()
            return
        }
        connector_.on('connect', resolve_)
        connector_.on('update', resolve_)
        connector_.on('error', reject)
    })
}

const onConnect = async () => {
    if (!connector?.accounts.length) return
    currentChainIdSettings.value = connector.chainId
    currentNetworkSettings.value = getNetworkTypeFromChainId(connector.chainId)
    await updateWalletInDB(first(connector.accounts) ?? '', connector.peerMeta?.name, true)
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
    currentChainIdSettings.value = connector.chainId
    currentNetworkSettings.value = getNetworkTypeFromChainId(connector.chainId)
    await updateWalletInDB(first(connector.accounts) ?? '', connector.peerMeta?.name, false)
}

const onDisconnect = async (error: Error | null) => {
    if (connector?.connected) await connector.killSession()
    connector = null
    if (currentProviderSettings.value === ProviderType.WalletConnect) {
        currentAccountSettings.value = ''
        currentNetworkSettings.value = NetworkType.Ethereum
    }
}

async function updateWalletInDB(address: string, name: string = 'WalletConnect', setAsDefault: boolean = false) {
    const providerType = currentProviderSettings.value

    // validate address
    if (!EthereumAddress.isValid(address)) {
        if (providerType === ProviderType.WalletConnect) currentAccountSettings.value = ''
        return
    }

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.WalletConnect, new Map([[address, { name, address }]]))

    // update the selected wallet provider type
    if (setAsDefault) currentProviderSettings.value = ProviderType.WalletConnect

    // update the selected wallet address
    if (setAsDefault || providerType === ProviderType.WalletConnect) currentAccountSettings.value = address
}
