import urlcat from 'urlcat'
import { compact, first, unionBy } from 'lodash-es'
import { AbiItem, padLeft, toHex } from 'web3-utils'
import {
    ChainId,
    ContractWallet,
    Create2Factory,
    EthereumMethodType,
    Signer,
    Transaction,
    UserOperation,
    UserTransaction,
    createContract,
    getSmartPayConstants,
    isEmptyHex,
    isValidAddress,
} from '@masknet/web3-shared-evm'
import { ECKeyIdentifier, NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress, plus, toFixed } from '@masknet/web3-shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import { LOG_ROOT, MAX_ACCOUNT_LENGTH } from '../constants.js'
import { SmartPayBundlerAPI } from './SmartPayBundlerAPI.js'
import { SmartPayFunderAPI } from './SmartPayFunderAPI.js'
import { MulticallAPI } from '../../Multicall/index.js'
import { Web3API } from '../../EVM/index.js'
import type { AbstractAccountAPI } from '../../entry-types.js'
import { fetchJSON, fetchSquashed } from '../../entry-helpers.js'

/**
 * A chainbase SQL query log
 *  select *
 *  from polygon.transaction_logs
 *  where block_number>36808978 -- the deployment block height of the logic wallet contract
 *  -- AND address="0x1778fcc4a26091d66e29dbb9aaa198cc652e73e1" -- the address of the WalletProxy contract (unknown)
 *  AND topics_count=3 -- the topics count of ChangeOwner event
 *  AND topic0="0xb532073b38c83145e3e5135377a08bf9aab55bc0fd7c1179cd4fb995d2a5159c" -- topic signature of ChangeOwner event
 *  -- AND topic1="..." The previousOwner address
 *  AND topic2="0x00000000000000000000000033a7209f653727a2ff688c81e661d61bcfffd809" -- the newOwner address (from FE)
 *  -- example tx: https://polygonscan.com/tx/0x7d381e3585d9b384e7ce6c910cccced02de0e29c02805a9286504f3067e09f4a
 */
export interface Log {
    transaction_hash: string
    /** the address of contract account */
    address: string
    /** topic signature */
    topic0: string
    /** the previous owner address */
    topic1: string
}

export class SmartPayAccountAPI implements AbstractAccountAPI.Provider<NetworkPluginID.PLUGIN_EVM> {
    private web3 = new Web3API()
    private multicall = new MulticallAPI()
    private bundler = new SmartPayBundlerAPI()
    private funder = new SmartPayFunderAPI()

    private async getEntryPoint(chainId: ChainId) {
        const entryPoints = await this.bundler.getSupportedEntryPoints(chainId)
        const entryPoint = first(entryPoints)
        if (!entryPoint || !isValidAddress(entryPoint)) throw new Error(`Not supported ${chainId}`)
        return entryPoint
    }

    private async getInitCode(chainId: ChainId, owner: string) {
        const contractWallet = await this.createContractWallet(chainId, owner)
        if (isEmptyHex(contractWallet.initCode)) throw new Error('Failed to create initCode.')
        return contractWallet.initCode
    }

    private createWalletContract(chainId: ChainId, address: string) {
        return createContract<Wallet>(this.web3.createWeb3(chainId), address, WalletABI as AbiItem[])
    }

    private async createContractWallet(chainId: ChainId, owner: string) {
        if (!owner) throw new Error('No owner address.')
        return new ContractWallet(
            chainId,
            owner,
            getSmartPayConstants(chainId).LOGIC_WALLET_CONTRACT_ADDRESS ?? '',
            await this.getEntryPoint(chainId),
        )
    }

    private async createCreate2Factory(chainId: ChainId, owner: string) {
        if (!owner) throw new Error('No owner address.')

        const { CREATE2_FACTORY_CONTRACT_ADDRESS } = getSmartPayConstants(chainId)
        if (!CREATE2_FACTORY_CONTRACT_ADDRESS) throw new Error('No create2 contract.')

        return new Create2Factory(CREATE2_FACTORY_CONTRACT_ADDRESS)
    }

    private createContractAccount(
        chainId: ChainId,
        address: string,
        owner: string,
        creator: string,
        deployed = true,
        funded = false,
    ): AbstractAccountAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM> {
        return {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chainId,
            id: `${NetworkPluginID.PLUGIN_EVM}_${chainId}_${address}`,
            address,
            owner,
            creator,
            deployed,
            funded,
        }
    }

    /**
     * Use the multicall contract to filter non-owned accounts out.
     * @param chainId
     * @param options
     * @returns
     */
    private async getAccountsFromMulticall(chainId: ChainId, owner: string, options: string[]) {
        const contracts = options.map((x) => this.createWalletContract(chainId, x)!)
        const names = Array.from<'owner'>({ length: options.length }).fill('owner')
        const calls = this.multicall.createMultipleContractSingleData(contracts, names, [])
        const results = await this.multicall.call(chainId, contracts, names, calls)
        const owners = results.flatMap((x) => (x.succeed && x.value ? x.value : ''))

        if (!owners.length) {
            return []
        }

        return compact(
            owners.map((x, index) =>
                this.createContractAccount(chainId, options[index], x || owner, owner, isValidAddress(x)),
            ),
        )
    }

