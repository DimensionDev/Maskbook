import { fetchJSON } from '@masknet/web3-providers/helpers'
import {
    type ChainId,
    formatEthereumAddress,
    isValidAddress,
    isValidChainId,
    isValidDomain,
} from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { DomainAPI } from '../types/Domain.js'

interface Response<T> {
    success: boolean
    data: T
}

const FIREFLY_WORKER_HOST = 'https://firefly.r2d2.to'
class FireflyDomainAPI implements DomainAPI.Provider<ChainId> {
    private async getAddress(chainId: ChainId, domain: string) {
        if (!isValidChainId(chainId)) return

        const url = urlcat(FIREFLY_WORKER_HOST, '/ens/lookup', { domain })
        const response = await fetchJSON<Response<{ address: string; domain: string; provider: string }>>(url)
        if (!response.success) return
        return response.data.address
    }

    private async getName(chainId: ChainId, address: string) {
        if (!isValidChainId(chainId)) return

        const url = urlcat(FIREFLY_WORKER_HOST, '/ens/reverse', { address })
        const response = await fetchJSON<Response<{ address: string; domain: string; provider: string }>>(url)
        if (!response.success) return
        return response.data.domain
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
export const FireflyDomain = new FireflyDomainAPI()
