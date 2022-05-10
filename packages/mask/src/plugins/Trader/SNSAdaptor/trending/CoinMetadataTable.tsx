import { TableContainer, Paper, Table, TableRow, TableCell, TableBody, Typography, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { DataProvider } from '@masknet/public-api'
import type { Trending } from '../../types'
import { Linking } from './Linking'
import { useI18N } from '../../../../utils'
import { ContractSection } from './ContractSection'

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
                        {trending.coin.contract_address ? (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        {t('contract')}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <ContractSection
                                        logoURL={trending.coin.image_url}
                                        address={trending.coin.contract_address}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : null}
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
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
