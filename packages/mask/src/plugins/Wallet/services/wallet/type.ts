import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { ERC1155TokenDetailed, ERC20TokenDetailed, ERC721TokenDetailed, Wallet } from '@masknet/web3-shared-evm'

export interface ERC20TokenRecord extends Omit<ERC20TokenDetailed, 'type'> {
    id: string
    type: 'erc20'
    createdAt: Date
    updatedAt: Date
}

export interface ERC721TokenRecord extends ERC721TokenDetailed {
    id: string
    type: 'erc721'
    createdAt: Date
    updatedAt: Date
}

export interface ERC1155TokenRecord extends Omit<ERC1155TokenDetailed, 'type'> {
    id: string
    type: 'erc1155'
    createdAt: Date
    updatedAt: Date
}

export interface WalletRecord extends Omit<Wallet, 'configurable' | 'hasStoredKeyInfo' | 'hasDerivationPath'> {
    id: string
    type: 'wallet'
    derivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    encrypted: ArrayBuffer
}
