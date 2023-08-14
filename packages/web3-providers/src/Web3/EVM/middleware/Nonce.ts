import { toHex } from 'web3-utils'
import { formatURL } from '@masknet/web3-shared-base'
import {
    type ChainId,
    EthereumMethodType,
    ProviderType,
    type Middleware,
    checksumAddress,
    ProviderURL,
} from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { ConnectionReadonlyAPI } from '../apis/ConnectionReadonlyAPI.js'

export class Nonce implements Middleware<ConnectionContext> {
    static INITIAL_NONCE = -1

    private Web3 = new ConnectionReadonlyAPI()

    // account address => providerURL => nonce
    private nonces = new Map<string, Map<string, number>>()

    private async syncRemoteNonce(chainId: ChainId, address: string, providerURL?: string, commitment = 0) {
        const address_ = checksumAddress(address)
        const addressNonces = this.nonces.get(address_) ?? new Map<string, number>()

        // the assumption here: if the providerURL is not provided, it must be a built-in provider was used.
        // the ProviderURL.from() will throw if the chain id doesn't belong to a built-in network.
        // and we ignore the situtation that the custom network chain id is the same with a built-in network.
        const providerURL_ = formatURL(providerURL ?? ProviderURL.from(chainId))

        addressNonces.set(
            providerURL_,
            commitment +
                Math.max(
                    await this.Web3.getTransactionNonce(address, {
                        chainId,
                        providerURL: providerURL_,
                    }),
                    addressNonces.get(providerURL_) ?? Nonce.INITIAL_NONCE,
                ),
        )

        // set back into cache
        this.nonces.set(address_, addressNonces)
        return addressNonces.get(providerURL_)!
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

            // if a transaction hash was received then commit the nonce
            if (isGeneralErrorNonce || isAuroraErrorNonce)
                await this.syncRemoteNonce(context.chainId, context.account, context.providerURL)
            // else if a nonce error was occurred then reset the nonce
            else if (!context.error && typeof context.result === 'string')
                await this.syncRemoteNonce(context.chainId, context.account, context.providerURL, 1)
        } catch {
            // to scan the context to determine how to update the local nonce, allow to fail silently
        }
    }
}
