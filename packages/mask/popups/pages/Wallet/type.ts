import type { JsonRpcPayload } from 'web3-core-helpers'
import type { TransactionDescriptor, TransactionContext, GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter, Transaction } from '@masknet/web3-shared-evm'

export enum ReplaceType {
    CANCEL = 'CANCEL',
    SPEED_UP = 'SPEED_UP',
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
    gasLimit?: string | undefined
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

    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    gasPrice?: string
    gas?: string
}

export enum TransferTabType {
    Token = 'Token',
    NFT = 'NFT',
}
