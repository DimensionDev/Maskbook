import type { JsonRpcPayload } from 'web3-core-helpers'
import type { TransactionDescriptor, TransactionContext, GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter, Transaction } from '@masknet/web3-shared-evm'

export enum ReplaceType {
    CANCEL = 'CANCEL',
    SPEED_UP = 'SPEED_UP',
}

enum TransferAddressError {
    SAME_ACCOUNT = 'SAME_ACCOUNT',
    CONTRACT_ADDRESS = 'CONTRACT_ADDRESS',
    RESOLVE_FAILED = 'RESOLVE_FAILED',
    NETWORK_NOT_SUPPORT = 'NETWORK_NOT_SUPPORT',
}

export enum MethodAfterPersonaSign {
    DISCONNECT_NEXT_ID = 'DISCONNECT_NEXT_ID',
}
export enum ProfilePhotoType {
    Image = 'Image',
    NFT = 'NFT',
}

export enum ContactType {
    Owned = 'Owned',
    Recipient = 'Recipient',
}

export enum WalletAssetTabs {
    Tokens = 'Tokens',
    Collectibles = 'Collectibles',
    Activity = 'Activity',
}

export type GasSetting = {
    gas: string
    gasPrice?: string
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
    paymentToken?: string
}

export type TransactionDetail = {
    owner?: string
    paymentToken?: string
    allowMaskAsGas?: boolean
    gasOptionType?: GasOptionType
    payload: JsonRpcPayload
    computedPayload: Partial<Transaction>
    formattedTransaction?: TransactionDescriptor<ChainId, Transaction, TransactionParameter>
    transactionContext?: TransactionContext<ChainId, TransactionParameter>
}

export enum TransferTabType {
    Token = 'Token',
    NFT = 'NFT',
}
