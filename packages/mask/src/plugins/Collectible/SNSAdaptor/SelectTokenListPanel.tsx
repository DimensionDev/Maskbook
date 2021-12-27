import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ERC20TokenListProps, TokenAmountPanel, TokenAmountPanelProps } from '@masknet/shared'
import { ListItemIcon, MenuItem, Typography } from '@mui/material'
import { useMenu } from '../../../utils'
import { useEffect, useState } from 'react'
import { noop } from 'lodash-unified'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

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

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 24,
        height: 24,
    },
}))
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

    const { classes } = useStyles()

    const [haveMenu, setHaveMenu] = useState(true)

    useEffect(() => {
        if (!FungibleTokenListProps?.tokens || FungibleTokenListProps.tokens.length === 0) setHaveMenu(false)
    }, [FungibleTokenListProps, token])

    const [menu, openMenu] = useMenu(
        FungibleTokenListProps?.tokens?.map((x, i) => {
            return (
                <MenuItem
                    key={i}
                    onClick={() => {
                        onTokenChange(x)
                    }}>
                    <ListItemIcon>
                        <TokenIcon
                            classes={{ icon: classes.icon }}
                            address={x.address}
                            name={x.name}
                            logoURI={x.logoURI}
                        />
                    </ListItemIcon>
                    <Typography variant="inherit">{x.name}</Typography>
                </MenuItem>
            )
        }) ?? [],
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
