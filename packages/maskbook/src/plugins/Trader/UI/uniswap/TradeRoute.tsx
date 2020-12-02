import { Box, Breadcrumbs, Typography, makeStyles, createStyles, Paper } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { TokenIcon } from '../../../../extension/options-page/DashboardComponents/TokenIcon'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import type { TradeComputed } from '../../types'
import { formatEthereumAddress } from '../../../Wallet/formatter'

const useStyles = makeStyles((theme) =>
    createStyles({
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
    }),
)

export interface TradeRouteProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
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
                {path.map((token) => (
                    <Box
                        key={token.address}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}>
                        <TokenIcon address={token.address} name={token.name} />
                        <Typography className={classes.name}>
                            {token.symbol ?? token.name ?? formatEthereumAddress(token.address, 2)}
                        </Typography>
                    </Box>
                ))}
            </Breadcrumbs>
        </Paper>
    )
}
