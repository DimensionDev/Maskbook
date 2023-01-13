import type { AbiItem } from 'web3-utils'
import type { BundlerAPI, AbstractAccountAPI, FunderAPI } from '@masknet/web3-providers/types'
import { NetworkPluginID, SignType } from '@masknet/shared-base'
import {
    ChainId,
    createContract,
    EthereumMethodType,
    isValidAddress,
    ProviderType,
    Signer,
    Transaction,
} from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet as WalletContract } from '@masknet/web3-contracts/types/Wallet.js'
import type { Middleware, Context } from '../types.js'
import { Providers } from '../provider.js'
import type { BaseContractWalletProvider } from '../providers/BaseContractWallet.js'
import { SharedContextSettings } from '../../../settings/index.js'

export class ContractWallet implements Middleware<Context> {
    constructor(
        protected providerType: ProviderType,
        protected account: AbstractAccountAPI.Provider<NetworkPluginID.PLUGIN_EVM>,
        protected bundler: BundlerAPI.Provider,
        protected funder: FunderAPI.Provider<ChainId>,
    ) {}

    private createWallet(context: Context) {
        const web3 = Web3.getWeb3(context.chainId)
        const contract = createContract<WalletContract>(web3, context.account, WalletABI as AbiItem[])
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract
    }

    private async getNonce(context: Context) {
        const walletContract = this.createWallet(context)
        return walletContract.methods.nonce().call()
    }

    private getSigner(context: Context) {
        if (context.identifier) return new Signer(context.identifier, SharedContextSettings.value.signWithPersona)
        if (context.owner)
            return new Signer(context.owner, (type: SignType, message: string | Transaction, account: string) => {
                switch (type) {
                    case SignType.Message:
                        return context.connection.signMessage('message', message as string, {
                            account,
                            providerType: this.providerType,
                        })
                    case SignType.TypedData:
                        return context.connection.signMessage('typedData', message as string, {
                            account,
                            providerType: this.providerType,
                        })
                    case SignType.Transaction:
                        return context.connection.signTransaction(message as Transaction, {
                            account,
                            providerType: this.providerType,
                        })
                    default:
                        throw new Error('Unknown sign method.')
                }
            })
        throw new Error('Failed to create signer.')
    }

    private async send(context: Context): Promise<string> {
        if (!context.owner) throw new Error('No owner.')
        if (context.userOperation)
            return this.account.sendUserOperation(
                context.chainId,
                context.owner,
                context.userOperation,
                this.getSigner(context),
            )
        if (context.config)
            return this.account.sendTransaction(
                context.chainId,
                context.owner,
                context.config,
                this.getSigner(context),
                context.config.gasCurrency,
            )
        throw new Error('No user operation to be sent.')
    }

    private estimate(context: Context): Promise<string> {
        if (context.userOperation) return this.account.estimateUserOperation(context.chainId, context.userOperation)
        if (context.config) return this.account.estimateTransaction(context.chainId, context.config)
        throw new Error('No user operation to be estimated.')
    }

    private async fund(context: Context) {
        if (!context.proof) throw new Error('No proof.')
        return this.funder.fund(context.chainId, context.proof)
    }

    private async deploy(context: Context) {
        if (!context.owner) throw new Error('No owner.')
        return this.account.deploy(context.chainId, context.owner, this.getSigner(context))
    }

    async fn(context: Context, next: () => Promise<void>) {
        const provider = Providers[context.providerType] as BaseContractWalletProvider | undefined

        // not a SC wallet provider
        if (!provider?.ownerAccount && context.method !== EthereumMethodType.MASK_FUND) {
            await next()
            return
        }

        switch (context.request.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                context.write(provider?.hostedChainId)
                break
            case EthereumMethodType.ETH_ACCOUNTS:
                if (isValidAddress(provider?.hostedAccount)) {
                    context.write([provider?.hostedAccount])
                } else {
                    context.abort(new Error('Please connect a wallet.'))
                }
                break
            case EthereumMethodType.ETH_GET_TRANSACTION_COUNT:
                try {
                    context.write(await this.getNonce(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                try {
                    context.write(await this.send(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                try {
                    context.write(await this.send(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SUPPORTED_CHAIN_IDS:
                try {
                    context.write([await this.bundler.getSupportedChainId()])
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SUPPORTED_ENTRY_POINTS:
                try {
                    context.write(await this.bundler.getSupportedEntryPoints(context.chainId))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_ESTIMATE_GAS:
                try {
                    context.write(await this.estimate(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SIGN:
            case EthereumMethodType.PERSONAL_SIGN:
                try {
                    if (!context.message) throw new Error('Invalid message.')
                    context.write(await this.getSigner(context).signMessage(context.message))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                try {
                    if (!context.message) throw new Error('Invalid typed data.')
                    context.write(await this.getSigner(context).signTypedData(context.message))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SIGN_TRANSACTION:
                try {
                    if (!context.config) throw new Error('Invalid transaction.')
                    context.write(await this.getSigner(context).signTransaction(context.config))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.MASK_FUND:
                try {
                    const result = await this.fund(context)
                    context.write(result)
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.MASK_DEPLOY:
                try {
                    context.write(await this.deploy(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
                context.abort(new Error('Not supported by contract wallet.'))
                break
            case EthereumMethodType.ETH_SEND_RAW_TRANSACTION:
                context.abort(new Error('Not supported by contract wallet.'))
                break
            default:
                break
        }

        await next()
    }
}
