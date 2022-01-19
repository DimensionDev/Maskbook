import { first } from 'lodash-unified'
import type { JsonRpcResponse } from 'web3-core-helpers'
import WalletConnect from '@walletconnect/client'
import type { IJsonRpcRequest } from '@walletconnect/types'
import { ProviderType, ChainId } from '@masknet/web3-shared-evm'
import * as MaskWallet from './MaskWallet'
import { resetAccount, updateAccount } from '../../../../plugins/Wallet/services'
import { currentChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'

let connector: WalletConnect | null = null

/**
 * Create a new connector and destroy the previous one if exists
 */
export async function createConnector() {
    if (connector?.connected) return connector

    // create a new connector
    connector = new WalletConnect({
        bridge: 'https://uniswap.bridge.walletconnect.org',
        clientMeta: {
            name: 'Mask Network',
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

// #region rpc
export async function signPersonalMessage(data: string, address: string, password: string) {
    if (!connector) throw new Error('Connection Lost.')
    return (await connector.signPersonalMessage([data, address, password])) as string
}

export async function sendCustomRequest(payload: IJsonRpcRequest) {
    if (!connector) throw new Error('Connection Lost.')
    return (await connector.sendCustomRequest(payload as IJsonRpcRequest)) as JsonRpcResponse
}
// #endregion

// Wrap promise as PromiEvent because WalletConnect returns transaction hash only
// docs: https://docs.walletconnect.org/client-api
export function createWeb3({ chainId = currentChainIdSettings.value }: { chainId?: ChainId } = {}) {
    return MaskWallet.createWeb3({
        chainId,
    })
}
// #endregion

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

const onConnect = () => onUpdate(null)

const onUpdate = async (
    error: Error | null,
    payload?: {
        params: {
            chainId: number
            accounts: string[]
        }[]
    },
) => {
    if (error) return
    if (!connector?.accounts.length) return
    if (currentProviderSettings.value !== ProviderType.WalletConnect) return
    await updateAccount({
        name: connector.peerMeta?.name,
        account: first(connector.accounts),
        chainId: connector.chainId,
        providerType: ProviderType.WalletConnect,
    })
}

const onDisconnect = async (error: Error | null) => {
    if (connector?.connected) await connector.killSession()
    connector = null
    if (currentProviderSettings.value !== ProviderType.WalletConnect) return
    await resetAccount({
        providerType: ProviderType.WalletConnect,
    })
}
