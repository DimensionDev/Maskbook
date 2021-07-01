import { AvatarGroup, Box, Breadcrumbs, makeStyles, Paper, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import type { TradeComputed } from '../../types'
import { formatEthereumAddress } from '@masknet/web3-shared'
import { TokenIcon } from '@masknet/shared'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        boxSizing: 'border-box',
        padding: theme.spacing(1.5, 2),
        margin: theme.spacing(0, 'auto', 2),
    },
    list: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        display: 'flex',
        padding: theme.spacing(0.5, 0),
    },
    name: {
        fontSize: 12,
        marginLeft: theme.spacing(1),
    },
}))

export interface TradeRouteProps extends withClasses<never> {
    trade: TradeComputed
}

export function TradeRoute(props: TradeRouteProps) {
    const classes = useStylesExtends(useStyles(), props)

    const { path } = props.trade
    if (!path || path.length <= 2) return null

    return (
        <Paper className={classes.root} variant="outlined">
            <Breadcrumbs
                classes={{ ol: classes.list, li: classes.item }}
                separator={<NavigateNextIcon fontSize="small" />}>
                {path.map((tokens, i) => (
                    <AvatarGroup
                        key={i}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                        max={8}>
                        {tokens.map((token) => {
                            return (
                                <Box display="flex" alignItems="center" key={token.address}>
                                    <TokenIcon address={token.address} name={token.name} />
                                    {tokens.length === 1 ? (
                                        <Typography className={classes.name}>
                                            {token.symbol ?? token.name ?? formatEthereumAddress(token.address, 2)}
                                        </Typography>
                                    ) : null}
                                </Box>
                            )
                        })}
                    </AvatarGroup>
                ))}
            </Breadcrumbs>
        </Paper>
    )
}
