import type { TransactionConfig, PromiEvent, TransactionReceipt } from 'web3-core'
import type { ITxData } from '@walletconnect/types'

import { promiEventToIterator, StageType } from '../../../utils/promiEvent'
import { getWallets } from '../../../plugins/Wallet/wallet'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import { createWeb3 } from './web3'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { isSameAddress } from '../../../web3/helpers'
import { getNonce, resetNonce, commitNonce } from './nonce'
import type { ChainId } from '../../../web3/types'
import { ProviderType } from '../../../web3/types'
import { unreachable } from '../../../utils/utils'

//#region tracking wallets
let wallets: WalletRecord[] = []
const resetWallets = async () => (wallets = await getWallets())
PluginMessageCenter.on('maskbook.wallets.reset', resetWallets)
//#endregion

async function createTransactionSender(from: string, config: TransactionConfig) {
    // Adding the wallet address into DB is required before sending transaction.
    // It helps to determine which provider to be used for sending the transaction.
    const wallet = wallets.find((x) => isSameAddress(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    console.log('DEBUG: send transaction')
    console.log({
        from,
        config,
    })

    // Managed wallets need calc gas, gasPrice and nonce.
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
        ])
        return () =>
            createWeb3(Maskbook.createProvider(), [privateKey]).eth.sendTransaction({
                from,
                nonce,
                gas,
                gasPrice,
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
        const connector = await WalletConnect.createConnector()
        return () => {
            const listeners: { name: string; listener: Function }[] = []
            const promise = connector.sendTransaction(config as ITxData)
            Object.assign(promise, {
                on(name: string, listener: Function) {
                    listeners.push({ name, listener })
                },
            })
            promise.then((hash) =>
                listeners.filter((x) => x.name === 'transactionHash').forEach((y) => y.listener(hash)),
            )
            return promise as PromiEvent<TransactionReceipt>
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
export async function* sendTransaction(
    from: string,
    config: TransactionConfig,
    meta?: {
        name?: string
        args?: string[]
    },
) {
    try {
        const sender = await createTransactionSender(from, config)
        for await (const stage of promiEventToIterator(sender())) {
            console.log('DEBUG: stage')
            console.log(stage)

            if (stage.type === StageType.TRANSACTION_HASH) {
                await commitNonce(from)
                // TODO:
                // record every transaction in DB
                yield stage
            }
            yield stage
            // stop if confirmed
            if (stage.type === StageType.CONFIRMATION) break
        }
        return
    } catch (err) {
        console.log('DEBUG: sendTransaction error')
        console.log(err)
        if (err.message.includes('nonce too low')) resetNonce(from)
        // TODO:
        // nonce too high?
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
    // use can use callTransaction without account
    if (!from) return createWeb3(Maskbook.createProvider()).eth.call(config)

    // select specific provider with given wallet address
    const wallet = wallets.find((x) => isSameAddress(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    // choose provider
    if (wallet.provider === ProviderType.Maskbook) return createWeb3(Maskbook.createProvider()).eth.call(config)
    if (wallet.provider === ProviderType.MetaMask) return MetaMask.createWeb3().eth.call(config)
    if (wallet.provider === ProviderType.WalletConnect) {
        const connector = await WalletConnect.createConnector()
        return createWeb3(Maskbook.createProvider(connector.chainId as ChainId), []).eth.call(config)
    }
    unreachable(wallet.provider)
}
