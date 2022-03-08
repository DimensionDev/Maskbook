import type { ERC721ContractDetailed, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'
import { createContext, Dispatch, SetStateAction } from 'react'
import { TipType } from '../../types'

export interface ContextOptions {
    recipient: string
    setRecipient: Dispatch<SetStateAction<string>>
    tipType: TipType
    setTipType: Dispatch<SetStateAction<TipType>>
    recipients: string[]
    setRecipients: Dispatch<SetStateAction<string[]>>
    token: FungibleTokenDetailed | null
    setToken: Dispatch<SetStateAction<FungibleTokenDetailed | null>>
    amount: string
    setAmount: Dispatch<SetStateAction<string>>
    erc721TokenId: string | null
    setErc721TokenId: Dispatch<SetStateAction<string | null>>
    erc721Contract: ERC721ContractDetailed | null
    setErc721Contract: Dispatch<SetStateAction<ERC721ContractDetailed | null>>
}

export const TipContext = createContext<ContextOptions>({
    recipient: '',
    setRecipient: noop,
    tipType: TipType.NFT,
    setTipType: noop,
    recipients: [],
    setRecipients: noop,
    token: null,
    setToken: noop,
    amount: '',
    setAmount: noop,
    erc721TokenId: null,
    setErc721TokenId: noop,
    erc721Contract: null,
    setErc721Contract: noop,
})
