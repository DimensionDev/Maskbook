import { useCopyToClipboard } from 'react-use'
import {
    TableContainer,
    Paper,
    Table,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    IconButton,
    Stack,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import type { DataProvider } from '@masknet/public-api'
import { useSnackbarCallback, FormattedAddress } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import type { Trending } from '../../types'
import { Linking } from './Linking'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {},
    container: {
        borderRadius: 0,
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    table: {},
    cell: {
        whiteSpace: 'nowrap',
        border: 'none',
        padding: 0,
    },
    label: {
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
        textAlign: 'left',
    },
    link: {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        paddingRight: theme.spacing(1),
        '&:last-child': {
            paddingRight: 0,
        },
    },
}))

export interface CoinMetadataTableProps {
    trending: Trending
    dataProvider: DataProvider
}

export function CoinMetadataTable(props: CoinMetadataTableProps) {
    const { dataProvider, trending } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopyAddress = useSnackbarCallback(async () => {
        if (!trending.coin.contract_address) return
        copyToClipboard(trending.coin.contract_address)
    }, [trending.coin.contract_address])

    const metadataLinks = [
        ['Website', trending.coin.home_urls],
        ['Community', trending.coin.community_urls],
    ] as Array<[string, string[] | undefined]>

    return (
        <>
            <Stack>
                <Typography fontSize={14} fontWeight={700}>
                    {t('plugin_trader_info')}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table className={classes.table} size="small">
                    <TableBody>
                        {metadataLinks.map(([label, links], i) => {
                            if (!links?.length) return null
                            return (
                                <TableRow key={i}>
                                    <TableCell className={classes.cell}>
                                        <Typography className={classes.label} variant="body2">
                                            {label}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {links.map((x, i) => (
                                            <Linking key={i} href={x} LinkProps={{ className: classes.link }} />
                                        ))}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {trending.coin.contract_address ? (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        {t('contract')}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" component="span">
                                        <FormattedAddress
                                            address={trending.coin.contract_address}
                                            size={4}
                                            formatter={formatEthereumAddress}
                                        />
                                    </Typography>
                                    <IconButton color="primary" size="small" onClick={onCopyAddress}>
                                        <FileCopyIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
