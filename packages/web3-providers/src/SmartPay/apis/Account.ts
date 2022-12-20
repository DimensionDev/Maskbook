import urlcat from 'urlcat'
import { compact, first, unionBy } from 'lodash-es'
import { AbiItem, padLeft, toHex } from 'web3-utils'
import {
    ChainId,
    ContractWallet,
    Create2Factory,
    createContract,
    getSmartPayConstants,
    isValidAddress,
} from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import { LOG_ROOT, MAX_ACCOUNT_LENGTH } from '../constants.js'
import { SmartPayBundlerAPI } from './Bundler.js'
import { SmartPayFunderAPI } from './Funder.js'
import { MulticallAPI } from '../../Multicall/index.js'
import { Web3API } from '../../EVM/index.js'
import type { ContractAccountAPI } from '../../entry-types.js'
import { fetchJSON } from '../../entry-helpers.js'

export class SmartPayAccountAPI implements ContractAccountAPI.Provider<NetworkPluginID.PLUGIN_EVM> {
    private web3 = new Web3API()
    private multicall = new MulticallAPI()
    private bundler = new SmartPayBundlerAPI()
    private funder = new SmartPayFunderAPI()

    private async getEntryPoint(chainId: ChainId) {
        const entryPoints = await this.bundler.getSupportedEntryPoints(chainId)
        const entryPoint = first(entryPoints)
        if (!entryPoint) throw new Error('No entry point contract.')
        return entryPoint
    }

    private createWeb3(chainId: ChainId) {
        return this.web3.createSDK(chainId)
    }

    private createWalletContract(chainId: ChainId, address: string) {
        return createContract<Wallet>(this.createWeb3(chainId), address, WalletABI as AbiItem[])
    }

    private async createContractWallet(chainId: ChainId, owner: string) {
        if (!owner) throw new Error('No owner address.')

        const { LOGIC_WALLET_CONTRACT_ADDRESS } = getSmartPayConstants(chainId)
        if (!LOGIC_WALLET_CONTRACT_ADDRESS) throw new Error('No logic wallet contract.')

        const entryPoint = await this.getEntryPoint(chainId)
        return new ContractWallet(chainId, owner, LOGIC_WALLET_CONTRACT_ADDRESS, entryPoint)
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
    ): ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM> {
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
                this.createContractAccount(chainId, options[index], owner, owner, isValidAddress(x)),
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
        const { records: logs } = await fetchJSON<{ records: ContractAccountAPI.Log[]; count: number }>(
            urlcat(LOG_ROOT, '/records', {
                newOwnerAddress: padLeft(owner, 64),
                size: MAX_ACCOUNT_LENGTH,
                offset: 0,
            }),
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
    ): Promise<Array<ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const create2Factory = await this.createCreate2Factory(chainId, owner)
        const contractWallet = await this.createContractWallet(chainId, owner)
        const operations = await this.funder.getOperationsByOwner(chainId, owner)

        const allSettled = await Promise.allSettled([
            this.getAccountsFromMulticall(
                chainId,
                owner,
                create2Factory.deriveUntil(contractWallet.initCode, MAX_ACCOUNT_LENGTH),
            ),
            this.getAccountsFromChainbase(chainId, owner),
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
    ): Promise<Array<ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const allSettled = await Promise.allSettled(owners.map((x) => this.getAccountsByOwner(chainId, x)))
        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
    }
}
