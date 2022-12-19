import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Link } from '@mui/material'
import { useRef } from 'react'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { TokenIcon, FormattedAddress } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useScrollBottomEvent } from '@masknet/shared-base-ui'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatCurrency } from '@masknet/web3-shared-base'
import formatDateTime from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import { resolveActivityTypeBackgroundColor } from '@masknet/web3-providers'
import { useNonFungibleTokenActivities } from '../../trending/useTrending.js'
import { useI18N } from '../../../../utils/index.js'
import { pick } from 'lodash-es'

const useStyles = makeStyles<{ isNFTProjectPopper: boolean }>()((theme, { isNFTProjectPopper }) => ({
    container: {
        maxHeight: isNFTProjectPopper ? 320 : 266,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    cell: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        backgroundColor: theme.palette.maskColor.bottom,
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
}))

export interface NonFungibleTickersTableProps {
    address: string
    chainId: Web3Helper.ChainIdAll
    isNFTProjectPopper?: boolean
}

type Cells = 'nft' | 'method' | 'value' | 'from' | 'to' | 'time'

export function NonFungibleTickersTable({
    address,
    chainId,
    isNFTProjectPopper = false,
}: NonFungibleTickersTableProps) {
    const { t } = useI18N()
    const { classes } = useStyles({ isNFTProjectPopper })
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const containerRef = useRef(null)

    const { activities, fetchMore } = useNonFungibleTokenActivities(address, chainId)
    useScrollBottomEvent(containerRef, fetchMore)
    const headCellMap: Record<Cells, string> = {
        nft: t('plugin_trader_table_nft'),
        method: t('plugin_trader_table_method'),
        value: t('plugin_trader_table_value'),
        from: t('plugin_trader_table_from'),
        to: t('plugin_trader_table_to'),
        time: t('plugin_trader_table_time'),
    }
    const columns: Cells[] = ['nft', 'method', 'value', 'from', 'to', 'time']

    const tickerRows: JSX.Element[] =
        activities?.map((x, index) => {
            const cellMap: Record<Cells, React.ReactNode> = {
                nft: (
                    <div className={classes.nftCell}>
                        <img src={x.cover} className={classes.nftImage} />
                        <Typography fontSize={12}>{Others?.formatTokenId(x.token_id, 4)}</Typography>
                    </div>
                ),
                method: (
                    <div className={classes.methodCellWrapper}>
                        <div
                            className={classes.methodCell}
                            style={{ backgroundColor: resolveActivityTypeBackgroundColor(x.transaction_method) }}>
                            <Typography fontSize={12}>{x.transaction_method}</Typography>
                        </div>
                    </div>
                ),
                value: (
                    <div className={classes.cellWrapper}>
                        <TokenIcon logoURL={x.tradeTokenLogo} address={x.contract} className={classes.tokenIcon} />
                        <Typography fontSize={12}>
                            {formatCurrency(x.tx_value, '', { boundaries: { min: 0.0001 } })}
                        </Typography>
                    </div>
                ),
                from: (
                    <Typography fontSize={12}>
                        <FormattedAddress
                            address={x.from_address}
                            formatter={(address) =>
                                Others?.formatAddress(Others?.formatDomainName(address, 12), 4) ?? address
                            }
                        />
                    </Typography>
                ),
                to: (
                    <Typography fontSize={12}>
                        <FormattedAddress
                            address={x.to_address}
                            formatter={(address) =>
                                Others?.formatAddress(Others?.formatDomainName(address, 12), 4) ?? address
                            }
                        />
                    </Typography>
                ),
                time: (
                    <div className={classes.cellWrapper}>
                        <Typography fontSize={12}>
                            {formatDateTime(fromUnixTime(x.transaction_time), 'yyyy-MM-dd HH:mm')}{' '}
                        </Typography>
                        <Link
                            href={x.transactionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={classes.transactionLink}>
                            <Icons.LinkOut size={15} className={classes.linkIcon} />
                        </Link>
                    </div>
                ),
            }

            const cells = Object.entries(pick(cellMap, columns)).map(([name, cell]) => (
                <TableCell key={name} className={classes.cell}>
                    {cell}
                </TableCell>
            ))
            return (
                <TableRow key={index} className={classes.tableContent}>
                    {cells}
                </TableRow>
            )
        }) ?? []

    const headCells = Object.values(pick(headCellMap, columns))

    return (
        <TableContainer className={classes.container} ref={containerRef}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {headCells.map((x) => (
                            <TableCell className={classes.cell} key={x}>
                                {x}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tickerRows.length ? (
                        tickerRows
                    ) : (
                        <TableRow>
                            <TableCell
                                className={classes.cell}
                                colSpan={columns.length}
                                style={{ borderStyle: 'none' }}>
                                <Typography className={classes.placeholder} align="center" color="textSecondary">
                                    {t('plugin_trader_no_data')}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
