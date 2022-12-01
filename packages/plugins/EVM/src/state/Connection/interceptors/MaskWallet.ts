import { toHex } from 'web3-utils'
import { ChainId, EthereumMethodType } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types.js'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'
import { SmartPayAccount } from '@masknet/web3-providers'
import type { Wallet } from '@masknet/web3-shared-base'

export class MaskWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { hasNativeAPI, send, account, chainId, wallets } = SharedContextSettings.value
        // redirect to native app
        if (hasNativeAPI) {
            try {
                const response = await send(context.request)
                context.end(new Error(response.error?.message ?? 'Unknown Error'), response.result)
            } catch (error) {
                context.abort(error)
            } finally {
                await next()
            }
            return
        }
        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(toHex(chainId.getCurrentValue()))
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([account])
                break
            case EthereumMethodType.MASK_ACCOUNTS:
                const localWallets = wallets.getCurrentValue()
                const contractAccounts = await SmartPayAccount.getAccounts(
                    ChainId.Matic,
                    localWallets.map((x) => x.address),
                )
                const names = await Web3StateSettings.value.Provider?.getNames?.()
                context.write([
                    ...localWallets,
                    ...contractAccounts.map<Wallet>((x) => ({
                        address: x.address,
                        owner: x.owner,
                        name: names?.[x.address.toLowerCase()] ?? 'Smart Pay',
                        hasDerivationPath: false,
                        hasStoredKeyInfo: false,
                        id: x.address,
                    })),
                ])
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                const config = context.config

                if (!config?.from || !config?.to) {
                    context.abort(new Error('Invalid JSON payload.'))
                    break
                }
                break
            default:
                break
        }
        await next()
    }
}
