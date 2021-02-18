import {
    Box,
    Breadcrumbs,
    Typography,
    makeStyles,
    createStyles,
    Paper,
    AvatarGroup,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Link,
} from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { TokenIcon } from '../../../../extension/options-page/DashboardComponents/TokenIcon'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { SwapResponse, TradeComputed, TradeProvider } from '../../types'
import { formatEthereumAddress } from '../../../Wallet/formatter'
import { resolveTradePairLink } from '../../pipes'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            width: '100%',
            boxSizing: 'border-box',
            padding: theme.spacing(1.5, 2),
            margin: theme.spacing(0, 'auto', 2),
        },
        table: {},
        cell: {
            border: 'none',
            padding: 0,
        },
        list: {
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
        item: {
            display: 'flex',
            padding: theme.spacing(0.5, 0),
        },
        link: {
            display: 'flex',
            alignItems: 'center',
        },
        name: {
            fontSize: 12,
            marginLeft: theme.spacing(1),
        },
    }),
)

export interface TradeRouteProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    trade: TradeComputed<SwapResponse>
}

export function TradeRoute(props: TradeRouteProps) {
    const classes = useStylesExtends(useStyles(), props)

    console.log('DEBUG: trade route')
    console.log({
        trade: props.trade,
    })

    if (!props.trade.trade_) return null

    return (
        <TableContainer className={classes.root} component={Paper} elevation={0} variant="outlined">
            <Table className={classes.table} size="small">
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.cell}>Route</TableCell>
                        <TableCell className={classes.cell}>Portion</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.trade.trade_.routes.map((route, i) => (
                        <TableRow>
                            <TableCell className={classes.cell} align="left" key={i}>
                                <Breadcrumbs
                                    classes={{ ol: classes.list, li: classes.item }}
                                    separator={<NavigateNextIcon fontSize="small" />}>
                                    {route.hops.map((hop) => {
                                        return (
                                            <AvatarGroup
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                }}
                                                max={8}>
                                                <Link
                                                    className={classes.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={resolveTradePairLink(
                                                        TradeProvider.BALANCER,
                                                        hop.pool.address,
                                                    )}
                                                    key={hop.pool.address}>
                                                    {hop.pool.tokens.map((token) => {
                                                        return (
                                                            <Box display="flex" alignItems="center" key={token.address}>
                                                                <TokenIcon address={token.address} />
                                                            </Box>
                                                        )
                                                    })}
                                                </Link>
                                            </AvatarGroup>
                                        )
                                    })}
                                </Breadcrumbs>
                            </TableCell>
                            <TableCell className={classes.cell}>{`${route.share * 100}%`}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )

    // return (
    //     <Paper className={classes.root} variant="outlined">
    //         <Breadcrumbs
    //             classes={{ ol: classes.list, li: classes.item }}
    //             separator={<NavigateNextIcon fontSize="small" />}>
    //             {path.map((tokens, i) => (
    //                 <AvatarGroup
    //                     key={i}
    //                     sx={{
    //                         display: 'inline-flex',
    //                         alignItems: 'center',
    //                     }}
    //                     max={8}>
    //                     {tokens.map((token) => {
    //                         return (
    //                             <Box display="flex" alignItems="center" key={token.address}>
    //                                 <TokenIcon address={token.address} name={token.name} />
    //                                 {tokens.length === 1 ? (
    //                                     <Typography className={classes.name}>
    //                                         {token.symbol ?? token.name ?? formatEthereumAddress(token.address, 2)}
    //                                     </Typography>
    //                                 ) : null}
    //                             </Box>
    //                         )
    //                     })}
    //                 </AvatarGroup>
    //             ))}
    //         </Breadcrumbs>
    //     </Paper>
    // )
}
