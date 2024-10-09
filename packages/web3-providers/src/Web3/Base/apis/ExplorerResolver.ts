import urlcat from 'urlcat'
import type { ChainDescriptor } from '@masknet/web3-shared-base'

interface ExplorerOptions {
    addressPathname?: string
    blockPathname?: string
    transactionPathname?: string
    domainPathname?: string
    fungibleTokenPathname?: string
    nonFungibleTokenPathname?: string
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

    protected getExplorerURL(chainId: ChainId) {
        const chainDescriptor = this.descriptors().find((x) => x.chainId === chainId)
        return chainDescriptor?.explorerUrl ?? { url: '' }
    }

    explorerUrl(chainId: ChainId) {
        return this.getExplorerURL(chainId)
    }

    addressLink(chainId: ChainId, address: string) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url || !address) return
        return urlcat(explorerUrl.url, this.options.addressPathname, {
            address,
            ...explorerUrl.parameters,
        })
    }

    blockLink(chainId: ChainId, blockNumber: number) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return

        return urlcat(explorerUrl.url, this.options.blockPathname, {
            blockNumber,
            ...explorerUrl.parameters,
        })
    }

    transactionLink(chainId: ChainId, id: string) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return

        return urlcat(explorerUrl.url, this.options.transactionPathname, {
            id,
            ...explorerUrl.parameters,
        })
    }

    fungibleTokenLink(chainId: ChainId, address: string) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!address || !explorerUrl.url) return
        return urlcat(explorerUrl.url, this.options.fungibleTokenPathname, {
            address,
            ...explorerUrl.parameters,
        })
    }

    nonFungibleTokenLink(chainId: ChainId, address: string, tokenId: string) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return

        return urlcat(explorerUrl.url, this.options.nonFungibleTokenPathname, {
            address,
            tokenId,
            ...explorerUrl.parameters,
        })
    }

    nonFungibleTokenCollectionLink(chainId: ChainId, address: string) {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return
        return urlcat(explorerUrl.url, this.options.collectionPathname, {
            address,
            ...explorerUrl?.parameters,
        })
    }
}
