import type { FungibleToken, NonFungibleToken, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { ChainId, GasConfig, SchemaType, TransactionState, TransactionStateType } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'
import { createContext, Dispatch, SetStateAction } from 'react'
import { TipType } from '../../types'

export interface ContextOptions {
    recipient: string
    recipientSnsId: string
    setRecipient: Dispatch<SetStateAction<string>>
    tipType: TipType
    setTipType: Dispatch<SetStateAction<TipType>>
    recipients: string[]
    token: FungibleToken<ChainId, SchemaType> | null
    setToken: Dispatch<SetStateAction<FungibleToken<ChainId, SchemaType> | null>>
    amount: string
    setAmount: Dispatch<SetStateAction<string>>
    erc721TokenId: string | null
    setErc721TokenId: Dispatch<SetStateAction<string | null>>
    erc721Contract: NonFungibleTokenContract<ChainId, SchemaType> | null
    erc721Address: string
    setErc721Address: Dispatch<SetStateAction<string>>
    sendTip: () => Promise<void>
    isSending: boolean
    sendState: TransactionState
    storedTokens: NonFungibleToken<ChainId, SchemaType>[]
    reset: () => void
    setGasConfig: Dispatch<SetStateAction<GasConfig | undefined>>
}

export const TipContext = createContext<ContextOptions>({
    recipient: '',
    recipientSnsId: '',
    setRecipient: noop,
    tipType: TipType.NFT,
    setTipType: noop,
    recipients: [],
    token: null,
    setToken: noop,
    amount: '',
    setAmount: noop,
    erc721TokenId: null,
    setErc721TokenId: noop,
    erc721Contract: null,
    erc721Address: '',
    setErc721Address: noop,
    sendTip: noop as () => Promise<void>,
    isSending: false,
    sendState: { type: TransactionStateType.UNKNOWN },
    storedTokens: [],
    reset: noop,
    setGasConfig: noop,
})
