import { createContext, Dispatch, SetStateAction } from 'react'
import { noop } from 'lodash-unified'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { UnconfirmedTransaction } from '@masknet/web3-shared-base'
import { Recipient, AssetType } from '../../types/index.js'

export interface ContextOptions {
    recipient: string
    setRecipient: Dispatch<SetStateAction<string>>

    recipientSnsId: string
    recipients: Recipient[]

    // the type of asset as tips
    assetType: AssetType
    setAssetType: Dispatch<SetStateAction<AssetType>>

    // fungible token asset
    fungibleToken: Web3Helper.FungibleTokenScope<'all'> | null
    setFungibleToken: Dispatch<SetStateAction<Web3Helper.FungibleTokenScope<'all'> | null>>

    // amount of tips
    amount: string
    setAmount: Dispatch<SetStateAction<string>>

    // transaction
    transaction?: UnconfirmedTransaction<Web3Helper.TransactionAll>

    // token id of non-fungible asset
    nonFungibleTokenId: string | null
    setNonFungibleTokenId: Dispatch<SetStateAction<string>>

    // contract address of non-fungible asset
    nonFungibleTokenAddress: string
    setNonFungibleTokenAddress: Dispatch<SetStateAction<string>>

    // extra tokens
    storedTokens: Array<Web3Helper.NonFungibleTokenScope<'all'>>

    nonFungibleToken: Web3Helper.NonFungibleTokenScope<'all'> | null
    nonFungibleTokenContract: Web3Helper.NonFungibleTokenContractScope<'all'> | null
    nonFungibleTokenOwnership: boolean

    // send transferring transaction
    loading: boolean
    transferCallback: () => Promise<string | undefined>
    resetCallback: () => void
}

export const TipsContext = createContext<ContextOptions>({
    recipient: '',
    setRecipient: noop,
    recipientSnsId: '',
    recipients: [],
    assetType: AssetType.NonFungibleToken,
    setAssetType: noop,
    fungibleToken: null,
    setFungibleToken: noop,
    amount: '',
    setAmount: noop,
    nonFungibleTokenId: null,
    setNonFungibleTokenId: noop,
    nonFungibleTokenAddress: '',
    setNonFungibleTokenAddress: noop,
    nonFungibleToken: null,
    nonFungibleTokenContract: null,
    nonFungibleTokenOwnership: false,
    transaction: undefined,
    loading: false,
    transferCallback: () => Promise.resolve(undefined),
    resetCallback: noop,
    storedTokens: [],
})
