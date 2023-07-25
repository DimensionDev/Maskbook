import urlcat from 'urlcat'
import { compact, first, unionBy } from 'lodash-es'
import { padLeft, toHex } from 'web3-utils'
import { NetworkPluginID } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getSmartPayConstants, isValidAddress, type ChainId } from '@masknet/web3-shared-evm'
import { MulticallAPI } from '../../Multicall/index.js'
import { ContractReadonlyAPI } from '../../Web3/EVM/apis/ContractReadonlyAPI.js'
import { SmartPayBundlerAPI } from './BundlerAPI.js'
import { SmartPayFunderAPI } from './FunderAPI.js'
import { ContractWallet } from '../libs/ContractWallet.js'
import { Create2Factory } from '../libs/Create2Factory.js'
import { LOG_ROOT, MAX_ACCOUNT_LENGTH, THE_GRAPH_PROD } from '../constants.js'
import type { OwnerAPI } from '../../entry-types.js'
import { fetchJSON } from '../../entry-helpers.js'

type OwnerShip = {
    address: string
    owner: string
    id: string
    creator: string
}

export class SmartPayOwnerAPI implements OwnerAPI.Provider<NetworkPluginID.PLUGIN_EVM> {
    private Contract = new ContractReadonlyAPI()
    private Multicall = new MulticallAPI()
    private Bundler = new SmartPayBundlerAPI()
    private Funder = new SmartPayFunderAPI()

    private async getEntryPoint(chainId: ChainId) {
        const entryPoints = await this.Bundler.getSupportedEntryPoints(chainId)
        const entryPoint = first(entryPoints)
        if (!entryPoint || !isValidAddress(entryPoint)) throw new Error(`Not supported ${chainId}`)
        return entryPoint
    }

    private createWalletContract(chainId: ChainId, address: string) {
        return this.Contract.getWalletContract(address, {
            chainId,
        })
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

    private filterAccounts(accounts: Array<OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>>) {
        return compact(
            accounts.map((x, index, array) => {
                const allElement = array.filter((y) => isSameAddress(y.address, x.address))
                if (allElement.length === 1) return x
                return x.creator ? x : null
            }),
        )
    }

    private createContractAccount(
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
    private async getAccountsFromMulticall(chainId: ChainId, owner: string, options: string[]) {
        const contracts = options.map((x) => this.createWalletContract(chainId, x)!)
        const names = Array.from<'owner'>({ length: options.length }).fill('owner')
        const calls = this.Multicall.createMultipleContractSingleData(contracts, names, [])
        const results = await this.Multicall.call(chainId, contracts, names, calls)
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

    private async getAccountsFromTheGraph(chainId: ChainId, owner: string) {
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

    /**
     * Query the on-chain changeOwner event from chainbase.
     * @param chainId
     * @param owner
     * @returns
     */
    private async getAccountsFromChainbase(chainId: ChainId, owner: string) {
        const { records: logs } = await fetchJSON<{ records: OwnerAPI.Log[]; count: number }>(
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

        const operations = await this.Funder.getOperationsByOwner(chainId, owner)

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
        exact = true,
    ): Promise<Array<OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>>> {
        const accounts = await queryClient.fetchQuery({
            queryKey: ['smart-pay', 'get-accounts-by-owner', chainId, owner, exact],
            cacheTime: 1000_000,
            queryFn: async () => {
                const create2Factory = await this.createCreate2Factory(chainId, owner)
                const contractWallet = await this.createContractWallet(chainId, owner)
                const operations = await this.Funder.getOperationsByOwner(chainId, owner)

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
                        funded: y.creator
                            ? operations.some((operation) => isSameAddress(operation.walletAddress, y.address))
                            : y.funded,
                    }))

                return this.filterAccounts(result).filter((x) => (exact ? isSameAddress(x.owner, owner) : true))
            },
        })
        return accounts ?? []
    }

    async getAccountsByOwners(
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
