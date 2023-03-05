import { toHex } from 'web3-utils'
import type { Wallet } from '@masknet/web3-shared-base'
import {
    ConnectionContext,
    EthereumMethodType,
    Middleware,
    ProviderType,
    isValidAddress,
} from '@masknet/web3-shared-evm'
import { SharedContextSettings } from '../../../settings/index.js'
import { Providers } from '../../Provider/provider.js'

export class MaskWallet implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (!context.writeable) {
            await next()
            return
        }

        const { account, chainId } = SharedContextSettings.value
        const provider = Providers[ProviderType.MaskWallet]

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(toHex(chainId.getCurrentValue()))
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([account])
                break
            case EthereumMethodType.MASK_ADD_WALLET:
                try {
                    if (!context.wallet) throw new Error('No wallet to be added.')
                    await provider.addWallet(context.wallet)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_ADD_OR_UPDATE_WALLET:
                try {
                    if (!context.wallet) throw new Error('No wallet to be added.')
                    await provider.updateOrAddWallet(context.wallet)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_UPDATE_WALLET:
                try {
                    const [address, updates] = context.requestArguments.params as [string, Wallet]
                    if (!isValidAddress(address)) throw new Error('Not a valid wallet address.')
                    await provider.updateWallet(address, updates)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_RENAME_WALLET:
                try {
                    const [address, name] = context.requestArguments.params as [string, string]
                    if (!isValidAddress(address)) throw new Error('Not a valid wallet address.')
                    await provider.renameWallet(address, name)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_REMOVE_WALLET:
                try {
                    const [address, password] = context.requestArguments.params as [string, string | undefined]
                    if (!isValidAddress(address)) throw new Error('Not a valid wallet address.')
                    await provider.removeWallet(address, password)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            default:
                break
        }
        await next()
    }
}
