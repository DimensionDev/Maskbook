import { compact, first } from 'lodash-es'
import { NetworkPluginID } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getSmartPayConstants, isValidAddress, type ChainId } from '@masknet/web3-shared-evm'
import { Multicall } from '../../Multicall/index.js'
import { EVMContractReadonly } from '../../Web3/EVM/apis/ContractReadonlyAPI.js'
import { SmartPayBundler } from './BundlerAPI.js'
import { SmartPayFunder } from './FunderAPI.js'
import { ContractWallet } from '../libs/ContractWallet.js'
import { Create2Factory } from '../libs/Create2Factory.js'
import { MAX_ACCOUNT_LENGTH, THE_GRAPH_PROD } from '../constants.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { OwnerAPI } from '../../entry-types.js'

interface OwnerShip {
    address: string
    owner: string
    id: string
    creator: string
}

export class SmartPayOwner {
    private static async getEntryPoint(chainId: ChainId) {
        const entryPoints = await SmartPayBundler.getSupportedEntryPoints(chainId)
        const entryPoint = first(entryPoints)
        if (!entryPoint || !isValidAddress(entryPoint)) throw new Error(`Not supported ${chainId}`)
        return entryPoint
    }

    private static createWalletContract(chainId: ChainId, address: string) {
        return EVMContractReadonly.getWalletContract(address, {
            chainId,
        })
    }

    private static async createContractWallet(chainId: ChainId, owner: string) {
        if (!owner) throw new Error('No owner address.')
        return new ContractWallet(
            chainId,
            owner,
            getSmartPayConstants(chainId).LOGIC_WALLET_CONTRACT_ADDRESS ?? '',
            await this.getEntryPoint(chainId),
        )
    }

    private static async createCreate2Factory(chainId: ChainId, owner: string) {
        if (!owner) throw new Error('No owner address.')

        const { CREATE2_FACTORY_CONTRACT_ADDRESS } = getSmartPayConstants(chainId)
        if (!CREATE2_FACTORY_CONTRACT_ADDRESS) throw new Error('No create2 contract.')

        return new Create2Factory(CREATE2_FACTORY_CONTRACT_ADDRESS)
    }

    private static filterAccounts(accounts: Array<OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>>) {
        const countMap = new Map<string, number>()
        accounts.forEach((x) => {
            const address = x.address.toLowerCase()
            const count = countMap.get(address) || 0
            countMap.set(address, count + 1)
        })
        return accounts.filter((x) => countMap.get(x.address.toLowerCase()) === 1 || x.creator)
    }

    private static createContractAccount(
        chainId: ChainId,
        address: string,
        owner: string,
        creator: string,
        deployed = true,
        funded = false,
    ): OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM> {
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
    private static async getAccountsFromMulticall(chainId: ChainId, owner: string, options: string[]) {
        const contracts = options.map((x) => this.createWalletContract(chainId, x)!)
        const names = Array.from<'owner'>({ length: options.length }).fill('owner')
        const calls = Multicall.createMultipleContractSingleData(contracts, names, [])
        const results = await Multicall.call(chainId, contracts, names, calls)
        const accounts = results.flatMap((x) => (x.succeed && x.value ? x.value : ''))

        if (!accounts.length) {
            return []
        }

        return compact(
            accounts.map((x, index) =>
                this.createContractAccount(chainId, options[index], x || owner, owner, isValidAddress(x)),
            ),
        )
    }

    private static async getAccountsFromTheGraph(chainId: ChainId, owner: string) {
        const response = await fetchJSON<{
            data: {
                ownerShips: OwnerShip[]
            }
        }>(THE_GRAPH_PROD, {
            method: 'POST',
            body: JSON.stringify({
                query: `{
                    ownerShips(where: { owner: "${owner}" }) {
                      id
                      address
                      owner
                      creator
                    }
                }`,
            }),
        })

        return response.data.ownerShips.map((x) =>
            this.createContractAccount(chainId, x.address, x.owner, '', true, true),
        )
    }

    static async getAccountsByOwner(
        chainId: ChainId,
        owner: string,
        exact = true,
    ): Promise<Array<OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const accounts = await queryClient.fetchQuery({
            queryKey: ['smart-pay', 'get-accounts-by-owner', chainId, owner, exact],
            gcTime: 1000_000,
            queryFn: async () => {
                const create2Factory = await this.createCreate2Factory(chainId, owner)
                const contractWallet = await this.createContractWallet(chainId, owner)
                const operations = await SmartPayFunder.getOperationsByOwner(chainId, owner)

                const allSettled = await Promise.allSettled([
                    this.getAccountsFromMulticall(
                        chainId,
                        owner,
                        create2Factory.deriveUntil(contractWallet.initCode, MAX_ACCOUNT_LENGTH),
                    ),
                    this.getAccountsFromTheGraph(chainId, owner),
                ])

                const result = allSettled
                    .flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
                    .map((y) => ({
                        ...y,
                        funded:
                            y.creator ?
                                operations.some((operation) => isSameAddress(operation.walletAddress, y.address))
                            :   y.funded,
                    }))

                return this.filterAccounts(result).filter((x) => (exact ? isSameAddress(x.owner, owner) : true))
            },
        })
        return accounts ?? []
    }

    static async getAccountsByOwners(
        chainId: ChainId,
        owners: string[],
        exact = true,
    ): Promise<Array<OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const allSettled = await Promise.allSettled(owners.map((x) => this.getAccountsByOwner(chainId, x, false)))
        const result = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))

        /**
         * There may be a transfer of ownership between different owners with the same address,
         * giving priority to the result obtained by multicall
         */
        return this.filterAccounts(result).filter((x) => (exact ? owners.some((y) => isSameAddress(y, x.owner)) : true))
    }
}
