import { toHex } from 'web3-utils'
import type { Wallet } from '@masknet/web3-shared-base'
import {
    type ConnectionContext,
    EthereumMethodType,
    type Middleware,
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

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(toHex(chainId.getCurrentValue()))
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([account])
                break
            case EthereumMethodType.MASK_WALLETS:
                try {
                    context.write(Providers[ProviderType.MaskWallet].subscription.wallets.getCurrentValue())
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_ADD_WALLET:
                try {
                    if (!context.wallet) throw new Error('No wallet to be added.')
                    await Providers[ProviderType.MaskWallet].addWallet(context.wallet)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_ADD_OR_UPDATE_WALLET:
                try {
                    if (!context.wallet) throw new Error('No wallet to be added.')
                    await Providers[ProviderType.MaskWallet].updateOrAddWallet(context.wallet)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_UPDATE_WALLET:
                try {
                    const [address, updates] = context.requestArguments.params as [string, Wallet]
                    if (!isValidAddress(address)) throw new Error('Not a valid wallet address.')
                    await Providers[ProviderType.MaskWallet].updateWallet(address, updates)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_RENAME_WALLET:
                try {
                    const [address, name] = context.requestArguments.params as [string, string]
                    if (!isValidAddress(address)) throw new Error('Not a valid wallet address.')
                    await Providers[ProviderType.MaskWallet].renameWallet(address, name)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_REMOVE_WALLET:
                try {
                    const [address, password] = context.requestArguments.params as [string, string | undefined]
                    if (!isValidAddress(address)) throw new Error('Not a valid wallet address.')
                    await Providers[ProviderType.MaskWallet].removeWallet(address, password)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_UPDATE_WALLETS:
                try {
                    const wallets = context.requestArguments.params as Wallet[]
                    if (wallets.some((x) => !isValidAddress(x.address))) throw new Error('Not a valid wallet address.')
                    await Providers[ProviderType.MaskWallet].updateWallets(wallets)
                    context.write()
                } catch (error) {
                    context.abort(context)
                }
                break
            case EthereumMethodType.MASK_REMOVE_WALLETS:
                try {
                    const wallets = context.requestArguments.params as Wallet[]
                    if (wallets.some((x) => !isValidAddress(x.address))) throw new Error('Not a valid wallet address.')
                    await Providers[ProviderType.MaskWallet].removeWallets(wallets)
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
