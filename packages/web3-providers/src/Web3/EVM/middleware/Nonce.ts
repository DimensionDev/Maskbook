import { toHex } from 'web3-utils'
import {
    type ChainId,
    EthereumMethodType,
    ProviderType,
    type Middleware,
    checksumAddress,
} from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { ConnectionReadonlyAPI } from '../apis/ConnectionReadonlyAPI.js'

export class Nonce implements Middleware<ConnectionContext> {
    static INITIAL_NONCE = -1

    private Web3 = new ConnectionReadonlyAPI()

    // account address => chainId => nonce
    private nonces = new Map<string, Map<ChainId, number>>()

    private async syncRemoteNonce(chainId: ChainId, address: string, providerURL?: string, commitment = 0) {
        const address_ = checksumAddress(address)
        const addressNonces = this.nonces.get(address_) ?? new Map<ChainId, number>()

        addressNonces.set(
            chainId,
            commitment +
                Math.max(
                    await this.Web3.getTransactionNonce(address, {
                        chainId,
                        providerURL,
                    }),
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
                        nonce: toHex(await this.syncRemoteNonce(context.chainId, context.account, context.providerURL)),
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

            // if a nonce error was occurred then reset the nonce
            if (isGeneralErrorNonce || isAuroraErrorNonce)
                await this.syncRemoteNonce(context.chainId, context.account, context.providerURL)
            // if a transaction hash was received then commit the nonce
            else if (!context.error && typeof context.result === 'string')
                await this.syncRemoteNonce(context.chainId, context.account, context.providerURL, 1)
        } catch {
            // to scan the context to determine how to update the local nonce, allow to fail silently
        }
    }
}
