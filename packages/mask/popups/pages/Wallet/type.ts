import type {
    JsonRpcRequest,
    TransactionDescriptor,
    TransactionContext,
    GasOptionType,
} from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter, Transaction } from '@masknet/web3-shared-evm'

export enum ReplaceType {
    CANCEL = 'CANCEL',
    SPEED_UP = 'SPEED_UP',
}

export enum ProfilePhotoType {
    Image = 'Image',
}

export enum ContactType {
    Recipient = 'Recipient',
}

export enum WalletAssetTabs {
    Tokens = 'Tokens',
    Activity = 'Activity',
}

export interface GasSetting {
    gasLimit?: string | undefined
    gasPrice?: string
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
    paymentToken?: string
}

export interface TransactionDetail {
    gasOptionType?: GasOptionType
    payload: JsonRpcRequest
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
}
