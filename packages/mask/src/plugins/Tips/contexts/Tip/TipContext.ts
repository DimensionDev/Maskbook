import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { FungibleToken, NonFungibleToken, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
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
    token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null
    setToken: Dispatch<SetStateAction<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null>>
    amount: string
    setAmount: Dispatch<SetStateAction<string>>
    nonFungibleTokenId: string | null
    setErc721TokenId: Dispatch<SetStateAction<string | null>>
    nonFungibleTokenContract: NonFungibleTokenContract<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null
    nonFungibleTokenAddress: string
    setNonFungibleTokenAddress: Dispatch<SetStateAction<string>>
    sendTip: () => Promise<string | undefined>
    isSending: boolean
    storedTokens: Array<NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
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
    nonFungibleTokenId: null,
    setErc721TokenId: noop,
    nonFungibleTokenContract: null,
    nonFungibleTokenAddress: '',
    setNonFungibleTokenAddress: noop,
    sendTip: noop as () => Promise<string | undefined>,
    isSending: false,
    storedTokens: [],
    reset: noop,
    setGasConfig: noop,
})
