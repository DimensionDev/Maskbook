import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { first } from 'lodash-es'
import type { Eth } from 'web3-eth'
import type { Personal } from 'web3-eth-personal'
import { EthereumAddress } from 'wallet.ts'
import type { HttpProvider, PromiEvent as PromiEventW3 } from 'web3-core'
import WalletConnect from '@walletconnect/client'
import type { IJsonRpcRequest } from '@walletconnect/types'
import type { ITxData } from '@walletconnect/types'
import { ChainId, TransactionEventType, ProviderType, getNetworkTypeFromChainId } from '@dimensiondev/web3-shared'
import * as Maskbook from '../providers/Maskbook'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import {
    currentWalletConnectChainIdSettings,
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
    currentSelectedWalletNetworkSettings,
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

//#region hijack web3js calls and forword them to walletconnenct APIs
function hijackETH(eth: Eth) {
    return new Proxy(eth, {
        get(target, name) {
            switch (name) {
                case 'personal':
                    return hijackPersonal(Reflect.get(target, 'personal'))
                case 'sendTransaction':
                    return (txData: ITxData, callback?: () => void) => {
                        const listeners: { name: string; listener: Function }[] = []
                        const promise = connector?.sendTransaction(txData) as Promise<string>

                        // mimic PromiEvent API
                        Object.assign(promise, {
                            on(name: string, listener: Function) {
                                listeners.push({ name, listener })
                            },
                        })

                        // only trasnaction hash available
                        promise
                            .then((hash) => {
                                listeners
                                    .filter((x) => x.name === TransactionEventType.TRANSACTION_HASH)
                                    .forEach((y) => y.listener(hash))
                            })
                            .catch((e) => {
                                listeners
                                    .filter((x) => x.name === TransactionEventType.ERROR)
                                    .forEach((y) => y.listener(e))
                            })

                        return promise as unknown as PromiEventW3<string>
                    }
                default:
                    return Reflect.get(target, name)
            }
        },
    })
}

function hijackCurrentProvider(provider: HttpProvider | null) {
    if (!provider) return
    return new Proxy(provider, {
        get(target, name) {
            switch (name) {
                case 'send':
                    return async (
                        payload: JsonRpcPayload,
                        callback: (error: Error | null, response?: JsonRpcResponse) => void,
                    ) => {
                        try {
                            const response = (await connector?.sendCustomRequest(
                                payload as IJsonRpcRequest,
                            )) as JsonRpcResponse
                            callback(null, response)
                        } catch (e) {
                            callback(e)
                        }
                    }
                default:
                    return Reflect.get(target, name)
            }
        },
    })
}

function hijackPersonal(personal: Personal) {
    return new Proxy(personal, {
        get(target, name) {
            switch (name) {
                // personal_sign
                case 'sign':
                    return async (
                        data: string,
                        address: string,
                        password: string,
                        callback?: (signed: string) => void,
                    ) => {
                        const signed = (await connector?.signPersonalMessage([data, address, password])) as string
                        if (callback) callback(signed)
                        return signed
                    }
                default:
                    return Reflect.get(target, name)
            }
        },
    })
}

// Wrap promise as PromiEvent because WalletConnect returns transaction hash only
// docs: https://docs.walletconnect.org/client-api
export function createWeb3(chainId = currentWalletConnectChainIdSettings.value) {
    const web3 = Maskbook.createWeb3({
        chainId,
    })
    return Object.assign(web3, {
        eth: hijackETH(web3.eth),
        currentProvider: hijackCurrentProvider(web3.currentProvider as HttpProvider | null),
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
    currentWalletConnectChainIdSettings.value = connector.chainId
    currentSelectedWalletNetworkSettings.value = getNetworkTypeFromChainId(connector.chainId)
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
    currentSelectedWalletNetworkSettings.value = getNetworkTypeFromChainId(connector.chainId)
    await updateWalletInDB(first(connector.accounts) ?? '', connector.peerMeta?.name, false)
}

const onDisconnect = async (error: Error | null) => {
    if (connector?.connected) await connector.killSession()
    connector = null
    if (currentSelectedWalletProviderSettings.value === ProviderType.WalletConnect)
        currentSelectedWalletAddressSettings.value = ''
}

async function updateWalletInDB(address: string, name: string = 'WalletConnect', setAsDefault: boolean = false) {
    const providerType = currentSelectedWalletProviderSettings.value

    // validate address
    if (!EthereumAddress.isValid(address)) {
        if (providerType === ProviderType.WalletConnect) currentSelectedWalletAddressSettings.value = ''
        return
    }

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.WalletConnect, new Map([[address, { name, address }]]))

    // update the selected wallet provider type
    if (setAsDefault) currentSelectedWalletProviderSettings.value = ProviderType.WalletConnect

    // update the selected wallet address
    if (setAsDefault || providerType === ProviderType.WalletConnect)
        currentSelectedWalletAddressSettings.value = address
}
