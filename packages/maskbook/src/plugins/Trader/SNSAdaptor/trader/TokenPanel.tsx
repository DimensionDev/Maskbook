import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { formatBalance } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'

export interface TokenPanelProps {
    amount: string
    token: FungibleTokenDetailed
}

const useStyles = makeStyles()((theme) => ({
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
}))

export function TokenPanel(props: TokenPanelProps) {
    const { amount, token } = props

    const { classes } = useStyles()
    return (
        <Box
            className={classes.root}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
            <Typography className={classes.primary} component="div">
                <TokenIcon
                    classes={{ icon: classes.icon }}
                    address={token.address}
                    name={token.name}
                    logoURI={token.logoURI}
                />
                <span className={classes.amount}>{formatBalance(amount, token.decimals)}</span>
            </Typography>
            <Typography className={classes.symbol}>{token.symbol}</Typography>
        </Box>
    )
}
