import type { TransactionConfig, PromiEvent as PromiEventW3, TransactionReceipt } from 'web3-core'
import BigNumber from 'bignumber.js'

import { enhancePromiEvent, promiEventToIterator, StageType } from '../../../utils/promiEvent'
import { getWallets } from '../../../plugins/Wallet/services'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { isSameAddress } from '../../../web3/helpers'
import { getNonce, resetNonce, commitNonce } from './nonce'
import { TransactionEventType } from '../../../web3/types'
import { ProviderType } from '../../../web3/types'
import { sleep, unreachable } from '../../../utils/utils'
import { getTransactionReceipt } from './network'
import { getChainId } from './chainState'

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidate = async () => (wallets = await getWallets())
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
revalidate()
//#endregion

/**
 * For some providers which didn't emit 'receipt' event
 * we polling receipt from the chain and emit the event manually
 * @param from
 * @param event
 */
function watchTransactionEvent(from: string, event: PromiEventW3<TransactionReceipt | string>) {
    // add emit method
    const enhancedEvent = enhancePromiEvent(event)
    const controller = new AbortController()
    async function watchTransactionHash(hash: string) {
        // retry 30 times
        for (const _ of new Array(30).fill(0)) {
            const receipt = await getTransactionReceipt(hash, await getChainId(from))

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
        const privateKey = wallet._private_key_
        if (!privateKey) throw new Error(`cannot find private key for wallet ${wallet.address}`)
        const web3 = Maskbook.createWeb3(await getChainId(from), [privateKey])
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
            web3.eth.sendTransaction({
                from,
                nonce,
                gas,
                gasPrice: new BigNumber(gasPrice as string).toFixed(),
                ...config,
            })
    }

    if (wallet.provider === ProviderType.MetaMask) return () => MetaMask.createWeb3().eth.sendTransaction(config)
    if (wallet.provider === ProviderType.WalletConnect)
        return () => WalletConnect.createWeb3().eth.sendTransaction(config)
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
        const watchedTransactionEvent = watchTransactionEvent(from, createTransactionEvent())
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
    if (!from) return Maskbook.createWeb3().eth.call(config)

    // select specific provider with given wallet address
    const wallet = wallets.find((x) => isSameAddress(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    // choose provider
    if (wallet.provider === ProviderType.Maskbook) return Maskbook.createWeb3().eth.call(config)
    if (wallet.provider === ProviderType.MetaMask) return MetaMask.createWeb3().eth.call(config)
    if (wallet.provider === ProviderType.WalletConnect) return WalletConnect.createWeb3().eth.call(config)
    unreachable(wallet.provider)
}
