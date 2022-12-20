import { first } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import type { BundlerAPI, ContractAccountAPI } from '@masknet/web3-providers/types'
import type { NetworkPluginID } from '@masknet/shared-base'
import {
    ChainId,
    createContract,
    EthereumMethodType,
    isValidAddress,
    ProviderType,
    UserTransaction,
    ContractWallet as ContractWalletLib,
    ContractTransaction,
    isEmptyHex,
} from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet as WalletContract } from '@masknet/web3-contracts/types/Wallet.js'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'
import type { Middleware, Context } from '../types.js'
import { Providers } from '../provider.js'
import type { BaseContractWalletProvider } from '../providers/BaseContractWallet.js'

export class ContractWallet implements Middleware<Context> {
    constructor(
        protected providerType: ProviderType,
        protected contractAccount: ContractAccountAPI.Provider<NetworkPluginID.PLUGIN_EVM>,
        protected bundler: BundlerAPI.Provider,
        protected options: {
            getLogicContractAddress(chainId: ChainId): string
        },
    ) {}

    private createWeb3(context: Context) {
        const web3 = Web3StateSettings.value.Connection?.getWeb3?.({
            chainId: context.chainId,
            providerType: ProviderType.MaskWallet,
        })

        if (!web3) throw new Error('Failed to create web3.')
        return web3
    }

    private createProvider(context: Context) {
        return Providers[context.providerType] as BaseContractWalletProvider | undefined
    }

    private createWallet(context: Context) {
        const web3 = this.createWeb3(context)
        const contract = createContract<WalletContract>(web3, context.account, WalletABI as AbiItem[])
        if (!contract) throw new Error('Failed to create wallet contract.')
        return contract
    }

    private async getEntryPoint(chainId: ChainId) {
        const entryPoints = await this.bundler.getSupportedEntryPoints(chainId)
        const entryPoint = first(entryPoints)
        if (!entryPoint || !isValidAddress(entryPoint)) throw new Error(`Not supported ${chainId}`)
        return entryPoint
    }

    private async getInitCode(chainId: ChainId, owner: string) {
        const contractWallet = new ContractWalletLib(
            chainId,
            owner,
            this.options.getLogicContractAddress(chainId),
            await this.getEntryPoint(chainId),
        )
        if (isEmptyHex(contractWallet.initCode)) throw new Error('Failed to create initCode.')
        return contractWallet.initCode
    }

    private async getDeployedAccounts(chainId: ChainId, owner: string) {
        const accounts = await this.contractAccount.getAccountsByOwner(chainId, owner)
        return accounts.filter((x) => isSameAddress(x.creator, owner))
    }

    private async getNonce(context: Context) {
        const walletContract = this.createWallet(context)
        return walletContract.methods.nonce()
    }

    private getOwner(context: Context) {
        const provider = this.createProvider(context)
        if (!provider) throw new Error('Invalid provider')

        return {
            owner: provider.owner,
            identifier: provider.identifier,
        }
    }

    private async sendUserOperation(context: Context, op = context.userOperation): Promise<string> {
        const { owner, identifier } = this.getOwner(context)
        if (!owner) throw new Error('Failed to sign user operation.')

        const { config } = context
        if (!op && !config) throw new Error('No user operation to be sent.')

        // setup user operation
        const entryPoint = await this.getEntryPoint(context.chainId)
        const userTransaction =
            (op ? await UserTransaction.fromUserOperation(context.chainId, entryPoint, op) : undefined) ||
            (config ? await UserTransaction.fromTransaction(context.chainId, entryPoint, config) : undefined)
        if (!userTransaction) throw new Error('Failed to create user transaction.')

        // fill in initCode
        if (isEmptyHex(userTransaction.initCode) && userTransaction.nonce === 0) {
            const initCode = await this.getInitCode(context.chainId, owner)
            const accounts = await this.getDeployedAccounts(context.chainId, owner)

            await userTransaction.fill({
                initCode,
                nonce: accounts.filter((x) => x.deployed).length,
            })
        }

        // sign user operation
        await userTransaction.sign(async (message: string) => {
            if (identifier) {
                return SharedContextSettings.value.personaSignPayMessage({
                    message,
                    identifier,
                })
            }
            return context.connection.signMessage(message, 'personalSign', {
                account: owner,
                providerType: this.providerType,
            })
        })
        return this.bundler.sendUserOperation(context.chainId, userTransaction.toUserOperation())
    }

    private async changeOwner(context: Context) {
        const recipient = first<string>(context.requestArguments.params)
        if (!recipient) throw new Error('No recipient address.')

        return new ContractTransaction(this.createWallet(context)).send((x) => x.methods.changeOwner(recipient))
    }

    private async deploy(context: Context) {
        const { owner } = this.getOwner(context)
        if (!isValidAddress(owner)) throw new Error('Invalid owner address.')

        const initCode = await this.getInitCode(context.chainId, owner)
        const accounts = await this.getDeployedAccounts(context.chainId, owner)

        return this.sendUserOperation(context, {
            sender: context.account,
            nonce: accounts.filter((x) => x.deployed).length,
            initCode,
        })
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
                    context.write(await this.bundler.getSupportedChainIds())
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
