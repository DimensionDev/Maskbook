import type { AbiItem } from 'web3-utils'
import { BundlerAPI, SmartPay } from '@masknet/web3-providers'
import { ChainId, createContract, EthereumMethodType, ProviderType, UserOperation } from '@masknet/web3-shared-evm'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet as WalletContract } from '@masknet/web3-contracts/types/Wallet.js'
import { Web3StateSettings } from '../../../settings/index.js'
import type { Middleware, Context } from '../types.js'

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
        throw new Error('To be implemented')
    }

    private sendUserOperation(context: Context, userOperation: UserOperation): Promise<string> {
        return SmartPay.sendUserOperation(context.chainId, userOperation)
    }

    async fn(context: Context, next: () => Promise<void>) {
        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(ChainId.Mainnet)
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                context.write([])
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
            case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
                context.abort(new Error('Not supported by SC wallet.'))
                break
            case EthereumMethodType.ETH_SEND_RAW_TRANSACTION:
                context.abort(new Error('Not supported by SC wallet.'))
                break
            case EthereumMethodType.ETH_CALL_USER_OPERATION:
                context.abort(new Error('Not implemented.'))
                break
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                context.abort(new Error('Not implemented.'))
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
