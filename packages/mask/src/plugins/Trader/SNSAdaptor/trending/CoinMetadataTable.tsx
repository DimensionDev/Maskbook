import {
    TableContainer,
    Paper,
    Table,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Stack,
    MenuItem,
    IconButton,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { DataProvider } from '@masknet/public-api'
import { Linking } from './Linking'
import { useI18N, useMenu } from '../../../../utils'
import { ContractSection } from './ContractSection'
import type { CommunityType } from '../../types'
import {
    DiscordRoundIcon,
    FacebookRoundIcon,
    RedditRoundIcon,
    TelegramRoundIcon,
    TwitterRoundIcon,
} from '@masknet/icons'
import { upperFirst } from 'lodash-unified'
import type { TrendingAPI } from '@masknet/web3-providers'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

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
        fontWeight: 700,
    },
    cellValue: {
        border: 'none',
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
        fontWeight: 700,
        '&:last-child': {
            paddingRight: 0,
        },
    },
}))

export interface CoinMetadataTableProps {
    trending: TrendingAPI.Trending
    dataProvider: DataProvider
}

const brands: Record<CommunityType, React.ReactNode> = {
    facebook: <FacebookRoundIcon sx={{ fontSize: 16 }} />,
    twitter: <TwitterRoundIcon sx={{ fontSize: 16 }} />,
    telegram: <TelegramRoundIcon sx={{ fontSize: 16 }} />,
    discord: <DiscordRoundIcon sx={{ fontSize: 16 }} />,
    reddit: <RedditRoundIcon sx={{ fontSize: 16 }} />,
    other: null,
}

export function CoinMetadataTable(props: CoinMetadataTableProps) {
    const { dataProvider, trending } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    const metadataLinks = [['Website', trending.coin.home_urls]] as Array<[string, string[] | undefined]>

    const contracts = trending.contracts ?? []

    const [menu, openMenu] = useMenu(
        contracts.map((x, i) => (
            <MenuItem key={x.chainId}>
                <ContractSection address={x.address} chainId={x.chainId} iconURL={x.iconURL} />
            </MenuItem>
        )),
        false,
    )

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
                        {contracts.length ? (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        {t('contract')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cellValue} align="right">
                                    {contracts[0].address ? (
                                        <Stack
                                            direction="row"
                                            justifyContent="flex-end"
                                            height={18}
                                            style={{ position: 'relative', right: -5 }}>
                                            <ContractSection
                                                iconURL={contracts[0].iconURL}
                                                chainId={contracts[0].chainId}
                                                address={contracts[0].address}
                                            />
                                            <IconButton size="small" onClick={openMenu}>
                                                <MoreHorizIcon style={{ fontSize: 16 }} />
                                            </IconButton>
                                            {menu}
                                        </Stack>
                                    ) : (
                                        '--'
                                    )}
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
                                    <TableCell className={classes.cellValue} align="right">
                                        <Stack display="inline-flex" direction="row" gap={1}>
                                            {links.map((x, i) => (
                                                <Linking
                                                    key={i}
                                                    href={x}
                                                    LinkProps={{ className: classes.link }}
                                                    TypographyProps={{ fontWeight: 700 }}
                                                />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {!!trending.coin.community_urls?.length && (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        Community
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cellValue} align="right">
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
