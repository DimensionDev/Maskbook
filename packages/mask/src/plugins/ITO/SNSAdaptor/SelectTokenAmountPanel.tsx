import { useCallback } from 'react'
import type { MaskFixedSizeListProps, MaskTextFieldProps } from '@masknet/theme'
import { useSelectFungibleToken } from '@masknet/shared'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TokenAmountPanel, TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'

interface ERC20TokenListProps extends withClasses<'list' | 'placeholder'> {
    targetChainId?: ChainId
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Array<FungibleToken<ChainId, SchemaType>>
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: FungibleToken<ChainId, SchemaType> | null): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
}

export interface SelectTokenAmountPanelProps {
    amount: string
    balance: string
    token?: FungibleToken<ChainId, SchemaType>
    disableNativeToken?: boolean
    disableSearchBar?: boolean
    onAmountChange: (amount: string) => void
    onTokenChange: (token: FungibleToken<ChainId, SchemaType>) => void
    FungibleTokenListProps?: Partial<ERC20TokenListProps>
    TokenAmountPanelProps?: Partial<TokenAmountPanelProps>
}

export function SelectTokenAmountPanel(props: SelectTokenAmountPanelProps) {
    const {
        amount,
        balance,
        token,
        disableNativeToken = false,
        disableSearchBar = false,
        onAmountChange,
        onTokenChange,
        FungibleTokenListProps,
        TokenAmountPanelProps,
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
        <TokenAmountPanel
            amount={amount}
            balance={balance}
            token={token}
            label="Amount"
            onAmountChange={onAmountChange}
            {...TokenAmountPanelProps}
            SelectTokenChip={{
                ...TokenAmountPanelProps?.SelectTokenChip,
                ChipProps: {
                    ...TokenAmountPanelProps?.SelectTokenChip?.ChipProps,
                    onClick: onSelectTokenChipClick,
                },
            }}
        />
    )
}
