import { useCopyToClipboard } from 'react-use'
import {
    makeStyles,
    createStyles,
    TableContainer,
    Paper,
    Table,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    IconButton,
} from '@material-ui/core'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import type { DataProvider, Trending } from '../../types'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import { Linking } from './Linking'
import { formatEthereumAddress } from '../../../Wallet/formatter'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
        },
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
        },
        label: {
            color: theme.palette.text.secondary,
            whiteSpace: 'nowrap',
        },
        link: {
            display: 'inline-block',
            whiteSpace: 'nowrap',
            paddingRight: theme.spacing(1),
            '&:last-child': {
                paddingRight: 0,
            },
        },
        tag: {
            paddingRight: theme.spacing(2),
            '&:last-child': {
                paddingRight: 0,
            },
        },
    }),
)

export interface CoinMetadataTableProps {
    trending: Trending
    dataProvider: DataProvider
}

export function CoinMetadataTable(props: CoinMetadataTableProps) {
    const { dataProvider, trending } = props
    const classes = useStyles()

    const [, copyToClipboard] = useCopyToClipboard()
    const onCopyAddress = useSnackbarCallback(async () => {
        if (!trending.coin.eth_address) return
        copyToClipboard(trending.coin.eth_address)
    }, [trending.coin.eth_address])

    const metadataLinks = [
        ['Website', trending.coin.home_urls],
        ['Announcement', trending.coin.announcement_urls],
        ['Message Board', trending.coin.message_board_urls],
        ['Explorer', trending.coin.blockchain_urls],
        ['Tech Docs', trending.coin.tech_docs_urls],
        ['Source Code', trending.coin.source_code_urls],
        ['Community', trending.coin.community_urls],
    ] as [string, string[] | undefined][]

    return (
        <TableContainer className={classes.container} component={Paper} elevation={0}>
            <Table className={classes.table} size="small">
                <TableBody>
                    {trending.coin.market_cap_rank ? (
                        <TableRow>
                            <TableCell>
                                <Typography className={classes.label} variant="body2">
                                    Market Cap
                                </Typography>
                            </TableCell>
                            <TableCell>{`Rank #${trending.coin.market_cap_rank}`}</TableCell>
                        </TableRow>
                    ) : null}
                    {metadataLinks.map(([label, links], i) => {
                        if (!links?.length) return null
                        return (
                            <TableRow key={i}>
                                <TableCell>
                                    <Typography className={classes.label} variant="body2">
                                        {label}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {links.map((x, i) => (
                                        <Linking key={i} href={x} LinkProps={{ className: classes.link }} />
                                    ))}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {trending.coin.eth_address ? (
                        <TableRow>
                            <TableCell>
                                <Typography className={classes.label} variant="body2">
                                    Contract
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" component="span">
                                    {formatEthereumAddress(trending.coin.eth_address, 4)}
                                </Typography>
                                <IconButton color="primary" size="small" onClick={onCopyAddress}>
                                    <FileCopyIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ) : null}
                    {trending.coin.tags?.length ? (
                        <TableRow>
                            <TableCell>
                                <Typography className={classes.label} variant="body2">
                                    Tags
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {trending.coin.tags.map((x, i) => (
                                    <Linking key={i} href={x} TypographyProps={{ className: classes.tag }} />
                                ))}
                            </TableCell>
                        </TableRow>
                    ) : null}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
