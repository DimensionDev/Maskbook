import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { delay } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    type AddressType,
    type ChainId,
    SchemaType,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    type TransactionSignature,
    type ProviderType,
    type Signature,
    type Web3,
    EthereumMethodType,
    AccountTransaction,
    getAverageBlockDelay,
    isNativeTokenAddress,
    ContractTransaction,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { EVMRequestAPI } from './RequestAPI.js'
import { EVMContractAPI } from './ContractAPI.js'
import { EVMConnectionReadonlyAPI } from './ConnectionReadonlyAPI.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { BaseConnection } from '../../Base/apis/Connection.js'
import type { EVMConnectionOptions } from '../types/index.js'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreator.js'

export class ConnectionAPI
    extends EVMConnectionReadonlyAPI
    implements
        BaseConnection<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            Signature,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Block,
            Web3
        >
{
    protected override Request = new EVMRequestAPI(this.options)
    protected override Contract = new EVMContractAPI(this.options)
    protected override ConnectionOptions = new ConnectionOptionsAPI(this.options)

    override async approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC20
        return new ContractTransaction(this.Contract.getERC20Contract(address, options)).send(
            (x) => x?.methods.approve(recipient, web3_utils.toHex(amount)),
            options.overrides,
        )
    }

    override async approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC721 & ERC1155
        return new ContractTransaction(this.Contract.getERC721Contract(address, options)).send(
            (x) => x?.methods.setApprovalForAll(recipient, approved),
            options.overrides,
        )
    }

    override async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) {
            const tx: Transaction = {
                from: options.account,
                to: recipient,
                value: web3_utils.toHex(amount),
                data: memo ? web3_utils.toHex(memo) : undefined,
            }
            return this.sendTransaction(
                {
                    ...tx,
                    gas: await this.estimateTransaction(tx, 50000, options),
                },
                options,
            )
        }

        // ERC20
        return new ContractTransaction(this.Contract.getERC20Contract(address, options)).send(
            (x) => x?.methods.transfer(recipient, web3_utils.toHex(amount)),
            options.overrides,
        )
    }

    override async transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount?: string,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            return new ContractTransaction(this.Contract.getERC1155Contract(address, options)).send(
                (x) => x?.methods.safeTransferFrom(options.account, recipient, tokenId, amount ?? '', '0x'),
                options.overrides,
            )
        }

        // ERC721
        return new ContractTransaction(this.Contract.getERC721Contract(address, options)).send(
            (x) => x?.methods.transferFrom(options.account, recipient, tokenId),
            options.overrides,
        )
    }

    override signMessage(
        type: 'message' | 'typedData' | Omit<string, 'message' | 'typedData'>,
        message: string,
        initial?: EVMConnectionOptions,
    ) {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) throw new Error('Unknown account.')

        switch (type) {
            case 'message':
                return this.Request.request<string>(
                    {
                        method: EthereumMethodType.PERSONAL_SIGN,
                        params: [message, options.account, ''].filter((x) => typeof x !== 'undefined'),
                    },
                    options,
                )
            case 'typedData':
                return this.Request.request<string>(
                    {
                        method: EthereumMethodType.ETH_SIGN_TYPED_DATA,
                        params: [options.account, message],
                    },
                    options,
                )
            default:
                throw new Error(`Unknown sign type: ${type}.`)
        }
    }

    override async signTransaction(transaction: Transaction, initial?: EVMConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [transaction],
            },
            initial,
        )
    }

    override signTransactions(transactions: Transaction[], initial?: EVMConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }

    override async switchChain(chainId: ChainId, initial?: EVMConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<void>(
            {
                method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [
                    {
                        chainId: web3_utils.toHex(chainId),
                    },
                ],
            },
            options,
        )
    }

    override async sendTransaction(transaction: Transaction, initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        // send a transaction which will add into the internal transaction list and start to watch it for confirmation
        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [new AccountTransaction(transaction).fill(options.overrides)],
            },
            options,
        )
    }

    override async confirmTransaction(hash: string, initial?: EVMConnectionOptions): Promise<TransactionReceipt> {
        const options = this.ConnectionOptions.fill(initial)
        const times = 49
        const interval = getAverageBlockDelay(options.chainId)

        for (let i = 0; i < times; i += 1) {
            if (options.signal?.aborted) throw new Error(options.signal.reason)

            try {
                const receipt = await this.getTransactionReceipt(hash, options)
                if (!receipt) throw new Error('Not confirm yet.')

                // the transaction has been confirmed
                return receipt
            } catch {
                await delay(interval)
                continue
            }
        }

        // insufficient try times
        throw new Error('Not confirm yet')
    }
}

export const createConnection = createConnectionCreator(
    NetworkPluginID.PLUGIN_EVM,
    (initial) => new ConnectionAPI(initial),
    isValidChainId,
    new ConnectionOptionsAPI(),
)
export const EVMWeb3 = createConnection()!
