import urlcat from 'urlcat'
import type { ChainDescriptor, Web3State } from '@masknet/web3-shared-base'
import type { ValueRefWithReady } from '@masknet/shared-base'

export interface ExplorerOptions {
    addressPathname?: string
    blockPathname?: string
    transactionPathname?: string
    domainPathname?: string
    fungibleTokenPathname?: string
    nonFungibleTokenPathname?: string
}

export class ExplorerResolverAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
> {
    constructor(
        private descriptors: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>>,
        private ref?: ValueRefWithReady<
            Web3State<
                ChainId,
                SchemaType,
                ProviderType,
                NetworkType,
                MessageRequest,
                MessageResponse,
                Transaction,
                TransactionParameter
            >
        >,
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
        }
        return {
            ...defaults,
            ...this.initial,
        }
    }

    private getDescriptors() {
        return [...this.descriptors, ...(this.ref?.value.Network?.networks?.getCurrentValue() ?? [])]
    }

    private getExplorerURL(chainId: ChainId) {
        const chainDescriptor = this.getDescriptors().find((x) => x.chainId === chainId)
        return chainDescriptor?.explorerUrl ?? { url: '' }
    }

    explorerUrl = (chainId: ChainId) => this.getExplorerURL(chainId)

    addressLink = (chainId: ChainId, address: string, tokenId?: string) => {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return ''
        return urlcat(explorerUrl.url, this.options.addressPathname, {
            address,
            ...explorerUrl?.parameters,
        })
    }

    blockLink = (chainId: ChainId, blockNumber: number) => {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return ''

        return urlcat(explorerUrl.url, this.options.blockPathname, {
            blockNumber,
            ...explorerUrl?.parameters,
        })
    }

    transactionLink = (chainId: ChainId, id: string) => {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return ''

        return urlcat(explorerUrl.url, this.options.transactionPathname, {
            id,
            ...explorerUrl?.parameters,
        })
    }

    domainLink = (chainId: ChainId, domain: string) => {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return ''
        return urlcat(explorerUrl.url, this.options.domainPathname, {
            domain,
            ...explorerUrl?.parameters,
        })
    }

    fungibleTokenLink = (chainId: ChainId, address: string) => {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!address || !explorerUrl.url) return ''
        return urlcat(explorerUrl.url, this.options.fungibleTokenPathname, {
            address,
            ...explorerUrl?.parameters,
        })
    }

    nonFungibleTokenLink = (chainId: ChainId, address: string, tokenId: string) => {
        const explorerUrl = this.getExplorerURL(chainId)
        if (!explorerUrl.url) return ''
        return urlcat(explorerUrl.url, this.options.nonFungibleTokenPathname, {
            address,
            tokenId,
            ...explorerUrl?.parameters,
        })
    }
}
