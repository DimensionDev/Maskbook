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

export class SCWallet implements Middleware<Context> {
    constructor(protected bundler: BundlerAPI.Provider) {}

    private async createWeb3(context: Context) {
        const web3 = await Web3StateSettings.value.Connection?.getWeb3?.({
            chainId: context.chainId,
            providerType: ProviderType.MaskWallet,
        })

        if (!web3) throw new Error('Failed to create web3.')
        return web3
    }

    private createUserOperation(context: Context): UserOperation {
        throw new Error('Method not implemented.')
    }

    private sendUserOperation(context: Context, userOperation: UserOperation): Promise<string> {
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
                    const web3 = await this.createWeb3(context)
                    const wallet = createContract<WalletContract>(web3, context.account, WalletABI as AbiItem[])
                    context.write(await wallet?.methods.nonce())
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                context.write(await this.sendUserOperation(context, this.createUserOperation(context)))
                break
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                if (!context.userOperation) {
                    context.abort(new Error('Invalid user operation.'))
                    break
                }
                context.write(await this.sendUserOperation(context, context.userOperation))
                break
            case EthereumMethodType.ETH_SUPPORTED_CHAIN_IDS:
                context.write(await this.bundler.getSupportedChainIds())
                break
            case EthereumMethodType.ETH_SUPPORTED_ENTRY_POINTS:
                context.write(await this.bundler.getSupportedEntryPoints())
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
