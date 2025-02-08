import { SignType, type ECKeyIdentifier } from '@masknet/shared-base'
import {
    EthereumMethodType,
    isValidAddress,
    Signer,
    type ChainId,
    type Middleware,
    type ProviderType,
    type Transaction,
    type UserOperation,
} from '@masknet/web3-shared-evm'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { AbstractAccountAPI, BundlerAPI, FunderAPI, WalletAPI } from '../../../entry-types.js'
import { ConnectionAPI } from '../apis/ConnectionAPI.js'
import { EVMContractReadonly } from '../apis/ContractReadonlyAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import type { BaseEIP4337WalletProvider } from '../providers/BaseContractWallet.js'
import { EVMWalletProviders } from '../providers/index.js'

export class ContractWallet implements Middleware<ConnectionContext> {
    private Web3 = new ConnectionAPI()
    constructor(
        protected providerType: ProviderType,
        protected account: AbstractAccountAPI.Provider<ChainId, UserOperation, Transaction>,
        protected bundler: BundlerAPI.Provider,
        protected funder: FunderAPI.Provider<ChainId>,
        private signWithPersona: WalletAPI.SignWithPersona,
    ) {}

    private async getNonce(context: ConnectionContext) {
        const contract = EVMContractReadonly.getWalletContract(context.account)
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract.methods.nonce().call()
    }

    private getSigner(context: ConnectionContext) {
        if (context.identifier)
            return new Signer(
                context.identifier,
                async <T>(type: SignType, message: T, identifier?: ECKeyIdentifier) => {
                    return this.signWithPersona(type, message, identifier, true)
                },
            )
        if (context.owner)
            return new Signer(context.owner, (type: SignType, message: string | Transaction, account: string) => {
                switch (type) {
                    case SignType.Message:
                        return this.Web3.signMessage('message', message as string, {
                            account,
                            providerType: this.providerType,
                        })
                    case SignType.TypedData:
                        return this.Web3.signMessage('typedData', message as string, {
                            account,
                            providerType: this.providerType,
                        })
                    case SignType.Transaction:
                        return this.Web3.signTransaction(message as Transaction, {
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
        if (!context.writable) {
            await next()
            return
        }

        const provider = EVMWalletProviders[context.providerType] as BaseEIP4337WalletProvider | undefined

        // not a SC wallet provider
        if (!provider?.ownerAccount && !context.owner) {
            await next()
            return
        }

        switch (context.request.method) {
            case EthereumMethodType.eth_chainId:
                context.write(provider?.hostedChainId ? web3_utils.toHex(provider?.hostedChainId) : undefined)
                break
            case EthereumMethodType.eth_accounts:
                if (isValidAddress(provider?.hostedAccount)) {
                    context.write([provider.hostedAccount])
                } else {
                    context.abort(new Error('Please connect a wallet.'))
                }
                break
            case EthereumMethodType.eth_getTransactionCount:
                try {
                    context.write(await this.getNonce(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_sendTransaction:
                try {
                    context.write(await this.send(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_sendUserOperation:
                try {
                    context.write(await this.send(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_supportedChainIds:
                try {
                    context.write([await this.bundler.getSupportedChainId()])
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_supportedEntryPoints:
                try {
                    context.write(await this.bundler.getSupportedEntryPoints(context.chainId))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_estimateGas:
                try {
                    context.write(await this.estimate(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_sign:
            case EthereumMethodType.personal_sign:
                try {
                    if (!context.message) throw new Error('Invalid message.')
                    context.write(await this.getSigner(context).signMessage(context.message))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_signTypedData_v4:
                try {
                    if (!context.message) throw new Error('Invalid typed data.')
                    context.write(await this.getSigner(context).signTypedData(context.message))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.eth_signTransaction:
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
            case EthereumMethodType.wallet_switchEthereumChain:
                context.abort(new Error('Not supported by contract wallet.'))
                break
            case EthereumMethodType.eth_sendRawTransaction:
                context.abort(new Error('Not supported by contract wallet.'))
                break
            default:
                break
        }

        await next()
    }
}
