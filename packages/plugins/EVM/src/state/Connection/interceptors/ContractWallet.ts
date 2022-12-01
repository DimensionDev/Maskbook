import { first } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import type { BundlerAPI } from '@masknet/web3-providers'
import {
    createContract,
    EthereumMethodType,
    isValidAddress,
    ProviderType,
    UserOperation,
    UserTransaction,
} from '@masknet/web3-shared-evm'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet as WalletContract } from '@masknet/web3-contracts/types/Wallet.js'
import { Web3StateSettings } from '../../../settings/index.js'
import type { Middleware, Context } from '../types.js'
import { Providers } from '../provider.js'
import type { BaseContractWalletProvider } from '../providers/BaseContractWallet.js'

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

    private createProvider(context: Context) {
        return Providers[context.providerType] as BaseContractWalletProvider | undefined
    }

    private async createWallet(context: Context) {
        const web3 = await this.createWeb3(context)
        const contract = createContract<WalletContract>(web3, context.account, WalletABI as AbiItem[])
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract
    }

    private async sendUserOperation(
        context: Context,
        userOperation?: UserOperation,
        owner?: string,
        ownerProviderType?: ProviderType,
    ): Promise<string> {
        if (!userOperation) throw new Error('Invalid user operation.')

        if (owner || !ownerProviderType || ownerProviderType === ProviderType.None)
            throw new Error('Failed to sign user operation.')

        const entryPoints = await this.bundler.getSupportedEntryPoints(context.chainId)
        const entryPoint = first(entryPoints)
        if (!entryPoint) throw new Error(`Not supported ${context.chainId}`)

        // sign user operation
        const userTransaction = await UserTransaction.fromUserOperation(context.chainId, entryPoint, userOperation)
        await userTransaction.sign((message: string) =>
            context.connection.signMessage(message, 'personalSign', {
                account: owner,
                providerType: ownerProviderType,
            }),
        )
        return this.bundler.sendUserOperation(context.chainId, userTransaction.toUserOperation())
    }

    async fn(context: Context, next: () => Promise<void>) {
        const provider = this.createProvider(context)

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
                    context.abort(new Error('Please connect a wallet.'))
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
                    context.write(
                        await this.sendUserOperation(
                            context,
                            context.userOperation,
                            provider.owner,
                            provider.ownerProviderType,
                        ),
                    )
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                try {
                    context.write(
                        await this.sendUserOperation(
                            context,
                            context.userOperation,
                            provider.owner,
                            provider.ownerProviderType,
                        ),
                    )
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
