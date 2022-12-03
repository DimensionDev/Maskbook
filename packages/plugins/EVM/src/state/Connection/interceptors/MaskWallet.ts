import { toHex } from 'web3-utils'
import { ChainId, EthereumMethodType } from '@masknet/web3-shared-evm'
import { SmartPayAccount } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Wallet } from '@masknet/web3-shared-base'
import type { Context, Middleware } from '../types.js'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'

export class MaskWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        const { hasNativeAPI, send, account, chainId } = SharedContextSettings.value
        const { Wallet } = Web3StateSettings.value
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
                const now = new Date()
                const wallets = Wallet?.wallets?.getCurrentValue() ?? EMPTY_LIST
                const contractAccounts = await SmartPayAccount.getAccounts(
                    ChainId.Matic,
                    wallets.map((x) => x.address),
                )
                context.write([
                    ...wallets,
                    ...contractAccounts.map<Wallet>((x) => ({
                        id: x.address,
                        name: 'Smart Pay',
                        address: x.address,
                        hasDerivationPath: false,
                        hasStoredKeyInfo: false,
                        configurable: true,
                        createdAt: now,
                        updatedAt: now,
                        owner: x.owner,
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
