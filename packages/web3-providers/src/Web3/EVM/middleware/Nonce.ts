import { toHex } from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import { type ChainId, EthereumMethodType, ProviderType, type Middleware } from '@masknet/web3-shared-evm'
import { RequestReadonlyAPI } from '../apis/RequestReadonlyAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class Nonce implements Middleware<ConnectionContext> {
    static INITIAL_NONCE = -1

    private Request = new RequestReadonlyAPI()
    private nonces = new Map<string, Map<ChainId, number>>()

    private async syncRemoteNonce(chainId: ChainId, address: string, commitment = 0) {
        const address_ = EthereumAddress.checksumAddress(address)
        const addressNonces = this.nonces.get(address_) ?? new Map<ChainId, number>()
        addressNonces.set(
            chainId,
            commitment +
                Math.max(
                    await this.Request.getWeb3({ chainId }).eth.getTransactionCount(address),
                    addressNonces.get(chainId) ?? Nonce.INITIAL_NONCE,
                ),
        )

        // set back into cache
        this.nonces.set(address_, addressNonces)
        return addressNonces.get(chainId)!
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        // set a nonce for Mask wallets
        if (
            !context.owner &&
            context.account &&
            context.providerType === ProviderType.MaskWallet &&
            context.method === EthereumMethodType.ETH_SEND_TRANSACTION
        ) {
            context.requestArguments = {
                method: context.method,
                params: [
                    {
                        ...context.config,
                        nonce: toHex(await this.syncRemoteNonce(context.chainId, context.account)),
                    },
                ],
            }
        }

        await next() // send transaction

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

        try {
            const message = context.error?.message ?? ''
            const isGeneralErrorNonce = /\bnonce|transaction\b/im.test(message) && /\b(low|high|old)\b/im.test(message)
            const isAuroraErrorNonce = message.includes('ERR_INCORRECT_NONCE')

            // if a transaction hash was received then commit the nonce
            if (isGeneralErrorNonce || isAuroraErrorNonce) await this.syncRemoteNonce(context.chainId, context.account)
            // else if a nonce error was occurred then reset the nonce
            else if (!context.error && typeof context.result === 'string')
                await this.syncRemoteNonce(context.chainId, context.account, 1)
        } catch {
            // to scan the context to determine how to update the local nonce, allow to fail silently
        }
    }
}
