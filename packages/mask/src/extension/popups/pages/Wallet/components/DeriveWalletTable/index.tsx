import { memo } from 'react'
import { useAsync } from 'react-use'
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
} from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { FormattedAddress, FormattedBalance } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { formatBalance } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'
import { useI18N } from '../../../../../../utils/index.js'

const useStyles = makeStyles()({
    header: {
        backgroundColor: '#F7F9FA',
        padding: '14px 0',
        borderBottom: 'none',
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
    },
    cell: {
        padding: '8px 0',
        borderBottom: 'none',
    },
})

export interface DeriveWalletTableProps {
    loading: boolean
    dataSource?: Array<{
        address: string
        added: boolean
        selected: boolean
    }>
    onCheck: (checked: boolean, index: number) => void
    confirmLoading: boolean
    symbol: string
}

export const DeriveWalletTable = memo<DeriveWalletTableProps>(
    ({ loading, dataSource, onCheck, confirmLoading, symbol }) => {
        const { classes } = useStyles()
        const { t } = useI18N()
        return (
            <Table size="small" padding="none" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell key="address" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>{t('address')}</Typography>
                        </TableCell>
                        <TableCell key="balance" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>{t('wallet_balance_eth', { symbol })}</Typography>
                        </TableCell>
                        <TableCell key="Operation" align="center" variant="head" className={classes.header}>
                            <Typography className={classes.title}>{t('operation')}</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSource?.length && !loading
                        ? dataSource.map((item, index) => (
                              <DeriveWalletTableRow
                                  address={item.address}
                                  key={index}
                                  selected={item.selected}
                                  added={item.added}
                                  onCheck={(checked) => onCheck(checked, index)}
                                  confirmLoading={confirmLoading}
                                  symbol={symbol}
                              />
                          ))
                        : range(10).map((index) => (
                              <TableRow key={index}>
                                  <TableCell align="center" variant="body" className={classes.cell}>
                                      <Skeleton animation="wave" variant="rectangular" width="90%" height={24} />
                                  </TableCell>
                                  <TableCell align="center" variant="body" className={classes.cell}>
                                      <Skeleton animation="wave" variant="rectangular" width="90%" height={24} />
                                  </TableCell>
                                  <TableCell align="center" variant="body" className={classes.cell}>
                                      <Skeleton animation="wave" variant="rectangular" width="90%" height={24} />
                                  </TableCell>
                              </TableRow>
                          ))}
                </TableBody>
            </Table>
        )
    },
)
export interface DeriveWalletTableRowProps {
    address: string
    added: boolean
    selected: boolean
    onCheck: (checked: boolean) => void
    confirmLoading: boolean
    symbol: string
}
export const DeriveWalletTableRow = memo<DeriveWalletTableRowProps>(({ address, added, onCheck, selected, symbol }) => {
    const { classes } = useStyles()
    const { loading, value: balance } = useAsync(async () => Web3.getBalance(address), [address])

    return (
        <TableRow key={address}>
            <TableCell align="center" variant="body" className={classes.cell}>
                <Typography className={classes.title}>
                    <FormattedAddress address={address} size={4} formatter={formatEthereumAddress} />
                </Typography>
            </TableCell>
            <TableCell align="center" variant="body" className={classes.cell}>
                {loading ? (
                    <CircularProgress sx={{ color: '#15181B' }} size={12} />
                ) : (
                    <Typography className={classes.title}>
                        <FormattedBalance
                            value={balance}
                            decimals={18}
                            significant={4}
                            symbol={symbol}
                            formatter={formatBalance}
                        />
                    </Typography>
                )}
            </TableCell>
            <TableCell align="center" variant="body" className={classes.cell}>
                <Checkbox
                    disabled={added}
                    defaultChecked={selected || added}
                    icon={<Icons.CheckboxBorder size={16} color="#1C68F3" />}
                    checkedIcon={<Icons.Checkbox size={16} />}
                    sx={{
                        color: '#1C68F3',
                        padding: 0,
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        '&.Mui-checked': {
                            color: '#1C68F3',
                        },
                    }}
                    onChange={(e) => onCheck(e.target.checked)}
                />
            </TableCell>
        </TableRow>
    )
})
