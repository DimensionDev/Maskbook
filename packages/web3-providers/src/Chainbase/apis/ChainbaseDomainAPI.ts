import urlcat from 'urlcat'
import LRUCache from 'lru-cache'
import { first } from 'lodash-es'
import { ChainId, formatEthereumAddress, isValidAddress, isValidChainId, isValidDomain } from '@masknet/web3-shared-evm'
import { formatAddress } from '@masknet/web3-shared-solana'
import type { ENSRecord } from '../types.js'
import type { DomainAPI } from '../../entry-types.js'
import { fetchFromChainbase } from './helpers.js'

const domainCache = new LRUCache<ChainId, Record<string, string>>({
    max: 100,
    ttl: 300_000,
})

export class ChainbaseDomainAPI implements DomainAPI.Provider<ChainId> {
    private async getAddress(chainId: ChainId, name: string) {
        if (!isValidChainId(chainId)) return

        const response = await fetchFromChainbase<ENSRecord>(
            urlcat(`/v1/${chainId !== ChainId.BSC ? 'ens' : 'space-id'}/records`, { chain_id: chainId, domain: name }),
        )
        return response?.address
    }

    private async getName(chainId: ChainId, address: string) {
        if (!isValidChainId(chainId)) return

        const response = await fetchFromChainbase<ENSRecord[]>(
            urlcat(`/v1/${chainId !== ChainId.BSC ? 'ens' : 'space-id'}/reverse`, { chain_id: chainId, address }),
        )

        const name = first(response)?.name
        if (!name) return
        return isValidDomain(name) ? name : `${name}.eth`
    }

    private addName(chainId: ChainId, name: string, address: string) {
        const formattedAddress = formatEthereumAddress(address)
        const cache = domainCache.get(chainId)

        domainCache.set(chainId, {
            ...cache,
            [name]: formattedAddress,
            [formattedAddress]: name,
        })
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        if (!name) return

        const address = domainCache.get(chainId)?.[name] || (await this.getAddress(chainId, name))
        if (isValidAddress(address)) {
            this.addName(chainId, name, address)
            return formatEthereumAddress(address)
        }

        return
    }

    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        if (!address || !isValidAddress(address)) return

        const name = domainCache.get(chainId)?.[formatAddress(address)] || (await this.getName(chainId, address))
        if (name) {
            this.addName(chainId, name, address)
            return name
        }
        return
    }
}
