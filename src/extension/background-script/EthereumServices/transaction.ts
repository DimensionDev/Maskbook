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
import { WalletProviderType } from '../../../plugins/shared/findOutProvider'
import { isSameAddr } from '../../../web3/helpers'
import { getNonce, resetNonce, commitNonce } from '../NonceService'
import type { ChainId } from '../../../web3/types'

//#region tracking wallets
let wallets: WalletRecord[] = []
const resetWallet = async () => (wallets = await getWallets())
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)
//#endregion

async function createTransactionSender(from: string, config: TransactionConfig) {
    // Adding the wallet address into DB is required before sending transaction.
    // It helps to determine which provider to be used for sending the transaction.
    const wallet = wallets.find((x) => isSameAddr(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    console.log('DEBUG: send transaction')
    console.log({
        from,
        config,
    })

    // Managed wallets need calc gas, gasPrice and nonce.
    // Add the private key into eth accounts list is also required.
    if (wallet.type === 'managed') {
        const web3 = createWeb3(Maskbook.createProvider())
        const privateKey = wallet._private_key_
        if (privateKey) {
            ;[config.nonce, config.gas, config.gasPrice] = await Promise.all([
                await getNonce(from),
                web3.eth.estimateGas({
                    from,
                    ...config,
                }),
                web3.eth.getGasPrice(),
            ])
            return () => createWeb3(Maskbook.createProvider(), [privateKey]).eth.sendTransaction(config)
        } else throw new Error(`cannot find private key for wallet ${wallet.address}`)
    }

    // MetaMask provider can be wrapped into web3 lib directly.
    // https://github.com/MetaMask/extension-provider
    if (wallet.provider === WalletProviderType.metamask)
        return () => createWeb3(MetaMask.createProvider()).eth.sendTransaction(config)

    // Wrap promise as PromiEvent because WalletConnect returns transaction hash only
    // docs: https://docs.walletconnect.org/client-api
    if (wallet.provider === WalletProviderType.wallet_connect) {
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
export async function* sendTransaction(from: string, config: TransactionConfig) {
    try {
        const sender = await createTransactionSender(from, config)
        for await (const stage of promiEventToIterator(sender())) {
            console.log('DEBUG: stage')
            console.log(stage)

            if (stage.type === StageType.TRANSACTION_HASH) commitNonce(from)
            yield stage
        }
    } catch (err) {
        console.log('DEBUG: err')
        console.log(err)
        if (err.message.includes('nonce too low')) resetNonce(from)
        // TODO:
        // nonce too hige?
        throw err
    }
}

/**
 * Send signed transaction on different provider with given account is the same as `eth_sendSignedTransaction`
 * @param from
 * @param config
 */
export async function sendSignedTransaction(from: string, config: TransactionConfig) {
    throw new Error('not implemented')
}

/**
 * Call transaction on different providers with a given account
 * same as `eh_call`
 * @param from
 * @param config
 */
export async function callTransaction(from: string, config: TransactionConfig) {
    const wallet = wallets.find((x) => isSameAddr(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    if (wallet.type === 'managed') return createWeb3(Maskbook.createProvider()).eth.call(config)
    if (wallet.provider === 'metamask') return createWeb3(MetaMask.createProvider()).eth.call(config)
    if (wallet.provider === WalletProviderType.wallet_connect) {
        const connector = await WalletConnect.createConnector()
        return createWeb3(Maskbook.createProvider(connector.chainId as ChainId), []).eth.call(config)
    }
    throw new Error(`cannot call transaction for wallet ${wallet.address}`)
}
