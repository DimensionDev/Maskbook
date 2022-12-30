import { first } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import type { BundlerAPI, AbstractAccountAPI } from '@masknet/web3-providers/types'
import { NetworkPluginID, SignType } from '@masknet/shared-base'
import {
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
    ) {}

    private createWallet(context: Context) {
        const web3 = Web3.createWeb3(context.chainId)
        const contract = createContract<WalletContract>(web3, context.account, WalletABI as AbiItem[])
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract
    }

    private getProvider(context: Context) {
        return Providers[context.providerType] as BaseContractWalletProvider | undefined
    }

    private async getNonce(context: Context) {
        const walletContract = this.createWallet(context)
        return walletContract.methods.nonce().call()
    }

    private getOwner(context: Context) {
        const provider = this.getProvider(context)
        if (!provider) throw new Error('Invalid provider')

        return {
            owner: provider.owner,
            identifier: provider.identifier,
        }
    }

    private getSigner(context: Context) {
        const { owner, identifier } = this.getOwner(context)
        if (!owner) throw new Error('Failed to sign user operation.')

        return identifier
            ? new Signer(identifier, SharedContextSettings.value.signWithPersona)
            : new Signer(owner, (type: SignType, message: string | Transaction, account: string) => {
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
    }

    private async sendUserOperation(context: Context, op = context.userOperation): Promise<string> {
        if (op)
            return this.account.sendUserOperation(
                context.chainId,
                this.getOwner(context).owner,
                op,
                this.getSigner(context),
            )
        if (context.config)
            return this.account.sendTransaction(
                context.chainId,
                this.getOwner(context).owner,
                context.config,
                this.getSigner(context),
            )

        throw new Error('No user operation to be sent.')
    }

    private async deploy(context: Context) {
        return this.account.deploy(context.chainId, this.getOwner(context).owner, this.getSigner(context))
    }

    private async changeOwner(context: Context) {
        const recipient = first<string>(context.requestArguments.params)
        if (!recipient) throw new Error('No recipient address.')

        return this.account.changeOwner(
            context.chainId,
            this.getOwner(context).owner,
            context.account,
            recipient,
            this.getSigner(context),
        )
    }

    async fn(context: Context, next: () => Promise<void>) {
        const provider = this.getProvider(context)

        // not a SC wallet provider
        if (!provider?.owner) {
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
                    context.write(await this.getNonce(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                try {
                    context.write(await this.sendUserOperation(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.ETH_SEND_USER_OPERATION:
                try {
                    context.write(await this.sendUserOperation(context))
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
                // fill later in UserTransaction.prototype.fill()
                context.write('0x0')
                break
            case EthereumMethodType.ETH_SIGN:
            case EthereumMethodType.PERSONAL_SIGN:
                if (!context.message) {
                    context.abort(new Error('Invalid message.'))
                } else {
                    context.write(await this.getSigner(context).signMessage(context.message))
                }
                break
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                if (!context.message) {
                    context.abort(new Error('Invalid message.'))
                } else {
                    context.write(await this.getSigner(context).signTypedData(context.message))
                }
                break
            case EthereumMethodType.ETH_SIGN_TRANSACTION:
                if (!context.config) {
                    context.abort(new Error('Invalid message.'))
                } else {
                    context.write(await this.getSigner(context).signTransaction(context.config))
                }
                break
            case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
                context.abort(new Error('Not supported by contract wallet.'))
                break
            case EthereumMethodType.ETH_SEND_RAW_TRANSACTION:
                context.abort(new Error('Not supported by contract wallet.'))
                break
            case EthereumMethodType.MASK_TRANSFER_CONTRACT_WALLET:
                try {
                    context.write(await this.changeOwner(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            case EthereumMethodType.MASK_DEPLOY_CONTRACT_WALLET:
                try {
                    context.write(await this.deploy(context))
                } catch (error) {
                    context.abort(error)
                }
                break
            default:
                break
        }

        await next()
    }
}
