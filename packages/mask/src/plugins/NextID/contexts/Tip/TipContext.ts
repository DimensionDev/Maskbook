import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import {
    ERC721ContractDetailed,
    FungibleTokenDetailed,
    TransactionState,
    TransactionStateType,
} from '@masknet/web3-shared-evm'
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
    token: FungibleTokenDetailed | null
    setToken: Dispatch<SetStateAction<FungibleTokenDetailed | null>>
    amount: string
    setAmount: Dispatch<SetStateAction<string>>
    erc721TokenId: string | null
    setErc721TokenId: Dispatch<SetStateAction<string | null>>
    erc721Contract: ERC721ContractDetailed | null
    erc721Address: string
    setErc721Address: Dispatch<SetStateAction<string>>
    sendTip: () => Promise<void>
    isSending: boolean
    sendState: TransactionState
    storedTokens: Web3Plugin.NonFungibleToken[]
    reset: () => void
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
})
