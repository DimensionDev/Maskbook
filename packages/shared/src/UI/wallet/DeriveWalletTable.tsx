import { memo } from 'react'
import { range } from 'lodash-es'
import {
    Table,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    TableBody,
    Skeleton,
    CircularProgress,
    Checkbox,
    useTheme,
    checkboxClasses,
} from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { CopyButton, FormattedAddress, FormattedBalance } from '@masknet/shared'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { formatBalance } from '@masknet/web3-shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { useBalance } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    header: {
        backgroundColor: theme.palette.maskColor.publicBg,
        padding: '14px 0',
        borderBottom: 'none',
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
        marginLeft: 6,
        marginRight: 8,
        color: theme.palette.maskColor.main,
    },
    second: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
    third: {
        fontSize: 12,
        color: theme.palette.maskColor.third,
    },
    symbol: {
        marginLeft: 8,
    },
    icons: {
        display: 'flex',
        alignItems: 'center',
        transform: 'translateY(-2px)',
    },
    icon: {
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
    },
    link: {
        color: theme.palette.maskColor.second,
        marginLeft: 8,
        cursor: 'pointer',
    },
    cell: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: 'none',
        flex: '1 0 0',
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
    },
    tableRow: {
        display: 'flex',
        padding: '0px 8px',
        alignCenter: 'center',
        gap: 12,
        alignSelf: 'stretch',
        flex: '1 0 0',
    },
    tableRowWithHoverEffect: {
        '&:hover': {
            borderRadius: 8,
            background: theme.palette.maskColor.bg,
        },
    },
    colorPrimary: {
        color: theme.palette.maskColor.main,
    },
}))

interface DeriveWalletTableProps {
    loading: boolean
    dataSource: Array<{
        address: string
        added: boolean
        selected: boolean
        pathIndex: number
    }>
    onCheck: (checked: boolean, index: number) => void
    symbol: string
    hiddenHeader?: boolean
}

export const DeriveWalletTable = memo<DeriveWalletTableProps>(function DeriveWalletTable({
    loading,
    dataSource,
    onCheck,
    symbol,
    hiddenHeader,
}) {
    const { classes } = useStyles()
    return (
        <Table size="small" padding="none" stickyHeader>
            {hiddenHeader ? null : (
                <TableHead>
                    <TableRow>
                        <TableCell key="address" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>
                                <Trans>Address</Trans>
                            </Typography>
                        </TableCell>
                        <TableCell key="balance" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>
                                <Trans>Balance({symbol})</Trans>
                            </Typography>
                        </TableCell>
                        <TableCell key="Operation" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>
                                <Trans>Operation</Trans>
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
            )}
            <TableBody>
                {loading ?
                    range(10).map((index) => <DeriveWalletTableRowSkeleton key={index} />)
                :   dataSource.map((item) => (
                        <DeriveWalletTableRow
                            address={item.address}
                            pathIndex={item.pathIndex}
                            key={item.address}
                            selected={item.selected}
                            added={item.added}
                            onCheck={(checked) => onCheck(checked, item.pathIndex)}
                            symbol={symbol}
                        />
                    ))
                }
            </TableBody>
        </Table>
    )
})
export interface DeriveWalletTableRowProps {
    address: string
    pathIndex: number
    added: boolean
    selected: boolean
    onCheck: (checked: boolean) => void
    symbol: string
}
export const DeriveWalletTableRow = memo<DeriveWalletTableRowProps>(function DeriveWalletTableRow({
    address,
    pathIndex,
    added,
    onCheck,
    selected,
    symbol,
}) {
    const { classes, cx } = useStyles()
    const { data: balance, isPending } = useBalance(NetworkPluginID.PLUGIN_EVM, {
        account: address,
        chainId: ChainId.Mainnet,
    })

    const theme = useTheme()

    return (
        <TableRow key={address} className={cx(classes.tableRow, classes.tableRowWithHoverEffect)}>
            <TableCell align="left" variant="body" className={classes.cell}>
                <Typography className={classes.second} minWidth={20}>
                    {pathIndex + 1}
                </Typography>
                <Typography className={classes.title}>
                    <FormattedAddress address={address} size={4} formatter={formatEthereumAddress} />
                </Typography>
                <div className={classes.icons}>
                    <CopyButton size={16} className={classes.icon} text={address} />
                    <Icons.LinkOut
                        size={16}
                        className={classes.link}
                        onClick={() => openWindow(EVMExplorerResolver.addressLink(ChainId.Mainnet, address))}
                    />
                </div>
            </TableCell>
            <TableCell align="left" variant="body" className={cx(classes.cell, classes.center)}>
                {isPending ?
                    <CircularProgress color="primary" size={12} classes={{ colorPrimary: classes.colorPrimary }} />
                :   <Typography className={classes.title}>
                        <FormattedBalance
                            value={balance}
                            decimals={18}
                            significant={4}
                            symbol={symbol}
                            formatter={formatBalance}
                            classes={{ symbol: cx(classes.third, classes.symbol) }}
                        />
                    </Typography>
                }
            </TableCell>
            <TableCell align="right" variant="body" className={classes.cell}>
                <Checkbox
                    disabled={added}
                    checked={selected || added}
                    icon={<Icons.CheckboxNo size={16} color={theme.palette.maskColor.secondaryLine} />}
                    checkedIcon={<Icons.Checkbox size={16} />}
                    sx={{
                        color: theme.palette.maskColor.primary,
                        padding: 0,
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        [`&.${checkboxClasses.checked}`]: {
                            color: theme.palette.maskColor.primary,
                        },
                        [`&.${checkboxClasses.disabled}`]: {
                            color: `${theme.palette.maskColor.secondaryMain}!important`,
                        },
                    }}
                    onChange={(e) => onCheck(e.target.checked)}
                />
            </TableCell>
        </TableRow>
    )
})

const DeriveWalletTableRowSkeleton = memo(function DeriveWalletTableRow() {
    const { classes, cx } = useStyles()

    return (
        <TableRow className={cx(classes.tableRow, classes.tableRowWithHoverEffect)}>
            <TableCell align="left" variant="body" className={classes.cell}>
                <Skeleton className={classes.second} width={20} height={18} />
                <Skeleton className={classes.title} width={100} height={18} />
            </TableCell>
            <TableCell align="left" variant="body" className={cx(classes.cell, classes.center)}>
                <Skeleton className={classes.title} width={60} height={18} />
            </TableCell>
            <TableCell align="right" variant="body" className={classes.cell}>
                <Skeleton width={16} height={18} />
            </TableCell>
        </TableRow>
    )
})
