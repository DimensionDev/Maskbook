import { useRef, useContext, type JSX, type ReactNode } from 'react'
import { format as formatDateTime, fromUnixTime } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Link,
    Stack,
    useTheme,
} from '@mui/material'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'
import { TokenIcon, FormattedAddress, Image, WalletIcon, ElementAnchor } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useNetworkDescriptor, useFungibleToken, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatCurrency } from '@masknet/web3-shared-base'
import { resolveActivityTypeBackgroundColor } from '@masknet/web3-providers/helpers'
import { useNonFungibleTokenActivities } from '../../trending/useTrending.js'
import { TrendingViewContext } from './context.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<{ isPopper: boolean; themeMode?: 'dim' | 'dark' | 'light' }>()(
    (theme, { isPopper, themeMode }) => ({
        container: {
            maxHeight: isPopper ? 320 : 266,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        cell: {
            paddingLeft: theme.spacing(0.5),
            paddingRight: theme.spacing(0.5),
            background: themeMode === 'dim' && !isPopper ? '#15202b' : theme.palette.maskColor.bottom,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            border: 'none',
            '&:not(:first-child)': {
                textAlign: 'center',
            },
            '&:last-child': {
                textAlign: 'right',
            },
        },
        nftImage: {
            height: 20,
            width: 20,
            marginRight: 4,
            borderRadius: 4,
        },
        nftCell: {
            display: 'flex',
            alignItems: 'center',
        },
        cellWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        methodCellWrapper: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
        },
        methodCell: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 24,
            width: 62,
            borderRadius: 500,
            fontWeight: 400,
        },
        tokenIcon: {
            width: 16,
            height: 16,
            marginRight: 4,
        },
        imageLoading: {
            color: theme.palette.maskColor.main,
            height: '15px !important',
            width: '15px !important',
        },
        linkIcon: {
            color: theme.palette.text.primary,
        },
        transactionLink: {
            height: 16,
            marginLeft: 4,
        },
        placeholder: {
            paddingTop: theme.spacing(10),
            paddingBottom: theme.spacing(10),
            borderStyle: 'none',
        },
        loadMore: {
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            transform: 'translateY(-16px)',
        },
        loadMoreIcon: {
            marginBottom: 16,
        },
    }),
)

interface NonFungibleTickersTableProps {
    id: string
    chainId: Web3Helper.ChainIdAll
    result: Web3Helper.TokenResultAll
}

type Cells = 'nft' | 'method' | 'value' | 'from' | 'to' | 'time'

