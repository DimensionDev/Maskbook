import { first } from 'lodash-es'
import { EthereumAddress } from 'wallet.ts'
import type { Signer } from '@ethersproject/abstract-signer'
import type { TransactionRequest } from '@ethersproject/providers'
import WalletConnect from '@walletconnect/client'
import type { ITxData } from '@walletconnect/types'
import * as Maskbook from '../providers/Maskbook'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import { currentWalletConnectChainIdSettings } from '../../../../settings/settings'
import {
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
} from '../../../../plugins/Wallet/settings'
import { ProviderType } from '../../../../web3/types'

let connector: WalletConnect | null = null

/**
 * Create a new connector and destroy the previous one if exists
 */
export async function createConnector() {
    // disconnect previous connector if exists
    if (connector?.connected) await connector.killSession()

    // create a new connector
    connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        clientMeta: {
            name: 'Mask Netowrk',
            description: 'The Portal to the New, Open Internet.',
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

function hijackSigner(signer: Signer) {
    return new Proxy(signer, {
        get(target, name) {
            if (name === 'sendTransaction')
                return async (request: TransactionRequest) => {
                    const provider = createProvider()
                    const hash = await (connector?.sendTransaction(request as ITxData) as Promise<string>)
                    return provider.getTransaction(hash)
                }
            return Reflect.get(target, name)
        },
    })
}

export function createSigner() {
    const signer = Maskbook.createSigner('')
    return hijackSigner(signer)
}

export function createProvider() {
    return Maskbook.createProvider(currentWalletConnectChainIdSettings.value)
}
//#endregion

/**
 * Request accounts from WalletConnect
 * @param timeout
 */
export async function requestAccounts() {
    const connector_ = await createConnectorIfNeeded()
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
    currentWalletConnectChainIdSettings.value = connector.chainId
    await updateWalletInDB(first(connector.accounts) ?? '', connector.peerMeta?.name, false)
}

const onDisconnect = async (error: Error | null) => {
    if (connector?.connected) await connector.killSession()
    connector = null
    if (currentSelectedWalletProviderSettings.value === ProviderType.WalletConnect)
        currentSelectedWalletAddressSettings.value = ''
}

async function updateWalletInDB(address: string, name: string = 'WalletConnect', setAsDefault: boolean = false) {
    const provider_ = currentSelectedWalletProviderSettings.value

    // validate address
    if (!EthereumAddress.isValid(address)) {
        if (provider_ === ProviderType.WalletConnect) currentSelectedWalletAddressSettings.value = ''
        return
    }

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.WalletConnect, new Map([[address, { name, address }]]))

    // update the selected wallet provider type
    if (setAsDefault) currentSelectedWalletProviderSettings.value = ProviderType.WalletConnect

    // update the selected wallet address
    if (setAsDefault || provider_ === ProviderType.WalletConnect) currentSelectedWalletAddressSettings.value = address
}
