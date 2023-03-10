import type { AbiItem } from 'web3-utils'
import type { BundlerAPI, AbstractAccountAPI, FunderAPI } from '@masknet/web3-providers/types'
import { type ECKeyIdentifier, type NetworkPluginID, SignType } from '@masknet/shared-base'
import {
    type ChainId,
    type ConnectionContext,
    createContract,
    EthereumMethodType,
    isValidAddress,
    type Middleware,
    type ProviderType,
    Signer,
    type Transaction,
} from '@masknet/web3-shared-evm'
import { type BaseContractWalletProvider, EVM_Providers, Web3 } from '@masknet/web3-providers'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet as WalletContract } from '@masknet/web3-contracts/types/Wallet.js'
import { SharedContextSettings } from '../../../settings/index.js'

export class ContractWallet implements Middleware<ConnectionContext> {
    constructor(
        protected providerType: ProviderType,
        protected account: AbstractAccountAPI.Provider<NetworkPluginID.PLUGIN_EVM>,
        protected bundler: BundlerAPI.Provider,
        protected funder: FunderAPI.Provider<ChainId>,
    ) {}

    private async getNonce(context: ConnectionContext) {
        const web3 = Web3.getWeb3(context.chainId)
        const contract = createContract<WalletContract>(web3, context.account, WalletABI as AbiItem[])
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract.methods.nonce().call()
    }

    private getSigner(context: ConnectionContext) {
        if (context.identifier)
            return new Signer(context.identifier, <T>(type: SignType, message: T, identifier?: ECKeyIdentifier) =>
                SharedContextSettings.value.signWithPersona(type, message, identifier, true),
            )
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

    private async send(context: ConnectionContext): Promise<string> {
        if (!context.owner) throw new Error('No owner.')
        if (context.userOperation)
            return this.account.sendUserOperation(
                context.chainId,
                context.owner,
                context.userOperation,
                this.getSigner(context),
                {
                    paymentToken: context.paymentToken,
                },
            )
        if (context.config)
            return this.account.sendTransaction(
                context.chainId,
                context.owner,
                context.config,
                this.getSigner(context),
                {
                    paymentToken: context.paymentToken,
                },
            )
        throw new Error('No user operation to be sent.')
    }

    private estimate(context: ConnectionContext): Promise<string> {
        if (context.userOperation)
            return this.account.estimateUserOperation(context.chainId, context.userOperation, {
                paymentToken: context.paymentToken,
            })
        if (context.config)
            return this.account.estimateTransaction(context.chainId, context.config, {
                paymentToken: context.paymentToken,
            })
        throw new Error('No user operation to be estimated.')
    }

    private async fund(context: ConnectionContext) {
        if (!context.proof) throw new Error('No proof.')
        return this.funder.fund(context.chainId, context.proof)
    }

    private async deploy(context: ConnectionContext) {
        if (!context.owner) throw new Error('No owner.')
        return this.account.deploy(context.chainId, context.owner, this.getSigner(context))
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (!context.writeable) {
            await next()
            return
        }

        const provider = EVM_Providers[context.providerType] as BaseContractWalletProvider | undefined

        // not a SC wallet provider
        if (!provider?.ownerAccount && !context.owner) {
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
                    const { message } = await this.fund(context)
                    if (!isValidAddress(message.walletAddress)) throw new Error('Failed to fund.')
                    context.write(message.tx)
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
