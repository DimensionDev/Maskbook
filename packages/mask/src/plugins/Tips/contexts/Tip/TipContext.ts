import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleToken, NonFungibleToken, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'
import { createContext, Dispatch, SetStateAction } from 'react'
import { TipsAccount, TipsType } from '../../types/index.js'

export interface ContextOptions {
    recipient: TipsAccount | undefined
    recipientSnsId: string
    recipientAddress: string
    setRecipient: Dispatch<SetStateAction<string>>
    tipType: TipsType
    setTipType: Dispatch<SetStateAction<TipsType>>
    recipients: TipsAccount[]
    token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null
    setToken: Dispatch<SetStateAction<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null>>
    amount: string
    setAmount: Dispatch<SetStateAction<string>>
    nonFungibleTokenId: string | null
    setNonFungibleTokenId: Dispatch<SetStateAction<string | null>>
    nonFungibleTokenContract: NonFungibleTokenContract<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null
    nonFungibleTokenAddress: string
    setNonFungibleTokenAddress: Dispatch<SetStateAction<string>>
    sendTip: () => Promise<string | undefined>
    isSending: boolean
    storedTokens: Array<NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    reset: () => void
    setGasConfig: Dispatch<SetStateAction<GasConfig | undefined>>
    gasConfig: GasConfig | undefined
}

export const TipContext = createContext<ContextOptions>({
    recipient: undefined,
    recipientAddress: '',
    recipientSnsId: '',
    setRecipient: noop,
    tipType: TipsType.Collectibles,
    setTipType: noop,
    recipients: [],
    token: null,
    setToken: noop,
    amount: '',
    setAmount: noop,
    nonFungibleTokenId: null,
    setNonFungibleTokenId: noop,
    nonFungibleTokenContract: null,
    nonFungibleTokenAddress: '',
    setNonFungibleTokenAddress: noop,
    sendTip: noop as () => Promise<string | undefined>,
    isSending: false,
    storedTokens: [],
    reset: noop,
    setGasConfig: noop,
    gasConfig: undefined,
})
