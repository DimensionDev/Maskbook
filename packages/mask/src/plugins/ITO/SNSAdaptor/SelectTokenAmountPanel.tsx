import { ERC20TokenListProps, usePickToken } from '@masknet/shared'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { TokenAmountPanel, TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'

export interface SelectTokenAmountPanelProps {
    amount: string
    balance: string
    token?: FungibleTokenDetailed
    disableNativeToken?: boolean
    disableSearchBar?: boolean
    onAmountChange: (amount: string) => void
    onTokenChange: (token: FungibleTokenDetailed) => void
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
    const pickToken = usePickToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await pickToken({
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
