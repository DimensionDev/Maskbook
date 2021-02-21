import classNames from 'classnames'
import {
    Breadcrumbs,
    makeStyles,
    createStyles,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import type { SwapResponse, TradeComputed } from '../../types'
import { formatPercentage } from '../../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { TradeRouteHop } from './TradeRouteHop'

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

export interface TradeRouteProps extends withClasses<'root'> {
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
                        <TableRow key={i}>
                            <TableCell className={classes.cell} align="left">
                                <Breadcrumbs
                                    classes={{ ol: classes.list, li: classes.item }}
                                    separator={<NavigateNextIcon fontSize="small" />}>
                                    {route.hops.map((hop) => (
                                        <TradeRouteHop key={hop.pool.address} hop={hop} />
                                    ))}
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
