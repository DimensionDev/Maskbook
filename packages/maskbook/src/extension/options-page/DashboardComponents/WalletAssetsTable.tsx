import {
    Box,
    IconButton,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Typography,
} from '@material-ui/core'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { formatBalance, formatCurrency } from '../../../plugins/Wallet/formatter'
import { useI18N } from '../../../utils/i18n-next-ui'
import { CurrencyType, AssetDetailed } from '../../../web3/types'
import { getTokenUSDValue } from '../../../web3/helpers'
import { TokenIcon } from './TokenIcon'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ERC20TokenActionsBar } from './ERC20TokenActionsBar'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { useContext, useState } from 'react'
import { DashboardWalletsContext } from '../DashboardRouters/Wallets'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: theme.spacing(0, 2),
    },
    table: {},
    head: {},
    cell: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1.5),
        whiteSpace: 'nowrap',
    },
    record: {
        display: 'flex',
    },
    coin: {
        width: 24,
        height: 24,
    },
    name: {
        marginLeft: theme.spacing(1),
    },
    symbol: {
        marginLeft: theme.spacing(1),
    },
    price: {},
    more: {
        color: theme.palette.text.primary,
    },
    lessButton: {
        display: 'flex',
        justifyContent: 'center',
    },
}))

export interface WalletAssetsTableProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    wallet: WalletRecord
}

export function WalletAssetsTable(props: WalletAssetsTableProps) {
    const { t } = useI18N()
    const { wallet } = props
    const { detailedTokens, stableCoinTokens } = useContext(DashboardWalletsContext)

    const classes = useStylesExtends(useStyles(), props)
    const LABELS = [t('wallet_assets'), t('wallet_price'), t('wallet_balance'), t('wallet_value'), ''] as const

    const [viewLength, setViewLength] = useState(5)
    const [more, setMore] = useState(false)
    const [price, setPrice] = useState(5)

    const chainIdValid = useChainIdValid()
    if (!chainIdValid) return null
    if (!detailedTokens.length) return null

    const sort = (a: AssetDetailed, b: AssetDetailed): number =>
        new BigNumber(b.value?.[CurrencyType.USD] ?? 0).minus(a.value?.[CurrencyType.USD] ?? 0).toNumber()

    const viewDetailed = (x: AssetDetailed) => (
        <TableRow className={classes.cell} key={x.token.address}>
            {[
                <Box
                    sx={{
                        display: 'flex',
                    }}>
                    <TokenIcon classes={{ icon: classes.coin }} name={x.token.name} address={x.token.address} />
                    <Typography className={classes.name}>{x.token.name}</Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <Typography className={classes.price} color="textPrimary" component="span">
                        {x.price?.[CurrencyType.USD]
                            ? formatCurrency(Number.parseFloat(x.price[CurrencyType.USD]), '$')
                            : '-'}
                    </Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <Typography className={classes.name} color="textPrimary" component="span">
                        {new BigNumber(
                            formatBalance(new BigNumber(x.balance), x.token.decimals ?? 0, x.token.decimals ?? 0),
                        ).toFixed(stableCoinTokens.some((y) => y.address === x.token.address) ? 2 : 6)}
                    </Typography>
                    <Typography className={classes.symbol} color="textSecondary" component="span">
                        {x.token.symbol}
                    </Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <Typography className={classes.price} color="textPrimary" component="span">
                        {formatCurrency(getTokenUSDValue(x), '$')}
                    </Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <ERC20TokenActionsBar wallet={wallet} token={x.token} />
                </Box>,
            ]
                .filter(Boolean)
                .map((y, i) => (
                    <TableCell className={classes.cell} key={i}>
                        {y}
                    </TableCell>
                ))}
        </TableRow>
    )

    const LessButton = () => (
        <div
            className={classes.lessButton}
            onClick={() => {
                setMore(!more)
                setViewLength(more ? 5 : detailedTokens.length)
                setPrice(more ? 5 : 0)
            }}>
            <IconButton>{more ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </div>
    )

    const filter = (a: AssetDetailed) =>
        Number(price) !== 0 ? new BigNumber(a.value?.[CurrencyType.USD] || '0').isGreaterThan(price) : true

    return (
        <>
            <TableContainer className={classes.container}>
                <Table className={classes.table} component="table" size="medium" stickyHeader>
                    <TableHead>
                        <TableRow>
                            {LABELS.map((x, i) => (
                                <TableCell
                                    className={classNames(classes.head, classes.cell)}
                                    key={i}
                                    align={i === 0 ? 'left' : 'right'}>
                                    {x}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detailedTokens
                            .sort(sort)
                            .filter(filter)
                            .map((x, idx) => (idx < viewLength ? viewDetailed(x) : null))}
                    </TableBody>
                </Table>
            </TableContainer>
            <LessButton />
        </>
    )
}
