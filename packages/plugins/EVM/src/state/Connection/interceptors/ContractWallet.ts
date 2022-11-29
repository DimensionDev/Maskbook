import type { AbiItem } from 'web3-utils'
import { BundlerAPI, SmartPayBundler } from '@masknet/web3-providers'
import {
    createContract,
    EthereumMethodType,
    isValidAddress,
    ProviderType,
    UserOperation,
} from '@masknet/web3-shared-evm'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet as WalletContract } from '@masknet/web3-contracts/types/Wallet.js'
import { Web3StateSettings } from '../../../settings/index.js'
import type { Middleware, Context } from '../types.js'
import { Providers } from '../provider.js'
import type { BaseHostedProvider } from '../providers/BaseHosted.js'

export class ContractWallet implements Middleware<Context> {
    constructor(protected bundler: BundlerAPI.Provider) {}

    private async createWeb3(context: Context) {
        const web3 = await Web3StateSettings.value.Connection?.getWeb3?.({
            chainId: context.chainId,
            providerType: ProviderType.MaskWallet,
        })

        if (!web3) throw new Error('Failed to create web3.')
        return web3
    }

    private async createWallet(context: Context) {
        const web3 = await this.createWeb3(context)
        const contract = createContract<WalletContract>(web3, context.account, WalletABI as AbiItem[])
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract
    }

    private sendUserOperation(context: Context, userOperation?: UserOperation): Promise<string> {
        if (!userOperation) throw new Error('Invalid user operation.')
        return SmartPayBundler.sendUserOperation(context.chainId, userOperation)
    }

    async fn(context: Context, next: () => Promise<void>) {
        const provider = Providers[context.providerType] as BaseHostedProvider | undefined

        // not a SC wallet provider
        if (!provider) {
            await next()
            return
        }

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(provider.chainId)
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                if (isValidAddress(provider.account)) {
                    context.write([provider.account])
                } else {
                    context.abort(new Error('Please connect wallet.'))
                }
                break
            case EthereumMethodType.ETH_GET_TRANSACTION_COUNT:
                try {
                    const walletContract = await this.createWallet(context)
                    const nonce = walletContract.methods.nonce()
                    context.write(nonce ?? 0)
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                try {
                    context.write(await this.sendUserOperation(context, context.userOperation))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                try {
                    context.write(await this.sendUserOperation(context, context.userOperation))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SUPPORTED_CHAIN_IDS:
                context.write(await this.bundler.getSupportedChainIds())
                break
            case EthereumMethodType.ETH_SUPPORTED_ENTRY_POINTS:
                context.write(await this.bundler.getSupportedEntryPoints(context.chainId))
                break
            case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
                context.abort(new Error('Not supported by SC wallet.'))
                break
            case EthereumMethodType.ETH_SEND_RAW_TRANSACTION:
                context.abort(new Error('Not supported by SC wallet.'))
                break
            case EthereumMethodType.SC_WALLET_CHANGE_OWNER:
                context.abort(new Error('Not implemented.'))
                break
            case EthereumMethodType.SC_WALLET_DEPLOY:
                context.abort(new Error('Not implemented.'))
                break
            default:
                break
        }

        await next()
    }
}
