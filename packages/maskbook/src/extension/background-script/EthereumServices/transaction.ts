import type { TransactionRequest } from '@ethersproject/providers'
import { getWallets } from '../../../plugins/Wallet/services'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { isSameAddress } from '../../../web3/helpers'
import { getNonce, resetNonce, commitNonce } from './nonce'
import { ProviderType } from '../../../web3/types'
import { getChainId } from './chainState'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { unreachable } from '../../../utils/utils'

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidate = async () => (wallets = await getWallets())
WalletMessages.events.walletsUpdated.on(revalidate)
revalidate()
//#endregion

async function createTransactionSender(from: string, request: TransactionRequest) {
    // Adding the wallet address into DB is required before sending transaction.
    // It helps to determine which provider to be used for sending the transaction.
    const wallet = wallets.find((x) => isSameAddress(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    // Tracking provider type by settings
    const provider = currentSelectedWalletProviderSettings.value

    // For managed wallets need gas, gasPrice and nonce to be calculated.
    // Add the private key into eth accounts list is also required.
    if (provider === ProviderType.Maskbook) {
        const key = wallet._private_key_
        if (!key) throw new Error(`Unable to sign transaction for wallet ${wallet.address}.`)

        // FIXME:
        // __provider_url__ only used by useEtherTransferCallback
        const signer = Maskbook.createSigner(
            key,
            await getChainId(from),
            (request as { __provider_url__?: string }).__provider_url__,
        )
        const [nonce, gasLimit, gasPrice] = await Promise.all([
            request.nonce ?? getNonce(from),
            request.gasLimit ??
                signer.estimateGas({
                    from,
                    ...request,
                }),
            request.gasPrice ?? signer.getGasPrice(),
        ] as const)

        console.log({
            nonce,
            gasLimit,
            gasPrice,
        })

        return () =>
            signer.sendTransaction({
                from,
                nonce,
                gasLimit,
                gasPrice,
                ...request,
            })
    }
    if (provider === ProviderType.MetaMask) {
        const signer = await MetaMask.createSigner()
        return () => signer.sendTransaction(request)
    }
    if (provider === ProviderType.WalletConnect) return () => WalletConnect.createSigner().sendTransaction(request)
    unreachable(provider)
}

/**
 * Send transaction on different providers with a given account
 * same as `eth_sendTransaction`
 * @param from
 * @param request
 */
export async function sendTransaction(from: string, request: TransactionRequest) {
    try {
        const sendTransaction = await createTransactionSender(from, request)
        const response = await sendTransaction()
        commitNonce(from)
        return response
    } catch (error) {
        if (error.message.includes('nonce too low')) {
            resetNonce(from)
            throw new Error('Nonce too low. Please try again.')
        }
        throw error
    }
}

/**
 * Send signed transaction on different provider with given account is the same as `eth_sendSignedTransaction`
 * @param from
 * @param request
 */
export async function sendSignedTransaction(from: string, request: TransactionRequest) {
    throw new Error('TO BE IMPLEMENTED')
}

/**
 * Call transaction on Maskbook instance to ignore the variant chain ids of external providers
 * same as `eth_call`
 * @param from
 * @param request
 */

export async function callTransaction(request: TransactionRequest) {
    return Maskbook.createProvider(await getChainId()).call(request)
}