export function NonFungibleTickersTable({ id, chainId, result }: NonFungibleTickersTableProps) {
    const theme = useTheme()
    const containerRef = useRef(null)
    const themeMode = useSiteThemeMode(theme)
    const { isCollectionProjectPopper, isTokenTagPopper } = useContext(TrendingViewContext)
    const { classes } = useStyles({ isPopper: isCollectionProjectPopper || isTokenTagPopper, themeMode })
    const Utils = useWeb3Utils(result.pluginID)
    const { activities, fetchActivities, loadingActivities } = useNonFungibleTokenActivities(
        result.pluginID,
        id,
        chainId,
    )
    const headCellMap: Record<Cells, ReactNode> = {
        nft: <Trans>NFT</Trans>,
        method: <Trans>Method</Trans>,
        value: <Trans>Value</Trans>,
        from: <Trans>From</Trans>,
        to: <Trans>To</Trans>,
        time: <Trans>Time</Trans>,
    }

    const tickerRows: JSX.Element[] =
        activities?.map((x, index) => {
            const cellMap: Record<Cells, React.ReactNode> = {
                nft: (
                    <div className={classes.nftCell}>
                        <Image
                            fallback={<Icons.MaskAvatar size={20} />}
                            src={x.imageURL}
                            classes={{
                                container: classes.nftImage,
                                imageLoading: classes.imageLoading,
                            }}
                            className={classes.nftImage}
                        />
                        <Typography fontSize={12}>{Utils.formatTokenId(x.token_id || x.token_address, 3)}</Typography>
                    </div>
                ),
                method: (
                    <div className={classes.methodCellWrapper}>
                        <div
                            className={classes.methodCell}
                            style={{ backgroundColor: resolveActivityTypeBackgroundColor(x.event_type) }}>
                            <Typography fontSize={12}>{x.event_type}</Typography>
                        </div>
                    </div>
                ),
                value: <TransactionValue chainId={chainId} activity={x} result={result} />,
                from: (
                    <Typography fontSize={12}>
                        <FormattedAddress
                            address={x.send ?? x.from ?? x.source}
                            formatter={(address) =>
                                Utils.formatAddress(Utils.formatDomainName(address, 12), 3) ?? address
                            }
                        />
                    </Typography>
                ),
                to: (
                    <Typography fontSize={12}>
                        <FormattedAddress
                            address={x.receive ?? x.destination}
                            formatter={(address) =>
                                Utils.formatAddress(Utils.formatDomainName(address, 12), 3) ?? address
                            }
                        />
                    </Typography>
                ),
                time: (
                    <div className={classes.cellWrapper}>
                        <Typography fontSize={12}>
                            {formatDateTime(
                                fromUnixTime(Number.parseInt((x.timestamp / 1000).toFixed(0), 10)),
                                'yyyy-MM-dd HH:mm',
                            )}{' '}
                        </Typography>
                        <Link
                            href={x.transaction_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={classes.transactionLink}>
                            <Icons.LinkOut size={15} className={classes.linkIcon} />
                        </Link>
                    </div>
                ),
            }

            const cells = Object.entries(cellMap).map(([name, cell]) => (
                <TableCell key={name} className={classes.cell}>
                    {cell}
                </TableCell>
            ))
            return <TableRow key={index}>{cells}</TableRow>
        }) ?? []

    const headCells = Object.values(headCellMap)

    return (
        <TableContainer className={classes.container} ref={containerRef}>
            {activities.length === 0 && loadingActivities ?
                <Stack height={298} width={566} alignItems="center" justifyContent="center">
                    <LoadingBase />
                    <Typography fontSize="14px" mt={1.5}>
                        <Trans>Loading</Trans>
                    </Typography>
                </Stack>
            :   <>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {headCells.map((x, i) => (
                                    <TableCell className={classes.cell} key={i}>
                                        {x}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tickerRows.length ?
                                tickerRows
                            :   <TableRow>
                                    <TableCell
                                        className={classes.cell}
                                        colSpan={headCells.length}
                                        style={{ borderStyle: 'none' }}>
                                        <Typography
                                            className={classes.placeholder}
                                            align="center"
                                            color="textSecondary">
                                            <Trans>No Data</Trans>
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>

                    <Stack py={1} className={classes.loadMore}>
                        <ElementAnchor callback={fetchActivities}>
                            {activities.length > 0 && loadingActivities ?
                                <LoadingBase className={classes.loadMoreIcon} />
                            :   null}
                        </ElementAnchor>
                    </Stack>
                </>
            }
        </TableContainer>
    )
}

interface TransactionValueProps {
    result: Web3Helper.TokenResultAll
    chainId: Web3Helper.ChainIdAll
    activity: Web3Helper.NonFungibleTokenActivityAll
}

function TransactionValue({ result, chainId, activity }: TransactionValueProps) {
    const { classes } = useStyles({ isPopper: false })
    const chain = useNetworkDescriptor(result.pluginID, chainId)
    const { data: token } = useFungibleToken(result.pluginID, activity.trade_token?.address, activity.trade_token, {
        chainId: result.chainId,
    })

    return (
        <div className={classes.cellWrapper}>
            {result.pluginID === NetworkPluginID.PLUGIN_SOLANA ?
                <div className={classes.tokenIcon}>
                    <WalletIcon mainIcon={chain?.icon} size={16} />
                </div>
            : activity.trade_symbol?.toUpperCase() === 'WETH' ?
                // eslint-disable-next-line react/naming-convention/component-name
                <Icons.WETH size={16} className={classes.tokenIcon} />
            :   <TokenIcon
                    logoURL={token?.logoURL || activity.trade_token?.logoURL}
                    symbol={activity.trade_symbol}
                    address={activity.contract_address}
                    className={classes.tokenIcon}
                />
            }

            <Typography fontSize={12}>
                {formatCurrency((activity.trade_price ?? activity.fee ?? 0).toFixed(4), '')}
            </Typography>
        </div>
    )
}
