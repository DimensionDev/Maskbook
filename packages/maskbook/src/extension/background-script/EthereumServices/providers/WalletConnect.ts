import Web3 from 'web3'
import type { Eth } from 'web3-eth'
import type { Personal } from 'web3-eth-personal'
import { EthereumAddress } from 'wallet.ts'
import type { provider as Provider, PromiEvent as PromiEventW3 } from 'web3-core'
import WalletConnect from '@walletconnect/client'
import type { ITxData } from '@walletconnect/types'
import * as Maskbook from '../providers/Maskbook'
import { updateExoticWalletFromSource } from '../../../../plugins/Wallet/services'
import {
    currentWalletConnectChainIdSettings,
    currentWalletConnectConnectedSettings,
} from '../../../../settings/settings'
import { currentSelectedWalletAddressSettings } from '../../../../plugins/Wallet/settings'
import { TransactionEventType } from '../../../../web3/types'
import { ProviderType } from '../../../../web3/types'

let web3: Web3 | null = null
let provider: Provider | null = null
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
    currentWalletConnectConnectedSettings.value = connector.connected
    return connector
}

export async function createConnectorIfNeeded() {
    if (connector) return connector
    return createConnector()
}

export function createProvider() {
    if (!connector?.connected) throw new Error('The connection is lost, please reconnect.')
    return Maskbook.createProvider(currentWalletConnectChainIdSettings.value)
}

//#region hijack web3js calls and forword them to walletconnect APIs
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

                        return (promise as unknown) as PromiEventW3<string>
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
export function createWeb3() {
    provider = createProvider()
    if (!web3) web3 = new Web3(provider)
    else web3.setProvider(provider)
    return Object.assign(web3, {
        eth: hijackETH(web3.eth),
    })
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
    for (const account of connector.accounts) await updateWalletInDB(account, connector.peerMeta?.name, true)
    currentWalletConnectConnectedSettings.value = connector.connected
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
    currentWalletConnectConnectedSettings.value = connector.connected
}

const onDisconnect = async (error: Error | null) => {
    if (connector?.connected) await connector.killSession()
    connector = null
    currentWalletConnectConnectedSettings.value = false
}

async function updateWalletInDB(address: string, name: string = 'WalletConnect', setAsDefault: boolean = false) {
    // validate address
    if (!EthereumAddress.isValid(address)) throw new Error('Cannot found account or invalid account')

    // update wallet in the DB
    await updateExoticWalletFromSource(ProviderType.WalletConnect, new Map([[address, { name, address }]]))

    // update the selected wallet address
    if (setAsDefault) currentSelectedWalletAddressSettings.value = address
}
