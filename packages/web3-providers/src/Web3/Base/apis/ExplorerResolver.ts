import type { ChainDescriptor } from '@masknet/web3-shared-base'
import urlcat, { type ParamMap } from 'urlcat'

interface ExplorerOptions {
    addressPathname?: string
    blockPathname?: string
    transactionPathname?: string
    domainPathname?: string
    fungibleTokenPathname?: string
    nonFungibleTokenPathname?: string
    preferentialExplorer?: string
}

export class ExplorerResolver<ChainId, SchemaType, NetworkType> {
    constructor(
        private descriptors: () => ReadonlyArray<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
        private initial?: ExplorerOptions,
    ) {}
    private get options() {
        const defaults = {
            addressPathname: '/address/:address',
            blockPathname: '/block/:blockNumber',
            transactionPathname: '/tx/:id',
            domainPathname: '/address/:domain',
            fungibleTokenPathname: '/address/:address',
            nonFungibleTokenPathname: '/nft/:address/:tokenId',
            collectionPathname: '/token/:address',
        }
        return {
            ...defaults,
            ...this.initial,
        }
    }

    private getExplorerURL(chainId: ChainId) {
        if (this.options.preferentialExplorer) {
            return { url: this.options.preferentialExplorer }
        }

        const chainDescriptor = this.descriptors().find((x) => x.chainId === chainId)
        return chainDescriptor?.explorerUrl ?? { url: '' }
    }

    explorerUrl(chainId: ChainId) {
        return this.getExplorerURL(chainId)
    }

    addressLink(chainId: ChainId, address: string, params?: ParamMap) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url || !address) return
        return urlcat(explorerUrl.url, this.options.addressPathname, {
            address,
            ...explorerUrl.parameters,
            ...params,
        })
    }

    blockLink(chainId: ChainId, blockNumber: number, params?: ParamMap) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return

        return urlcat(explorerUrl.url, this.options.blockPathname, {
            blockNumber,
            ...explorerUrl.parameters,
            ...params,
        })
    }

    transactionLink(chainId: ChainId, id: string, params?: ParamMap) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return

        return urlcat(explorerUrl.url, this.options.transactionPathname, {
            id,
            ...explorerUrl.parameters,
            ...params,
        })
    }

    fungibleTokenLink(chainId: ChainId, address: string, params?: ParamMap) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!address || !explorerUrl.url) return
        return urlcat(explorerUrl.url, this.options.fungibleTokenPathname, {
            address,
            ...explorerUrl.parameters,
            ...params,
        })
    }

    nonFungibleTokenLink(chainId: ChainId, address: string, tokenId: string, params?: ParamMap) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return

        return urlcat(explorerUrl.url, this.options.nonFungibleTokenPathname, {
            address,
            tokenId,
            ...explorerUrl.parameters,
            ...params,
        })
    }

    nonFungibleTokenCollectionLink(chainId: ChainId, address: string, params?: ParamMap) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return
        return urlcat(explorerUrl.url, this.options.collectionPathname, {
            address,
            ...explorerUrl?.parameters,
            ...params,
        })
    }
}
