import { noop } from 'lodash-es'
import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SocialAccount } from '@masknet/shared-base'
import { TokenType } from '@masknet/web3-shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
import type { ValidationTuple } from '../../types/index.js'

export interface TipContextOptions {
    recipient: SocialAccount<Web3Helper.ChainIdAll> | undefined
    recipientUserId: string
    recipientAddress: string
    setRecipient: Dispatch<SetStateAction<string>>
    tipType: TokenType
    setTipType: Dispatch<SetStateAction<TokenType>>
    recipients: Array<SocialAccount<Web3Helper.ChainIdAll>>
    token: Web3Helper.FungibleTokenAll | null
    setToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenAll | null>>
    amount: string
    setAmount: Dispatch<SetStateAction<string>>
    sendTip: () => Promise<string | undefined>
    isSending: boolean
    isDirty: boolean
    reset: () => void
    setGasOption: Dispatch<SetStateAction<GasConfig | undefined>>
    gasOption: GasConfig | undefined
    validation: ValidationTuple
    validatingRecipient: boolean
    recipientValidation: ValidationTuple
    isAvailableBalance: boolean
    isGasSufficient: boolean
    balance: string
}

export const TipContext = createContext<TipContextOptions>({
    recipient: undefined,
    recipientAddress: '',
    recipientUserId: '',
    setRecipient: noop,
    tipType: TokenType.Fungible,
    setTipType: noop,
    recipients: [],
    token: null,
    setToken: noop,
    amount: '',
    setAmount: noop,
    sendTip: noop as () => Promise<string | undefined>,
    isSending: false,
    isDirty: false,
    reset: noop,
    setGasOption: noop,
    gasOption: undefined,
    validation: [true],
    validatingRecipient: false,
    recipientValidation: [true],
    isAvailableBalance: false,
    isGasSufficient: false,
    balance: '',
})
TipContext.displayName = 'TipContext'
