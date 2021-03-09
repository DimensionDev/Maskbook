import {
    Box,
    Button,
    IconButton,
    createStyles,
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
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { CurrencyType, AssetDetailed, ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import { getTokenUSDValue, isSameAddress } from '../../../web3/helpers'
import { TokenIcon } from './TokenIcon'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ERC20TokenActionsBar, TokenActionsMenu } from './TokenActionsBar'
import { useContext, useState } from 'react'
import { DashboardWalletsContext } from '../DashboardRouters/Wallets'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletTransferDialog } from './TransferDialog'
import { DashboardWalletHideTokenConfirmDialog } from '../DashboardDialogs/Wallet'
import { useMenu } from '../../../utils/hooks/useMenu'

const MAX_TOKENS_LENGTH = 5
const MIN_VALUE = 5

const useStyles = makeStyles((theme: Theme) =>
    createStyles<string, { isMobile: boolean }>({
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
            paddingLeft: ({ isMobile }) => (isMobile ? theme.spacing(0.5) : theme.spacing(2)),
            paddingRight: ({ isMobile }) => (isMobile ? theme.spacing(0.5) : theme.spacing(1.5)),
            fontSize: ({ isMobile }) => (isMobile ? '0.8rem' : '0.875rem'),
            whiteSpace: 'nowrap',
        },
        record: {
            display: 'flex',
        },
        coin: {
            width: ({ isMobile }) => (isMobile ? 20 : 24),
            height: ({ isMobile }) => (isMobile ? 20 : 24),
        },
        name: {
            marginLeft: theme.spacing(1),
            fontSize: ({ isMobile }) => (isMobile ? '0.9rem' : '1rem'),
        },
        price: {
            fontSize: ({ isMobile }) => (isMobile ? '0.9rem' : '1rem'),
        },
        more: {
            color: theme.palette.text.primary,
            fontSize: ({ isMobile }) => (isMobile ? '0.9rem' : '1rem'),
        },
        lessButton: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(1),
        },
        menuAnchorElRef: {},
    }),
)

export interface WalletAssetsTableProps extends withClasses<never> {
    wallet: WalletRecord
}

interface ViewDetailedProps extends WalletAssetsTableProps {
    isMobile: boolean
    stableTokens: ERC20TokenDetailed[]
    x: AssetDetailed
}

function ViewDetailed(props: ViewDetailedProps) {
    const { wallet, isMobile, stableTokens, x } = props
    const [transeferDialog, , openTransferDialog] = useModal(DashboardWalletTransferDialog)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const classes = useStylesExtends(useStyles({ isMobile }), props)
    const [menu, openMenu] = useMenu(
        <>
            <TokenActionsMenu
                chain={x.chain}
                wallet={wallet}
                token={x.token}
                onTransferDialogOpen={openTransferDialog}
                onHideTokenConfirmDialogOpen={openHideTokenConfirmDialog}
            />
        </>,
        true,
    )

    return (
        <>
            <TableRow className={classes.cell} key={x.token.address} onClick={isMobile ? openMenu : () => undefined}>
                {[
                    <Box
                        sx={{
                            display: 'flex',
                        }}>
                        <TokenIcon classes={{ icon: classes.coin }} name={x.token.name} address={x.token.address} />
                        <Typography className={classes.name}>{x.token.symbol}</Typography>
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
                    ...(isMobile
                        ? []
                        : [
                              <Box
                                  sx={{
                                      display: 'flex',
                                      justifyContent: 'flex-end',
                                  }}>
                                  <ERC20TokenActionsBar chain={x.chain} wallet={wallet} token={x.token} />
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
            <div className={classes.menuAnchorElRef}></div>
            {menu}
            {hideTokenConfirmDialog}
            {transeferDialog}
        </>
    )
}

interface LessButtonProps extends withClasses<never> {
    isMobile: boolean
    setViewLength: React.Dispatch<React.SetStateAction<number>>
    setPrice: React.Dispatch<React.SetStateAction<number>>
    detailedTokens: AssetDetailed[]
}

function LessButton(props: LessButtonProps) {
    const { isMobile, setViewLength, setPrice, detailedTokens } = props
    const classes = useStylesExtends(useStyles({ isMobile }), props)
    const [more, setMore] = useState(false)

    return (
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
}

export function WalletAssetsTable(props: WalletAssetsTableProps) {
    const { t } = useI18N()
    const { wallet } = props
    const {
        detailedTokens,
        detailedTokensLoading,
        detailedTokensError,
        detailedTokensRetry,
        stableTokens,
    } = useContext(DashboardWalletsContext)
    const isMobile = useMatchXS()
    const classes = useStylesExtends(useStyles({ isMobile }), props)
    const LABELS = [
        t('wallet_assets'),
        t('wallet_price'),
        t('wallet_balance'),
        t('wallet_value'),
        ...(isMobile ? [] : ['']),
    ] as const

    const [viewLength, setViewLength] = useState(MAX_TOKENS_LENGTH)
    const [price, setPrice] = useState(MIN_VALUE)

    if (detailedTokensLoading) return null

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

    return (
        <>
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
                        {detailedTokens
                            .filter((x) =>
                                Number(price) !== 0
                                    ? new BigNumber(x.value?.[CurrencyType.USD] || '0').isGreaterThan(price) ||
                                      x.token.type === EthereumTokenType.Ether
                                    : true,
                            )
                            .map((y, idx) =>
                                idx < viewLength ? (
                                    <ViewDetailed
                                        key={idx}
                                        x={y}
                                        isMobile={isMobile}
                                        stableTokens={stableTokens}
                                        wallet={wallet}
                                    />
                                ) : null,
                            )}
                    </TableBody>
                </Table>
            </TableContainer>
            <LessButton
                isMobile={isMobile}
                setViewLength={setViewLength}
                setPrice={setPrice}
                detailedTokens={detailedTokens}
            />
        </>
    )
}
