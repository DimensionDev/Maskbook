import { TableContainer, Paper, Table, TableRow, TableCell, TableBody, Typography, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { DataProvider } from '@masknet/public-api'
import { Linking } from './Linking'
import { useI18N } from '../../../../utils'
import { ContractSection } from './ContractSection'
import type { CommunityType, Trending } from '../../types'
import {
    DiscordRoundIcon,
    FacebookRoundIcon,
    RedditRoundIcon,
    TelegramRoundIcon,
    TwitterRoundIcon,
} from '@masknet/icons'
import { upperFirst } from 'lodash-unified'

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
        lineHeight: 1.2,
    },
    label: {
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
        textAlign: 'left',
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(0.25),
        whiteSpace: 'nowrap',
        '&:last-child': {
            paddingRight: 0,
        },
    },
}))

export interface CoinMetadataTableProps {
    trending: Trending
    dataProvider: DataProvider
}

const brands: Record<CommunityType, React.ReactNode> = {
    facebook: <FacebookRoundIcon />,
    twitter: <TwitterRoundIcon />,
    telegram: <TelegramRoundIcon />,
    discord: <DiscordRoundIcon />,
    reddit: <RedditRoundIcon />,
    other: null,
}

export function CoinMetadataTable(props: CoinMetadataTableProps) {
    const { dataProvider, trending } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    const metadataLinks = [['Website', trending.coin.home_urls]] as Array<[string, string[] | undefined]>

    return (
        <Stack>
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
                        {trending.coin.community_urls?.length && (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        Community
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack
                                        height="100%"
                                        display="flex"
                                        direction="row"
                                        justifyContent="flex-end"
                                        flexWrap="wrap"
                                        alignItems="center"
                                        gap={1.5}>
                                        {trending.coin.community_urls.map((x) => (
                                            <Linking key={x.link} href={x.link} LinkProps={{ className: classes.link }}>
                                                {brands[x.type]}
                                                {upperFirst(x.type)}
                                            </Linking>
                                        ))}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}
