import type Web3 from 'web3'
import { toHex } from 'web3-utils'
import { delay } from '@masknet/kit'
import type { Account, ECKeyIdentifier, Proof, UpdatableWallet, Wallet } from '@masknet/shared-base'
import {
    type AddressType,
    type ChainId,
    SchemaType,
    type Web3Provider,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    type TransactionSignature,
    type ProviderType,
    type Signature,
    type UserOperation,
    EthereumMethodType,
    AccountTransaction,
    getAverageBlockDelay,
    isNativeTokenAddress,
    ContractTransaction,
} from '@masknet/web3-shared-evm'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { Web3StateRef } from './Web3StateAPI.js'
import { RequestAPI } from './RequestAPI.js'
import { ContractAPI } from './ContractAPI.js'
import { ConnectionReadonlyAPI } from './ConnectionReadonlyAPI.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { ConnectionAPI_Base } from '../../Base/apis/ConnectionAPI.js'
import { Providers } from '../providers/index.js'
import type { ConnectionOptions } from '../types/index.js'

export class ConnectionAPI
    extends ConnectionReadonlyAPI
    implements
        ConnectionAPI_Base<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            Signature,
            UserOperation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Block,
            Web3,
            Web3Provider
        >
{
    private get Transaction() {
        return Web3StateRef.value.Transaction
    }

    private get TransactionWatcher() {
        return Web3StateRef.value.TransactionWatcher
    }

    protected override Request = new RequestAPI(this.options)
    protected override Contract = new ContractAPI(this.options)
    protected override ConnectionOptions = new ConnectionOptionsAPI(this.options)

    override async addWallet(wallet: UpdatableWallet, initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_ADD_WALLET,
                params: [wallet],
            },
            initial,
        )
    }

    override async updateWallet(
        address: string,
        wallet: Partial<UpdatableWallet>,
        initial?: ConnectionOptions,
    ): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_UPDATE_WALLET,
                params: [address, wallet],
            },
            initial,
        )
    }

    override async renameWallet(address: string, name: string, initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_RENAME_WALLET,
                params: [address, name],
            },
            initial,
        )
    }

    override async removeWallet(
        address: string,
        password?: string | undefined,
        initial?: ConnectionOptions,
    ): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REMOVE_WALLET,
                params: [address, password],
            },
            initial,
        )
    }

    override async resetAllWallets(initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_RESET_ALL_WALLETS,
                params: [],
            },
            initial,
        )
    }

    override async updateWallets(wallets: Wallet[], initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_UPDATE_WALLETS,
                params: wallets,
            },
            initial,
        )
    }

    override async removeWallets(wallets: Wallet[], initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REMOVE_WALLETS,
                params: wallets,
            },
            initial,
        )
    }

    override async approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: ConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC20
        return new ContractTransaction(this.Contract.getERC20Contract(address, options)).send(
            (x) => x?.methods.approve(recipient, toHex(amount)),
            options.overrides,
        )
    }

    override async approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        // Do not use `approve()`, since it is buggy.
        // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol
        throw new Error('Method not implemented.')
    }

    override async approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: ConnectionOptions,
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
        initial?: ConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) {
            const tx: Transaction = {
                from: options.account,
                to: recipient,
                value: toHex(amount),
                data: memo ? toHex(memo) : undefined,
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
            (x) => x?.methods.transfer(recipient, toHex(amount)),
            options.overrides,
        )
    }

    override async transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount?: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
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
        initial?: ConnectionOptions,
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

    override async verifyMessage(type: string, message: string, signature: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const dataToSign = await this.getWeb3(options).eth.personal.ecRecover(message, signature)
        return dataToSign === message
    }

    override async signTransaction(transaction: Transaction, initial?: ConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [transaction],
            },
            initial,
        )
    }

    override signTransactions(transactions: Transaction[], initial?: ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }

    override supportedChainIds(initial?: ConnectionOptions) {
        return this.Request.request<ChainId[]>(
            {
                method: EthereumMethodType.ETH_SUPPORTED_CHAIN_IDS,
                params: [],
            },
            initial,
        )
    }

    override supportedEntryPoints(initial?: ConnectionOptions) {
        return this.Request.request<string[]>(
            {
                method: EthereumMethodType.ETH_SUPPORTED_ENTRY_POINTS,
                params: [],
            },
            initial,
        )
    }

    override async callUserOperation(owner: string, operation: UserOperation, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_CALL_USER_OPERATION,
                params: [
                    owner,
                    {
                        ...operation,
                        sender: options.account,
                    },
                ],
            },
            options,
        )
    }

    override async sendUserOperation(owner: string, operation: UserOperation, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SEND_USER_OPERATION,
                params: [
                    owner,
                    {
                        ...operation,
                        sender: operation.sender || options.account,
                    },
                ],
            },
            options,
        )
    }

    override async transfer(recipient: string, amount: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const contract = this.Contract.getWalletContract(options.account, options)
        if (!contract) throw new Error('Failed to create contract.')

        const tx = {
            from: options.account,
            to: options.account,
            data: contract.methods.transfer(recipient, amount).encodeABI(),
        }

        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [
                    {
                        ...tx,
                        gas: await this.estimateTransaction(tx, 50000, options),
                    },
                ],
            },
            options,
        )
    }

    override async changeOwner(recipient: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const contract = this.Contract.getWalletContract(options.account, options)
        if (!contract) throw new Error('Failed to create contract.')

        const tx = {
            from: options.account,
            to: options.account,
            data: contract.methods.changeOwner(recipient).encodeABI(),
        }

        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [
                    {
                        ...tx,
                        gas: await this.estimateTransaction(tx, 50000, options),
                    },
                ],
            },
            options,
        )
    }

    override async fund(proof: Proof, initial?: ConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.MASK_FUND,
                params: [proof],
            },
            initial,
        )
    }

    override async deploy(owner: string, identifier?: ECKeyIdentifier, initial?: ConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.MASK_DEPLOY,
                params: [owner, identifier],
            },
            initial,
        )
    }

    override async connect(initial?: ConnectionOptions): Promise<Account<ChainId>> {
        return this.Request.request<Account<ChainId>>(
            {
                method: EthereumMethodType.MASK_LOGIN,
                params: [],
            },
            initial,
        )
    }

    override async disconnect(initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_LOGOUT,
                params: [],
            },
            initial,
        )
    }

    override async switchChain(chainId: ChainId, initial?: ConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        await Providers[options.providerType].switchChain(chainId)
    }

    override async sendTransaction(transaction: Transaction, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        // send a transaction which will add into the internal transaction list and start to watch it for confirmation
        const hash = await this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [new AccountTransaction(transaction).fill(options.overrides)],
            },
            options,
        )

        return new Promise<string>((resolve, reject) => {
            if (!this.Transaction || !this.TransactionWatcher) reject(new Error('No context found.'))

            const onProgress = async (
                chainId: ChainId,
                id: string,
                status: TransactionStatusType,
                transaction?: Transaction,
            ) => {
                if (status === TransactionStatusType.NOT_DEPEND) return
                if (!transaction?.from) return
                const transactions = await this.Transaction?.getTransactions?.(chainId, transaction.from)
                const currentTransaction = transactions?.find((x) => {
                    const hashes = Object.keys(x.candidates)
                    return hashes.includes(hash) && hashes.includes(id)
                })
                if (currentTransaction) resolve(currentTransaction.indexId)
            }
            this.TransactionWatcher?.emitter.on('progress', onProgress)
        })
    }

    override async confirmTransaction(hash: string, initial?: ConnectionOptions): Promise<TransactionReceipt> {
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

    override replaceTransaction(hash: string, transaction: Transaction, initial?: ConnectionOptions) {
        return this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            initial,
        )
    }

    override cancelTransaction(hash: string, transaction: Transaction, initial?: ConnectionOptions) {
        return this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [
                    hash,
                    {
                        ...transaction,
                        to: transaction.from,
                        data: '0x0',
                        value: '0x0',
                    },
                ],
            },
            initial,
        )
    }
}
