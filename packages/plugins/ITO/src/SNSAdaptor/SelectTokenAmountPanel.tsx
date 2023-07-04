import { useCallback } from 'react'
import type { MaskFixedSizeListProps, MaskTextFieldProps } from '@masknet/theme'
import { FungibleTokenInput, SelectFungibleTokenModal, type FungibleTokenInputProps } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../locales/index.js'

interface ERC20TokenListProps extends withClasses<'list' | 'placeholder'> {
    targetChainId?: Web3Helper.ChainIdAll
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Web3Helper.FungibleTokenAll[]
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: Web3Helper.FungibleTokenAll | null): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
}

export interface SelectTokenAmountPanelProps {
    amount: string
    balance: string
    token?: Web3Helper.FungibleTokenAll
    disableNativeToken?: boolean
    disableSearchBar?: boolean
    onAmountChange: (amount: string) => void
    onTokenChange: (token: Web3Helper.FungibleTokenAll) => void
    FungibleTokenListProps?: Partial<ERC20TokenListProps>
    FungibleTokenInputProps?: Partial<FungibleTokenInputProps>
}

export function SelectTokenAmountPanel(props: SelectTokenAmountPanelProps) {
    const t = useI18N()
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
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken,
            disableSearchBar,
            pluginID: NetworkPluginID.PLUGIN_EVM,
            ...FungibleTokenListProps,
        })
        if (!picked) return
        onTokenChange(picked)
    }, [disableNativeToken, disableSearchBar, FungibleTokenListProps])
    // #endregion

    return (
        <FungibleTokenInput
            amount={amount}
            balance={balance}
            token={token}
            label={t.amount()}
            onAmountChange={onAmountChange}
            {...FungibleTokenInputProps}
            onSelectToken={onSelectTokenChipClick}
        />
    )
}
