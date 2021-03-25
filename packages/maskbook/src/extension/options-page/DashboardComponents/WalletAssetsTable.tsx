import { createContext, useState } from 'react'
import {
    Box,
    Button,
    IconButton,
    makeStyles,
    Skeleton,
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
import { CurrencyType, AssetDetailed, ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import { getTokenUSDValue, isSameAddress } from '../../../web3/helpers'
import { TokenIcon } from './TokenIcon'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ActionsBarFT } from './ActionsBarFT'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useAssetsDetailed } from '../../../web3/hooks/useAssetsDetailed'
import { useTrustedERC20TokensFromDB } from '../../../plugins/Wallet/hooks/useERC20Tokens'
import { useStableTokensDebank } from '../../../web3/hooks/useStableTokensDebank'

const MAX_TOKENS_LENGTH = 5
const MIN_VALUE = 5

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: theme.spacing(0),
    },
    table: {},
    head: {
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.common.white : 'var(--drawerBody)',
    },
    cell: {
        paddingLeft: theme.spacing(2),
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
    symbol: {},
    memo: {
        fontSize: 11,
        verticalAlign: 'middle',
        color: theme.palette.text.secondary,
        marginLeft: theme.spacing(1),
    },
    price: {},
    more: {
        color: theme.palette.text.primary,
    },
    lessButton: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(1),
    },
}))

export const WalletAssetsTableContext = createContext<{
    detailedTokensRetry: () => void
}>(null!)

export interface WalletAssetsTableProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    wallet: WalletRecord
}

export function WalletAssetsTable(props: WalletAssetsTableProps) {
    const { t } = useI18N()
    const { wallet } = props

    const erc20Tokens = useTrustedERC20TokensFromDB()
    const {
        value: detailedTokens,
        error: detailedTokensError,
        loading: detailedTokensLoading,
        retry: detailedTokensRetry,
    } = useAssetsDetailed(erc20Tokens)
    const { value: stableTokens = [] } = useStableTokensDebank()

    const classes = useStylesExtends(useStyles(), props)
    const LABELS = [t('wallet_assets'), t('wallet_price'), t('wallet_balance'), t('wallet_value'), ''] as const

    const [viewLength, setViewLength] = useState(MAX_TOKENS_LENGTH)
    const [more, setMore] = useState(false)
    const [price, setPrice] = useState(MIN_VALUE)

    if (detailedTokensError)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}>
                <Typography color="textSecondary">No token found.</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => detailedTokensRetry()}>
                    Retry
                </Button>
            </Box>
        )

    if (!detailedTokens.length) return null

    const viewDetailed = (x: AssetDetailed) => (
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
                        logoURL={x.logoURL}
                    />
                    <Typography className={classes.name}>
                        <span className={classes.symbol}>{x.token.symbol}</span>
                        {x.chain !== 'eth' ? (
                            <span className={classes.memo}>{t('wallet_chain', { chain: x.chain.toUpperCase() })}</span>
                        ) : null}
                    </Typography>
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
                        ).toFixed(
                            stableTokens.some((y: ERC20TokenDetailed) => isSameAddress(y.address, x.token.address))
                                ? 2
                                : 6,
                        )}
                    </Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <Typography className={classes.price} color="textPrimary" component="span">
                        {formatCurrency(Number(getTokenUSDValue(x).toFixed(2)), '$')}
                    </Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <ActionsBarFT wallet={wallet} chain={x.chain} token={x.token} />
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
        <div className={classes.lessButton}>
            <IconButton
                onClick={() => {
                    setMore(!more)
                    setViewLength(more ? MAX_TOKENS_LENGTH : detailedTokens.length)
                    setPrice(more ? MIN_VALUE : 0)
                }}>
                {more ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
        </div>
    )

    return (
        <WalletAssetsTableContext.Provider value={{ detailedTokensRetry }}>
            <TableContainer className={classes.container}>
                <Table className={classes.table} component="table" size="medium" stickyHeader>
                    <TableHead className={classes.head}>
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
                        {detailedTokensLoading
                            ? new Array(3).fill(0).map((_, i) => (
                                  <TableRow className={classes.cell} key={i}>
                                      <TableCell>
                                          <Skeleton
                                              animation="wave"
                                              variant="rectangular"
                                              width="100%"
                                              height={30}></Skeleton>
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton
                                              animation="wave"
                                              variant="rectangular"
                                              width="100%"
                                              height={30}></Skeleton>
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton
                                              animation="wave"
                                              variant="rectangular"
                                              width="100%"
                                              height={30}></Skeleton>
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton
                                              animation="wave"
                                              variant="rectangular"
                                              width="100%"
                                              height={30}></Skeleton>
                                      </TableCell>
                                      <TableCell>
                                          <Skeleton
                                              animation="wave"
                                              variant="rectangular"
                                              width="100%"
                                              height={30}></Skeleton>
                                      </TableCell>
                                  </TableRow>
                              ))
                            : detailedTokens
                                  .filter((x) =>
                                      Number(price) !== 0
                                          ? new BigNumber(x.value?.[CurrencyType.USD] || '0').isGreaterThan(price) ||
                                            x.token.type === EthereumTokenType.Ether
                                          : true,
                                  )
                                  .map((y, idx) => (idx < viewLength ? viewDetailed(y) : null))}
                    </TableBody>
                </Table>
            </TableContainer>
            <LessButton />
        </WalletAssetsTableContext.Provider>
    )
}
