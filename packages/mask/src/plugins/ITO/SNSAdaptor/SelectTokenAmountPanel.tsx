import { useCallback } from 'react'
import type { MaskFixedSizeListProps, MaskTextFieldProps } from '@masknet/theme'
import { useSelectFungibleToken, FungibleTokenInput, FungibleTokenInputProps } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../../../utils/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'

interface ERC20TokenListProps extends withClasses<'list' | 'placeholder'> {
    targetChainId?: Web3Helper.ChainIdAll
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Array<Web3Helper.FungibleTokenScope<'all'>>
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: Web3Helper.FungibleTokenScope<'all'> | null): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
}

export interface SelectTokenAmountPanelProps {
    amount: string
    balance: string
    token?: Web3Helper.FungibleTokenScope<'all'>
    disableNativeToken?: boolean
    disableSearchBar?: boolean
    onAmountChange: (amount: string) => void
    onTokenChange: (token: Web3Helper.FungibleTokenScope<'all'>) => void
    FungibleTokenListProps?: Partial<ERC20TokenListProps>
    FungibleTokenInputProps?: Partial<FungibleTokenInputProps>
}

export function SelectTokenAmountPanel(props: SelectTokenAmountPanelProps) {
    const { t } = useI18N()
    const {
        amount,
        balance,
        token,
        disableNativeToken = false,
        disableSearchBar = false,
        onAmountChange,
        onTokenChange,
        FungibleTokenListProps,
        FungibleTokenInputProps,
    } = props

    // #region select token
    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            disableNativeToken,
            disableSearchBar,
            ...FungibleTokenListProps,
        })
        if (picked) onTokenChange(picked)
    }, [disableNativeToken, disableSearchBar, FungibleTokenListProps])
    // #endregion

    return (
        <FungibleTokenInput
            amount={amount}
            balance={balance}
            token={token}
            label={t('amount')}
            onAmountChange={onAmountChange}
            {...FungibleTokenInputProps}
            onSelectToken={onSelectTokenChipClick}
        />
    )
}
