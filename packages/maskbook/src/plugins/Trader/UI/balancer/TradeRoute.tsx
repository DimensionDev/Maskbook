import classNames from 'classnames'
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
    Button,
    ButtonBase,
    Chip,
} from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { TokenIcon } from '../../../../extension/options-page/DashboardComponents/TokenIcon'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { SwapResponse, TradeComputed, TradeProvider } from '../../types'
import { formatEthereumAddress, formatPercentage } from '../../../Wallet/formatter'
import { resolveTradePairLink } from '../../pipes'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../../utils/i18n-next-ui'

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
        head: {
            fontWeight: 300,
            color: theme.palette.text.secondary,
        },
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
            padding: theme.spacing(0.25, 0),
        },
        button: {
            display: 'flex',
            borderRadius: 500,
            padding: theme.spacing(0.25),
            '&:hover': {
                backgroundColor: theme.palette.background.default,
            },
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
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    if (!props.trade.trade_) return null

    return (
        <TableContainer className={classes.root} component={Paper} elevation={0} variant="outlined">
            <Table className={classes.table} size="small">
                <TableHead>
                    <TableRow>
                        <TableCell className={classNames(classes.cell, classes.head)}>
                            {t('plugin_trader_route')}
                        </TableCell>
                        <TableCell className={classNames(classes.cell, classes.head)} align="right">
                            {t('plugin_trader_portion')}
                        </TableCell>
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
                                            <div className={classes.button}>
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
                                                                <Box
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    key={token.address}>
                                                                    <TokenIcon address={token.address} />
                                                                </Box>
                                                            )
                                                        })}
                                                    </Link>
                                                </AvatarGroup>
                                            </div>
                                        )
                                    })}
                                </Breadcrumbs>
                            </TableCell>
                            <TableCell className={classes.cell} align="right">
                                {formatPercentage(new BigNumber(route.share))}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
