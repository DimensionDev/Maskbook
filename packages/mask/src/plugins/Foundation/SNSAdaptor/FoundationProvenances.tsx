import {
    Typography,
    Link,
    Box,
    TableContainer,
    Table,
    Paper,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material'
import { useAccount } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import type { NftHistory } from '../types'
import { convertDate } from '../utils'
import { makeStyles } from '@masknet/theme'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useNativeTokenPrice } from '../../Wallet/hooks/useTokenPrice'
import { formatEthereumAddress, useNativeTokenDetailed, formatCurrency } from '@masknet/web3-shared-evm'
import { ETHIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            background: theme.palette.background.paper,
            borderRadius: theme.spacing(0.5),
        },
        icons: {
            width: '24px',
            height: '24px',
            margin: '0px 1px -6px -6px',
        },
        table: {
            background: theme.palette.divider,
        },
        subCurrency: {
            margin: '1px',
            color: theme.palette.text.disabled,
        },
        tableCell: {
            padding: theme.spacing(0.5),
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    histories: NftHistory[]
}

function FoundationProvenances(props: Props) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const { value: nativeToken } = useNativeTokenDetailed()
    const darkModo = window.matchMedia('(prefers-color-scheme: dark)')
    const isDarkModeEnabled = darkModo ? { padding: 1.5, color: '#121212' } : { padding: 3, color: 'none' }
    const tableType = darkModo ? 'separate' : 'collapse'
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)
    const histories = props.histories.sort((first: NftHistory, second: NftHistory) => {
        if (first.date < second.date) {
            return 1
        }
        if (first.date > second.date) {
            return -1
        }
        return 0
    })
    return (
        <Box className={classes.body} px={3} py={isDarkModeEnabled.padding}>
            <TableContainer component={Paper} sx={{ borderRadius: '4px' }}>
                <Table
                    sx={{ borderCollapse: tableType, borderSpacing: '0px 16px' }}
                    size="small"
                    aria-label="Provenances-table">
                    <TableHead className={classes.table}>
                        <TableRow>
                            <TableCell>Event</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>TX</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {histories.map((history: NftHistory) => (
                            <TableRow sx={{ background: isDarkModeEnabled.color }}>
                                <TableCell className={classes.tableCell}>
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {`${history.event} ${t('plugin_foundation_by')} `}
                                            <Link
                                                href={`https://etherscan.io/address/${history.txOrigin.id}`}
                                                target="_blank">
                                                {account === history.txOrigin.id ? (
                                                    <span>{t('plugin_foundation_you_address')}</span>
                                                ) : (
                                                    <span>{formatEthereumAddress(history.txOrigin.id, 2)}</span>
                                                )}
                                            </Link>
                                        </Typography>
                                        <Typography
                                            style={{ width: '100%' }}
                                            variant="caption"
                                            display="block"
                                            gutterBottom>
                                            {convertDate(history.date)}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell className={classes.tableCell}>
                                    {history.amountInETH !== null && (
                                        <Box>
                                            <Typography align="left" variant="subtitle1" m={1}>
                                                <ETHIcon className={classes.icons} color="primary" fontSize="inherit" />{' '}
                                                {history.amountInETH}
                                                <span className={classes.subCurrency}>
                                                    (
                                                    {formatCurrency(
                                                        nativeTokenPrice * Number(history.amountInETH),
                                                        '$',
                                                    )}
                                                    )
                                                </span>
                                            </Typography>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right' }} className={classes.tableCell}>
                                    <Link
                                        href={`https://etherscan.io/tx/${history.id.split('-')[0]}`}
                                        color="inherit"
                                        target="_blank">
                                        <OpenInNewIcon />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default FoundationProvenances
