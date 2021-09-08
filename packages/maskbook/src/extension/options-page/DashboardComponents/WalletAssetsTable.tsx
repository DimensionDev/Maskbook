import { useState } from 'react'
import {
    Box,
    Button,
    Chip,
    IconButton,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Asset, useTrustedERC20Tokens } from '@masknet/web3-shared'
import {
    CurrencyType,
    currySameAddress,
    EthereumTokenType,
    formatBalance,
    formatCurrency,
    getChainIdFromName,
    isGreaterThan,
    useAssets,
    useChainDetailed,
    useStableTokensDebank,
    Wallet,
} from '@masknet/web3-shared'
import { FormattedCurrency, TokenIcon, useStylesExtends } from '@masknet/shared'
import { useI18N, useMatchXS } from '../../../utils'
import { ActionsBarFT } from './ActionsBarFT'
import { getTokenUSDValue } from '../../../plugins/Wallet/helpers'

const useStyles = makeStyles<{ isMobile: boolean }>()((theme, { isMobile }) => ({
    container: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: theme.spacing(0),
    },
    head: {
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.common.white : 'var(--drawerBody)',
    },
    cell: {
        paddingLeft: isMobile ? theme.spacing(0.5) : theme.spacing(2),
        paddingRight: isMobile ? theme.spacing(0.5) : theme.spacing(1.5),
        fontSize: isMobile ? '0.8rem' : '0.875rem',
        whiteSpace: 'nowrap',
    },
    record: {
        display: 'flex',
    },
    coin: {
        width: isMobile ? 20 : 24,
        height: isMobile ? 20 : 24,
    },
    name: {
        marginLeft: theme.spacing(1),
        fontSize: isMobile ? '0.9rem' : '1rem',
    },
    chain: {
        marginLeft: theme.spacing(1),
    },
    price: {
        fontSize: isMobile ? '0.9rem' : '1rem',
    },
    more: {
        color: theme.palette.text.primary,
        fontSize: isMobile ? '0.9rem' : '1rem',
    },
    lessButton: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}))

//#region view detailed
interface ViewDetailedProps extends WalletAssetsTableProps {
    asset: Asset
}

function ViewDetailed(props: ViewDetailedProps) {
    const { wallet, asset } = props

    const isMobile = useMatchXS()
    const classes = useStylesExtends(useStyles({ isMobile }), props)

    const stableTokens = useStableTokensDebank()
    const chainDetailed = useChainDetailed()

    if (!chainDetailed) return null

    return (
        <TableRow className={classes.cell} key={asset.token.address}>
            {[
                <Box
                    sx={{
                        display: 'flex',
                    }}>
                    <TokenIcon
                        classes={{ icon: classes.coin }}
                        name={asset.token.name}
                        address={asset.token.address}
                        logoURI={asset.token.logoURI}
                        chainId={getChainIdFromName(asset.chain)}
                    />
                    <Typography className={classes.name}>{asset.token.symbol}</Typography>
                    {getChainIdFromName(asset.chain) !== chainDetailed.chainId ? (
                        <Chip className={classes.chain} label={asset.chain} size="small" />
                    ) : null}
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <Typography className={classes.price} color="textPrimary" component="span">
                        {asset.price?.[CurrencyType.USD]
                            ? formatCurrency(Number.parseFloat(asset.price[CurrencyType.USD]), '$')
                            : '-'}
                    </Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <Typography className={classes.name} color="textPrimary" component="span">
                        {new BigNumber(formatBalance(asset.balance, asset.token.decimals)).toFixed(
                            stableTokens.some(currySameAddress(asset.token.address)) ? 2 : 6,
                        )}
                    </Typography>
                </Box>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <Typography className={classes.price} color="textPrimary" component="span">
                        <FormattedCurrency value={getTokenUSDValue(asset).toFixed(2)} sign="$" />
                    </Typography>
                </Box>,
                ...(isMobile
                    ? []
                    : [
                          <Box
                              sx={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                              }}>
                              <ActionsBarFT chain={asset.chain} wallet={wallet} token={asset.token} />
                          </Box>,
                      ]),
            ]
                .filter(Boolean)
                .map((y, i) => (
                    <TableCell className={classes.cell} key={i}>
                        {y}
                    </TableCell>
                ))}
        </TableRow>
    )
}
//#endregion

//#region wallet asset table
const MIN_VALUE = 5

export interface WalletAssetsTableProps extends withClasses<'container'> {
    wallet: Wallet
}

export function WalletAssetsTable(props: WalletAssetsTableProps) {
    const { t } = useI18N()
    const { wallet } = props

    const isMobile = useMatchXS()
    const classes = useStylesExtends(useStyles({ isMobile }), props)
    const LABELS = [
        t('wallet_assets'),
        t('wallet_price'),
        t('wallet_balance'),
        t('wallet_value'),
        ...(isMobile ? [] : ['']),
    ] as const

    const erc20Tokens = useTrustedERC20Tokens()
    const {
        value: detailedTokens,
        error: detailedTokensError,
        loading: detailedTokensLoading,
        retry: detailedTokensRetry,
    } = useAssets(erc20Tokens)

    const [more, setMore] = useState(false)

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

    const viewDetailedTokens = detailedTokens.filter(
        (x) =>
            isGreaterThan(x.value?.[CurrencyType.USD] || '0', MIN_VALUE) || x.token.type === EthereumTokenType.Native,
    )

    return (
        <>
            <TableContainer className={classes.container}>
                <Table component="table" size="medium" stickyHeader>
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
                            ? Array.from({ length: 3 })
                                  .fill(0)
                                  .map((_, i) => (
                                      <TableRow className={classes.cell} key={i}>
                                          <TableCell>
                                              <Skeleton
                                                  animation="wave"
                                                  variant="rectangular"
                                                  width="100%"
                                                  height={30}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              <Skeleton
                                                  animation="wave"
                                                  variant="rectangular"
                                                  width="100%"
                                                  height={30}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              <Skeleton
                                                  animation="wave"
                                                  variant="rectangular"
                                                  width="100%"
                                                  height={30}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              <Skeleton
                                                  animation="wave"
                                                  variant="rectangular"
                                                  width="100%"
                                                  height={30}
                                              />
                                          </TableCell>
                                          <TableCell>
                                              <Skeleton
                                                  animation="wave"
                                                  variant="rectangular"
                                                  width="100%"
                                                  height={30}
                                              />
                                          </TableCell>
                                      </TableRow>
                                  ))
                            : (more ? detailedTokens : viewDetailedTokens).map((y, idx) => (
                                  <ViewDetailed key={idx} asset={y} wallet={wallet} />
                              ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {viewDetailedTokens.length < detailedTokens.length ? (
                <div className={classes.lessButton}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setMore(!more)
                        }}>
                        {more ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </div>
            ) : null}
        </>
    )
}
//#endregion
