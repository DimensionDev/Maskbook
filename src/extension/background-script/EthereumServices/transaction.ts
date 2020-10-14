import type { TransactionConfig, PromiEvent as PromiEventW3, TransactionReceipt } from 'web3-core'
import type { ITxData } from '@walletconnect/types'
import type PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'

import { enhancePromiEvent, promiEventToIterator, StageType } from '../../../utils/promiEvent'
import { getWallets } from '../../../plugins/Wallet/services'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import { createWeb3 } from './web3'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { isSameAddress } from '../../../web3/helpers'
import { getNonce, resetNonce, commitNonce } from './nonce'
import { ChainId, TransactionEventType } from '../../../web3/types'
import { ProviderType } from '../../../web3/types'
import { sleep, unreachable } from '../../../utils/utils'
import { getTransactionReceipt } from './network'

//#region tracking wallets
let wallets: WalletRecord[] = []
const updateWallets = async () => (wallets = await getWallets())
PluginMessageCenter.on('maskbook.wallets.update', updateWallets)
updateWallets()
//#endregion

/**
 * For some providers which didn't emit 'receipt' event
 * we polling receipt from the chain and emit the event manually
 * @param event
 */
function watchTransactionEvent(event: PromiEventW3<TransactionReceipt | string>) {
    // add emit method
    const enhancedEvent = enhancePromiEvent(event)
    const controller = new AbortController()
    async function watchTransactionHash(hash: string) {
        // retry 30 times
        for await (const _ of new Array(30).fill(0)) {
            const receipt = await getTransactionReceipt(hash)

            console.log('DEBUG: watch tx')
            console.log(receipt)

            // the 'receipt' event was emitted
            if (controller.signal.aborted) break
            // emit receipt manually
            if (receipt) {
                enhancedEvent.emit(TransactionEventType.RECEIPT, receipt)
                controller.abort()
                break
            }
            // wait for next block
            await sleep(15 /* seconds */ * 1000 /* milliseconds */)
        }
        // timeout
        if (!controller.signal.aborted) enhancedEvent.emit(TransactionEventType.ERROR, new Error('timeout'))
    }
    function unwatchTransactionHash() {
        controller.abort()
    }
    enhancedEvent.on(TransactionEventType.TRANSACTION_HASH, watchTransactionHash)
    enhancedEvent.on(TransactionEventType.RECEIPT, unwatchTransactionHash)
    enhancedEvent.on(TransactionEventType.CONFIRMATION, unwatchTransactionHash)
    enhancedEvent.on(TransactionEventType.ERROR, unwatchTransactionHash)
    return enhancedEvent
}

async function createTransactionEventCreator(from: string, config: TransactionConfig) {
    // Adding the wallet address into DB is required before sending transaction.
    // It helps to determine which provider to be used for sending the transaction.
    const wallet = wallets.find((x) => isSameAddress(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    // For managed wallets need gas, gasPrice and nonce to be calculated.
    // Add the private key into eth accounts list is also required.
    if (wallet.provider === ProviderType.Maskbook) {
        const web3 = createWeb3(Maskbook.createProvider())
        const privateKey = wallet._private_key_
        if (!privateKey) throw new Error(`cannot find private key for wallet ${wallet.address}`)
        const [nonce, gas, gasPrice] = await Promise.all([
            config.nonce ?? getNonce(from),
            config.gas ??
                web3.eth.estimateGas({
                    from,
                    ...config,
                }),
            config.gasPrice ?? web3.eth.getGasPrice(),
        ] as const)
        return () =>
            createWeb3(Maskbook.createProvider(), [privateKey]).eth.sendTransaction({
                from,
                nonce,
                gas,
                gasPrice: new BigNumber(gasPrice as string).toFixed(),
                ...config,
            })
    }

    // MetaMask provider can be wrapped into web3 lib directly.
    // https://github.com/MetaMask/extension-provider
    if (wallet.provider === ProviderType.MetaMask)
        return () => createWeb3(MetaMask.createProvider()).eth.sendTransaction(config)

    // Wrap promise as PromiEvent because WalletConnect returns transaction hash only
    // docs: https://docs.walletconnect.org/client-api
    if (wallet.provider === ProviderType.WalletConnect) {
        const connector = await WalletConnect.createConnectorIfNeeded()
        return () => {
            console.log('DEBUG: wallet connect send transaction')
            console.log(config)

            const listeners: { name: string; listener: Function }[] = []
            const promise = connector.sendTransaction(config as ITxData) as Promise<string>

            // mimic PromiEvent API
            Object.assign(promise, {
                on(name: string, listener: Function) {
                    listeners.push({ name, listener })
                },
            })

            // only trasnaction hash available
            promise
                .then((hash) => {
                    console.log('DEBUG: wallet connect hash')
                    console.log(hash)

                    listeners
                        .filter((x) => x.name === TransactionEventType.TRANSACTION_HASH)
                        .forEach((y) => y.listener(hash))
                })
                .catch((e) => {
                    console.log('DEBUG: wallet connect error')
                    console.log(e)

                    listeners.filter((x) => x.name === TransactionEventType.ERROR).forEach((y) => y.listener(e))
                })

            return (promise as unknown) as PromiEventW3<string>
        }
    }
    throw new Error(`cannot send transaction for wallet ${wallet.address}`)
}

/**
 * Send transaction on different providers with a given account
 * same as `eth_sendTransaction`
 * @param from
 * @param config
 */
export async function* sendTransaction(from: string, config: TransactionConfig) {
    try {
        const createTransactionEvent = await createTransactionEventCreator(from, config)
        const watchedTransactionEvent = watchTransactionEvent(createTransactionEvent())
        for await (const stage of promiEventToIterator(watchedTransactionEvent)) {
            // advance the nonce if tx comes out
            if (stage.type === StageType.TRANSACTION_HASH) await commitNonce(from)
            yield stage
            // stop if the tx was confirmed
            if (stage.type === StageType.CONFIRMATION) break
        }
        return
    } catch (err) {
        if (err.message.includes('nonce too low')) resetNonce(from)
        throw err
    }
}

/**
 * Send signed transaction on different provider with given account is the same as `eth_sendSignedTransaction`
 * @param from
 * @param config
 */
export async function sendSignedTransaction(from: string, config: TransactionConfig) {
    throw new Error('TO BE IMPLEMENTED')
}

/**
 * Call transaction on different providers with a given account
 * same as `eth_call`
 * @param from
 * @param config
 */
export async function callTransaction(from: string | undefined, config: TransactionConfig) {
    // user can use callTransaction without account
    if (!from) return createWeb3(Maskbook.createProvider()).eth.call(config)

    // select specific provider with given wallet address
    const wallet = wallets.find((x) => isSameAddress(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    // choose provider
    if (wallet.provider === ProviderType.Maskbook) return createWeb3(Maskbook.createProvider()).eth.call(config)
    if (wallet.provider === ProviderType.MetaMask) return MetaMask.createWeb3().eth.call(config)
    if (wallet.provider === ProviderType.WalletConnect) {
        const connector = await WalletConnect.createConnectorIfNeeded()
        return createWeb3(Maskbook.createProvider(connector.chainId as ChainId)).eth.call(config)
    }
    unreachable(wallet.provider)
}
