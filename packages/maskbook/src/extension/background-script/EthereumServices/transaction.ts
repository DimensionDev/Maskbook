import type { TransactionConfig, PromiEvent as PromiEventW3, TransactionReceipt } from 'web3-core'
import BigNumber from 'bignumber.js'

import { enhancePromiEvent, promiEventToIterator, StageType } from '../../../utils/promiEvent'
import { getWallets } from '../../../plugins/Wallet/services'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { isSameAddress } from '../../../web3/helpers'
import { getNonce, resetNonce, commitNonce } from './nonce'
import { TransactionEventType } from '../../../web3/types'
import { ProviderType } from '../../../web3/types'
import { delay } from '../../../utils/utils'
import { getTransactionReceipt } from './network'
import { getChainId } from './chainState'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidate = async () => (wallets = await getWallets())
WalletMessages.events.walletsUpdated.on(revalidate)
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
            await delay(15 /* seconds */ * 1000 /* milliseconds */)
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

    // Tracking provider type by settings
    const provider = currentSelectedWalletProviderSettings.value

    // For managed wallets need gas, gasPrice and nonce to be calculated.
    // Add the private key into eth accounts list is also required.
    if (provider === ProviderType.Maskbook) {
        const privateKey = wallet._private_key_
        if (!privateKey) throw new Error(`cannot find private key for wallet ${wallet.address}`)

        // FIXME:
        // __provider_url__ only used by useEtherTransferCallback
        const web3 = Maskbook.createWeb3(
            await getChainId(from),
            [privateKey],
            (config as { __provider_url__?: string }).__provider_url__,
        )
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

    if (provider === ProviderType.MetaMask) {
        const web3 = await MetaMask.createWeb3()
        return () => web3.eth.sendTransaction(config)
    }
    if (provider === ProviderType.WalletConnect) return () => WalletConnect.createWeb3().eth.sendTransaction(config)
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
        const transactionEventCreator = await createTransactionEventCreator(from, config)
        const watchedTransactionEvent = watchTransactionEvent(from, transactionEventCreator())
        for await (const stage of promiEventToIterator(watchedTransactionEvent)) {
            // advance the nonce if tx comes out
            if (stage.type === StageType.TRANSACTION_HASH) await commitNonce(from)
            yield stage
            // stop if the tx was confirmed
            if (stage.type === StageType.CONFIRMATION) break
        }
        return
    } catch (err) {
        if (err.message.includes('nonce too low')) {
            resetNonce(from)
            throw new Error('Nonce too low. Please try again.')
        }
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
 * Call transaction on Maskbook instance to ignore the variant chain ids of external providers
 * same as `eth_call`
 * @param from
 * @param config
 */

export async function callTransaction(config: TransactionConfig) {
    return Maskbook.createWeb3(await getChainId()).eth.call(config)
}