    /**
     * Query the on-chain changeOwner event from chainbase.
     * @param chainId
     * @param owner
     * @returns
     */
    private async getAccountsFromChainbase(chainId: ChainId, owner: string) {
        const { records: logs } = await fetchJSON<{ records: Log[]; count: number }>(
            urlcat(LOG_ROOT, '/records', {
                newOwnerAddress: padLeft(owner, 64),
                size: MAX_ACCOUNT_LENGTH,
                offset: 0,
            }),
            {},
            fetchSquashed,
        )

        if (!logs) {
            return []
        }

        return compact(
            unionBy(logs, (x) => x.address.toLowerCase()).map((topic) => {
                if (!isValidAddress(topic.address)) return

                const previousOwner = toHex(topic.topic1.slice(-40))
                if (!isValidAddress(previousOwner)) return

                return this.createContractAccount(chainId, topic.address, owner, previousOwner, true)
            }),
        )
    }

    async getAccountByNonce(chainId: ChainId, owner: string, nonce: number) {
        const create2Factory = await this.createCreate2Factory(chainId, owner)
        const contractWallet = await this.createContractWallet(chainId, owner)
        const address = create2Factory.derive(contractWallet.initCode, nonce)

        const operations = await this.funder.getOperationsByOwner(chainId, owner)

        // TODO: ensure account is deployed
        return this.createContractAccount(
            chainId,
            address,
            owner,
            owner,
            false,
            operations.some((operation) => isSameAddress(operation.walletAddress, address)),
        )
    }

    async getAccountsByOwner(
        chainId: ChainId,
        owner: string,
    ): Promise<Array<AbstractAccountAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const create2Factory = await this.createCreate2Factory(chainId, owner)
        const contractWallet = await this.createContractWallet(chainId, owner)
        const operations = await this.funder.getOperationsByOwner(chainId, owner)

        const allSettled = await Promise.allSettled([
            this.getAccountsFromMulticall(
                chainId,
                owner,
                create2Factory.deriveUntil(contractWallet.initCode, MAX_ACCOUNT_LENGTH),
            ),
            // this.getAccountsFromChainbase(chainId, owner),
        ])
        return allSettled
            .flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
            .map((y) => ({
                ...y,
                funded: operations.some((operation) => isSameAddress(operation.walletAddress, y.address)),
            }))
    }

    async getAccountsByOwners(
        chainId: ChainId,
        owners: string[],
    ): Promise<Array<AbstractAccountAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const allSettled = await Promise.allSettled(owners.map((x) => this.getAccountsByOwner(chainId, x)))
        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
    }

    async deploy(chainId: ChainId, owner: string, signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<string> {
        if (!isValidAddress(owner)) throw new Error('Invalid owner address.')

        const initCode = await this.getInitCode(chainId, owner)
        const accounts = await this.getAccountsByOwner(chainId, owner)
        const accountsDeployed = accounts.filter((x) => isSameAddress(x.creator, owner) && x.deployed)

        return this.sendUserOperation(
            chainId,
            owner,
            {
                sender: accounts[accountsDeployed.length].address,
                initCode,
                nonce: accountsDeployed.length,
            },
            signer,
        )
    }

    transfer(
        chainId: ChainId,
        owner: string,
        sender: string,
        recipient: string,
        amount: string,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    changeOwner(
        chainId: ChainId,
        owner: string,
        sender: string,
        recipient: string,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    /**
     * The internal method to send a UserTransaction.
     */
    private async sendUserTransaction(
        chainId: ChainId,
        owner: string,
        userTransaction: UserTransaction,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
    ) {
        if (userTransaction.paymentToken) {
            // fill in initCode
            if (isEmptyHex(userTransaction.initCode) && userTransaction.nonce === 0) {
                const accounts = await this.getAccountsByOwner(chainId, owner)
                const accountsDeployed = accounts.filter((x) => isSameAddress(x.creator, owner) && x.deployed)

                if (!accountsDeployed.length) {
                    await userTransaction.fill(this.web3.createWeb3(chainId), {
                        initCode: await this.getInitCode(chainId, owner),
                        nonce: accountsDeployed.length,
                    })
                }
            }

            return this.bundler.sendUserOperation(chainId, await userTransaction.toUserOperation(signer))
        } else {
            return this.web3.createProvider(chainId).request<string>({
                method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                params: [await userTransaction.toRawTransaction(this.web3.createWeb3(chainId), signer)],
            })
        }
    }

    async sendTransaction(
        chainId: ChainId,
        owner: string,
        transaction: Transaction,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
        gasCurrency?: string,
    ): Promise<string> {
        const userTransaction = await UserTransaction.fromTransaction(
            chainId,
            this.web3.createWeb3(chainId),
            await this.getEntryPoint(chainId),
            transaction,
            gasCurrency,
        )
        return this.sendUserTransaction(chainId, owner, userTransaction, signer)
    }

    async sendUserOperation(
        chainId: ChainId,
        owner: string,
        userOperation: UserOperation,
        signer: Signer<ECKeyIdentifier> | Signer<string>,
    ): Promise<string> {
        const userTransaction = await UserTransaction.fromUserOperation(
            chainId,
            this.web3.createWeb3(chainId),
            await this.getEntryPoint(chainId),
            userOperation,
        )
        return this.sendUserTransaction(chainId, owner, userTransaction, signer)
    }

    async estimateTransaction(chainId: ChainId, transaction: Transaction): Promise<string> {
        const web3 = this.web3.createWeb3(chainId)
        const userTransaction = await UserTransaction.fromTransaction(
            chainId,
            web3,
            await this.getEntryPoint(chainId),
            transaction,
        )
        return toFixed(await userTransaction.estimate(web3))
    }

    async estimateUserOperation(chainId: ChainId, userOperation: UserOperation): Promise<string> {
        const userTransaction = await UserTransaction.fromUserOperation(
            chainId,
            this.web3.createWeb3(chainId),
            await this.getEntryPoint(chainId),
            userOperation,
        )
        return userTransaction.gas
    }
}
