import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ERC20TokenListProps, TokenAmountPanel, TokenAmountPanelProps } from '@masknet/shared'
import { ListItemIcon, MenuItem, Typography } from '@mui/material'
import { useMenu } from '../../../utils'
import { useEffect, useState } from 'react'
import { noop } from 'lodash-unified'

export interface SelectTokenPanelProps {
    amount: string
    balance: string
    token?: FungibleTokenDetailed
    disableNativeToken?: boolean
    onAmountChange: (amount: string) => void
    onTokenChange: (token: FungibleTokenDetailed) => void
    FungibleTokenListProps?: Partial<ERC20TokenListProps>
    TokenAmountPanelProps?: Partial<TokenAmountPanelProps>
}

export function SelectTokenListPanel(props: SelectTokenPanelProps) {
    const {
        amount,
        balance,
        token,
        disableNativeToken = false,
        onAmountChange,
        onTokenChange,
        FungibleTokenListProps,
        TokenAmountPanelProps,
    } = props

    const [haveMenu, setHaveMenu] = useState(true)

    useEffect(() => {
        if (!FungibleTokenListProps?.tokens || FungibleTokenListProps.tokens.length === 0) setHaveMenu(false)
        if (token?.symbol === 'WETH') setHaveMenu(false)
    }, [FungibleTokenListProps, token])

    const [menu, openMenu] = useMenu(
        FungibleTokenListProps?.tokens?.map((x, i) => (
            <MenuItem
                key={i}
                onClick={() => {
                    onTokenChange(x)
                }}>
                <ListItemIcon>{x.logoURI}</ListItemIcon>
                <Typography variant="inherit">{x.name}</Typography>
            </MenuItem>
        )) ?? [],
        false,
        {
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
            },
        },
    )

    return (
        <>
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
                        onClick: !haveMenu ? noop : openMenu,
                    },
                    readonly: !haveMenu,
                }}
            />
            {menu}
        </>
    )
}
