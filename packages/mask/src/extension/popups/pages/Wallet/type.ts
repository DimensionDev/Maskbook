import type { TransactionDescriptor, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

export enum ReplaceType {
    CANCEL = 'CANCEL',
    SPEED_UP = 'SPEED_UP',
}

export enum TransferAddressError {
    SAME_ACCOUNT = 'SAME_ACCOUNT',
    CONTRACT_ADDRESS = 'CONTRACT_ADDRESS',
    RESOLVE_FAILED = 'RESOLVE_FAILED',
    NETWORK_NOT_SUPPORT = 'NETWORK_NOT_SUPPORT',
}

export enum MethodAfterPersonaSign {
    DISCONNECT_NEXT_ID = 'DISCONNECT_NEXT_ID',
}
