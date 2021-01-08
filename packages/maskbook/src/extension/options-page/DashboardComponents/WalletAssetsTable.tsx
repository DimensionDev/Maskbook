import {
    Box,
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

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: theme.spacing(0, 3),
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
}))

export interface WalletAssetsTableProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    wallet: WalletRecord
    detailedTokens: AssetDetailed[]
}

export function WalletAssetsTable(props: WalletAssetsTableProps) {
    const { t } = useI18N()
    const { wallet, detailedTokens } = props

    const classes = useStylesExtends(useStyles(), props)
    const LABELS = [t('wallet_assets'), t('wallet_price'), t('wallet_balance'), t('wallet_value'), ''] as const

    const chainIdValid = useChainIdValid()
    if (!chainIdValid) return null
    if (!detailedTokens.length) return null

    return (
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
                    {detailedTokens.map((x) => (
                        <TableRow className={classes.cell} key={x.token.address}>
                            {[
                                <Box
                                    sx={{
                                        display: 'flex',
                                    }}>
                                    <TokenIcon
                                        classes={{ icon: classes.coin }}
                                        name={x.token.name}
                                        address={x.token.address}
                                    />
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
                                        {formatBalance(
                                            new BigNumber(x.balance),
                                            x.token.decimals ?? 0,
                                            x.token.decimals ?? 0,
                                        )}
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
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
