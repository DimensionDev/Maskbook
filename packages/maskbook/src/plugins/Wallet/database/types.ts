import type { ChainId } from '@dimensiondev/web3-shared'
import type { WalletRecord } from '@dimensiondev/maskbook-shared'

export interface ERC20TokenRecord {
    /** contract address */
    address: string
    /** eth chain id */
    chainId: ChainId
    /** token name */
    name: string
    /** token decimal */
    decimals: number
    /** token symbol */
    symbol: string
}

export interface ERC721TokenRecord {
    /** contract address */
    address: string
    /** eth chain id */
    chainId: ChainId
    /** token name */
    name: string
    /** token symbol */
    symbol: string
    /** token id */
    tokenId: string
    /** base uri */
    baseURI?: string
    /** asset uri */
    tokenURI?: string
    /** asset name */
    assetName?: string
    /** asset description */
    assetDescription?: string
    /** asset img uri */
    assetImage?: string
}

export interface ERC1155TokenRecord {
    /** contract address */
    address: string
    /** eth chain id */
    chainId: ChainId
    /** token name */
    name: string
    /** token id */
    tokenId: string
    /** asset uri */
    uri?: string
    /** asset name */
    assetName?: string
    /** asset description */
    assetDescription?: string
    /** asset img uri */
    assetImage?: string
}

export type { WalletRecord } from '@dimensiondev/maskbook-shared'

export interface PhraseRecord {
    id: string
    /** HD wallet path address index */
    index: number
    /** HD wallet path w/o address index */
    path: string
    mnemonic: string[]
    passphrase: string
    createdAt: Date
    updatedAt: Date
}

export interface ERC20TokenRecordInDatabase extends ERC20TokenRecord {}

export interface ERC721TokenRecordInDatabase extends ERC721TokenRecord {
    record_id: string
}

export interface ERC1155TokenRecordInDatabase extends ERC1155TokenRecord {
    record_id: string
}

export interface WalletRecordInDatabase extends WalletRecord {}

export interface PhraseRecordInDatabase extends PhraseRecord {}
