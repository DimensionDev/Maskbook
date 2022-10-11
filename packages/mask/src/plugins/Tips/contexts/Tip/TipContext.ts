import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleToken, NonFungibleToken, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'
import { createContext, Dispatch, SetStateAction } from 'react'
import { TipsAccount, TipsType, ValidationTuple } from '../../types/index.js'

export interface TipContextOptions {
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
    isDirty: boolean
    storedTokens: Array<NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    reset: () => void
    setGasOption: Dispatch<SetStateAction<GasOptionConfig | undefined>>
    gasOption: GasOptionConfig | undefined
    validation: ValidationTuple
    validatingRecipient: boolean
    recipientValidation: ValidationTuple
}

export const TipContext = createContext<TipContextOptions>({
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
    isDirty: false,
    storedTokens: [],
    reset: noop,
    setGasOption: noop,
    gasOption: undefined,
    validation: [true],
    validatingRecipient: false,
    recipientValidation: [true],
})
