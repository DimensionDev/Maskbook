import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
import { type ChainDescriptor } from '@masknet/web3-shared-base'
import { type SchemaType, type ChainId, NetworkType } from '../types/index.js'
import { createNativeToken } from '../helpers/token.js'

// Learn more at: https://eips.ethereum.org/EIPS/eip-3085
export interface EIP3085Descriptor {
    chainId: string
    blockExplorerUrls?: string[]
    chainName?: string
    iconUrls?: string[]
    nativeCurrency?: {
        name: string
        symbol: string
        decimals: number
    }
    rpcUrls?: string[]
}

export class EIP3085Editor {
    constructor(public eip3085ChainDescriptor: EIP3085Descriptor) {}

    get descriptor(): ChainDescriptor<ChainId, SchemaType, NetworkType> {
        const chainId = Number.parseInt(this.eip3085ChainDescriptor.chainId, 16) as ChainId

        return {
            ID: `${this.eip3085ChainDescriptor.chainId}_${this.eip3085ChainDescriptor.chainName ?? 'UNKNOWN'}`,
            type: NetworkType.CustomNetwork,
            chainId,
            coinMarketCapChainId: '',
            coinGeckoChainId: '',
            coinGeckoPlatformId: '',
            name: this.eip3085ChainDescriptor.chainName ?? 'UNKNOWN',
            network: 'mainnet',
            nativeCurrency: {
                ...createNativeToken(chainId),
                name: this.eip3085ChainDescriptor.nativeCurrency?.name ?? 'UNKNOWN',
                symbol: this.eip3085ChainDescriptor.nativeCurrency?.symbol ?? 'UNKNOWN',
                decimals: this.eip3085ChainDescriptor.nativeCurrency?.decimals ?? 0,
            },
            rpcUrl: first(this.eip3085ChainDescriptor.rpcUrls) ?? '',
            explorerUrl: {
                url: first(this.eip3085ChainDescriptor.blockExplorerUrls) ?? '',
            },
            isCustomized: false,
        }
    }

    static from(descriptor: EIP3085Descriptor) {
        return new EIP3085Editor(descriptor)
    }

    static fromDescriptor(descriptor: ChainDescriptor<ChainId, SchemaType, NetworkType>) {
        return new EIP3085Editor({
            chainId: toHex(descriptor.chainId),
            chainName: descriptor.name,
            iconUrls: descriptor.iconUrl ? [descriptor.iconUrl] : [],
            blockExplorerUrls: descriptor.explorerUrl.url ? [descriptor.explorerUrl.url] : [],
            nativeCurrency: {
                name: descriptor.nativeCurrency.name,
                symbol: descriptor.nativeCurrency.symbol,
                decimals: descriptor.nativeCurrency.decimals,
            },
            rpcUrls: descriptor.rpcUrl ? [descriptor.rpcUrl] : [],
        })
    }
}
