import urlcat from 'urlcat'
import { first } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, isValidAddress, isValidChainId, isValidDomain } from '@masknet/web3-shared-evm'
import type { ENSRecord } from '../types.js'
import { fetchFromChainbase } from '../helpers.js'
import type { DomainAPI } from '../../entry-types.js'

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

        if (!isSameAddress(response?.[0]?.address, address)) return

        const name = first(response)?.name
        if (!name) return
        return isValidDomain(name) ? name : isValidDomain(`${name}.eth`) ? `${name}.eth` : undefined
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        if (!name) return
        const address = await this.getAddress(chainId, name)
        if (isValidAddress(address)) return formatEthereumAddress(address)
        return
    }

    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        if (!address || !isValidAddress(address)) return
        const name = await this.getName(chainId, address)
        if (isValidDomain(name)) return name
        return
    }
}
