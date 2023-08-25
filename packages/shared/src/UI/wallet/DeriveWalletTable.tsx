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
import { ExplorerResolver } from '@masknet/web3-providers'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { formatBalance } from '@masknet/web3-shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { useBalance } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useSharedI18N } from '../../locales/index.js'

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
}))

interface DeriveWalletTableProps {
    loading: boolean
    dataSource?: Array<{
        address: string
        added: boolean
        selected: boolean
    }>
    onCheck: (checked: boolean, index: number) => void
    symbol: string
    page: number
    hiddenHeader?: boolean
}

export const DeriveWalletTable = memo<DeriveWalletTableProps>(function DeriveWalletTable({
    loading,
    dataSource,
    onCheck,
    symbol,
    hiddenHeader,
    page,
}) {
    const { classes } = useStyles()
    const t = useSharedI18N()
    return (
        <Table size="small" padding="none" stickyHeader>
            {hiddenHeader ? null : (
                <TableHead>
                    <TableRow>
                        <TableCell key="address" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>{t.address_viewer_address_name_address()}</Typography>
                        </TableCell>
                        <TableCell key="balance" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>{t.wallet_balance_eth({ symbol })}</Typography>
                        </TableCell>
                        <TableCell key="Operation" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>{t.operation()}</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
            )}
            <TableBody>
                {dataSource?.length && !loading
                    ? dataSource.map((item, index) => (
                          <DeriveWalletTableRow
                              address={item.address}
                              page={page}
                              key={index}
                              index={index}
                              selected={item.selected}
                              added={item.added}
                              onCheck={(checked) => onCheck(checked, index)}
                              symbol={symbol}
                          />
                      ))
                    : range(10).map((index) => (
                          <TableRow key={index} className={classes.tableRow}>
                              <TableCell align="center" variant="body" className={classes.cell}>
                                  <Skeleton animation="wave" variant="rectangular" width="90%" height={16} />
                              </TableCell>
                              <TableCell align="center" variant="body" className={classes.cell}>
                                  <Skeleton animation="wave" variant="rectangular" width="90%" height={16} />
                              </TableCell>
                              <TableCell align="center" variant="body" className={classes.cell}>
                                  <Skeleton animation="wave" variant="rectangular" width="90%" height={16} />
                              </TableCell>
                          </TableRow>
                      ))}
            </TableBody>
        </Table>
    )
})
export interface DeriveWalletTableRowProps {
    address: string
    added: boolean
    index: number
    page: number
    selected: boolean
    onCheck: (checked: boolean) => void
    symbol: string
}
export const DeriveWalletTableRow = memo<DeriveWalletTableRowProps>(function DeriveWalletTableRow({
    address,
    added,
    onCheck,
    selected,
    symbol,
    index,
    page,
}) {
    const { classes, cx } = useStyles()
    const { data: balance, isFetching } = useBalance(NetworkPluginID.PLUGIN_EVM, {
        account: address,
        chainId: ChainId.Mainnet,
    })

    const theme = useTheme()

    return (
        <TableRow key={address} className={cx(classes.tableRow, classes.tableRowWithHoverEffect)}>
            <TableCell align="left" variant="body" className={classes.cell}>
                <Typography className={classes.second}>{page * 10 + index + 1}</Typography>
                <Typography className={classes.title}>
                    <FormattedAddress address={address} size={4} formatter={formatEthereumAddress} />
                </Typography>
                <div className={classes.icons}>
                    <CopyButton size={16} className={classes.icon} text={address} />
                    <Icons.LinkOut
                        size={16}
                        className={classes.link}
                        onClick={() => openWindow(ExplorerResolver.addressLink(ChainId.Mainnet, address))}
                    />
                </div>
            </TableCell>
            <TableCell align="left" variant="body" className={cx(classes.cell, classes.center)}>
                {isFetching ? (
                    <CircularProgress color="primary" size={12} />
                ) : (
                    <Typography className={classes.title}>
                        <FormattedBalance
                            value={balance}
                            decimals={18}
                            significant={4}
                            symbol={symbol}
                            formatter={formatBalance}
                            classes={{ symbol: cx(classes.second, classes.symbol) }}
                        />
                    </Typography>
                )}
            </TableCell>
            <TableCell align="right" variant="body" className={classes.cell}>
                <Checkbox
                    disabled={added}
                    defaultChecked={selected || added}
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
