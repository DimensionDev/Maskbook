import urlcat from 'urlcat'
import { first } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import {
    ChainId,
    ContractWallet,
    Create2Factory,
    createContract,
    getSmartPayConstants,
    UserOperation,
    UserTransaction,
} from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import { BUNDLER_ROOT } from './constants.js'
import type { BundlerAPI } from '../types/Bundler.js'
import type { ContractAccountAPI } from '../types/index.js'
import { MulticallAPI } from '../Multicall/index.js'
import { Web3API } from '../EVM/index.js'

export class SmartPayBundlerAPI implements BundlerAPI.Provider {
    private async healthz() {
        const response = await fetch(urlcat(BUNDLER_ROOT, '/healthz'), {
            method: 'GET',
        })
        const json: BundlerAPI.Healthz = await response.json()

        console.log('DEBUG: JSON')
        console.log({
            url: urlcat(BUNDLER_ROOT, '/healthz'),
            json,
        })

        return {
            ...json,
            chain_id: '137',
        }
    }

    private async handle(userOperation: UserOperation) {
        const response = await fetch(urlcat(BUNDLER_ROOT, '/handle'), {
            method: 'POST',
            body: JSON.stringify(UserTransaction.toUserOperationSnakeCase(userOperation)),
        })
        const json = (await response.json()) as { tx_hash: string }
        return json.tx_hash
    }

    private async assetChainId(chainId: ChainId) {
        const chainIds = await this.getSupportedChainIds()
        if (!chainIds.includes(chainId)) throw new Error(`Not supported ${chainId}.`)
    }

    async getSigner(chainId: ChainId): Promise<string> {
        await this.assetChainId(chainId)

        const healthz = await this.healthz()
        return healthz.bundler_eoa
    }

    async getSupportedChainIds(): Promise<ChainId[]> {
        const healthz = await this.healthz()
        return [Number.parseInt(healthz.chain_id, 10)] as ChainId[]
    }
    async getSupportedEntryPoints(chainId: ChainId): Promise<string[]> {
        await this.assetChainId(chainId)

        const healthz = await this.healthz()
        return [healthz.entrypoint_contract_address]
    }
    simulateUserOperation(
        chainId: ChainId,
        userOperation: UserOperation,
    ): Promise<{ preOpGas: string; prefund: string }> {
        throw new Error('Method not implemented.')
    }
    async sendUserOperation(chainId: ChainId, userOperation: UserOperation): Promise<string> {
        await this.assetChainId(chainId)

        return this.handle(userOperation)
    }
}

export class SmartPayAccountAPI implements ContractAccountAPI.Provider<NetworkPluginID.PLUGIN_EVM> {
    private web3 = new Web3API()
    private multicall = new MulticallAPI()
    private bundler = new SmartPayBundlerAPI()

    private async getEntryPoint(chainId: ChainId) {
        const entryPoints = await this.bundler.getSupportedEntryPoints(chainId)
        return first(entryPoints)
    }

    private createWeb3(chainId: ChainId) {
        return this.web3.createSDK(chainId)
    }

    private createWalletContract(chainId: ChainId, address: string) {
        return createContract<Wallet>(this.createWeb3(chainId), address, WalletABI as AbiItem[])
    }

    private createContractAccount(
        chainId: ChainId,
        address: string,
        owner: string,
        deployed = true,
        funded = false,
    ): ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM> {
        return {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            chainId,
            id: `${NetworkPluginID.PLUGIN_EVM}_${chainId}_${address}`,
            address,
            owner,
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
    private async getOwnedAccountsFromMulticall(chainId: ChainId, owner: string, options: string[]) {
        const contracts = options.map((x) => this.createWalletContract(chainId, x)!)
        const names = Array.from<'owner'>({ length: options.length }).fill('owner')
        const calls = this.multicall.createMultipleContractSingleData(contracts, names, [])
        const results = await this.multicall.call(chainId, contracts, names, calls)
        const accounts = results.flatMap((x) => (x.succeed && x.value ? x.value : []))

        // if the owner didn't derive any account before, then use the first account.
        return accounts.length === 0
            ? options.slice(0, 1).map((x) => this.createContractAccount(chainId, x, owner, false))
            : accounts.map((x) => this.createContractAccount(chainId, x, owner))
    }

    /**
     * Query the on-chain changeOwner event from chainbase.
     * @param chainId
     * @param owner
     * @returns
     */
    private async getOwnedAccountsFromChainbase(chainId: ChainId, owner: string) {
        // TODO: impl chainbase query
        return []
    }

    private async getOwnedAccounts(
        chainId: ChainId,
        owner: string,
    ): Promise<Array<ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const entryPoint = await this.getEntryPoint(chainId)
        if (!entryPoint) throw new Error('No entry point contract.')

        const { LOGIC_WALLET_CONTRACT_ADDRESS, CREATE2_FACTORY_CONTRACT_ADDRESS } = getSmartPayConstants(chainId)
        if (!LOGIC_WALLET_CONTRACT_ADDRESS) throw new Error('No logic wallet contract.')
        if (!CREATE2_FACTORY_CONTRACT_ADDRESS) throw new Error('No create2 contract.')

        const contractWallet = new ContractWallet(owner, LOGIC_WALLET_CONTRACT_ADDRESS, entryPoint)
        const create2Factory = new Create2Factory(CREATE2_FACTORY_CONTRACT_ADDRESS)

        const allSettled = await Promise.allSettled([
            this.getOwnedAccountsFromMulticall(chainId, owner, create2Factory.derive(contractWallet.initCode)),
            this.getOwnedAccountsFromChainbase(chainId, owner),
        ])
        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
    }

    async getAccounts(
        chainId: ChainId,
        owners: string[],
    ): Promise<Array<ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const allSettled = await Promise.allSettled(owners.map((x) => this.getOwnedAccounts(chainId, x)))
        return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
    }
}
