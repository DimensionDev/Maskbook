import React from 'react'
import type { Token } from '../../../../web3/types'
import { Box, createStyles, makeStyles, Theme, Typography } from '@material-ui/core'
import { TokenIcon } from '../../../../extension/options-page/DashboardComponents/TokenIcon'
import BigNumber from 'bignumber.js'
import { formatBalance } from '../../../Wallet/formatter'

export interface TokenPanelProps {
    token: Token
    amount: string
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1, 0),
        },
        icon: {
            width: 28,
            height: 28,
        },
        primary: {
            flex: '1',
            display: 'flex',
            alignItems: 'center',
        },
        amount: {
            fontSize: 18,
            marginLeft: theme.spacing(1),
        },
        symbol: {
            fontSize: 18,
        },
    }),
)

export function TokenPanel(props: TokenPanelProps) {
    const { amount, token } = props
    const classes = useStyles()

    return (
        <Box className={classes.root} display="flex" justifyContent="space-between" alignItems="center">
            <Typography className={classes.primary} component="div">
                <TokenIcon classes={{ icon: classes.icon }} address={token.address} name={token.name} />{' '}
                <span className={classes.amount}>{formatBalance(new BigNumber(amount), token.decimals)}</span>
            </Typography>
            <Typography className={classes.symbol}>{token.symbol}</Typography>
        </Box>
    )
}
