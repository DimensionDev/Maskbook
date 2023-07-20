import { Icons } from '@masknet/icons'
import { Linking, useMenuConfig } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material'
import {
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material'
import { memo, useEffect } from 'react'
import { useSharedI18N } from '../../../locales/index.js'
import { ContractItem } from './ContractItem.js'
import { ContractSection } from './ContractSection.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        borderRadius: 0,
        backgroundColor: 'transparent',
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
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
        fontSize: 14,
        whiteSpace: 'nowrap',
        textAlign: 'left',
    },
    link: {
        display: 'block',
        alignItems: 'center',
        gap: theme.spacing(0.25),
        whiteSpace: 'nowrap',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        '&:last-child': {
            paddingRight: 0,
        },
    },
    menu: {
        borderRadius: 16,
        padding: theme.spacing(0, 1.5),
        maxHeight: 446,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        background: theme.palette.maskColor.bottom,
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
    },
    list: {
        padding: 0,
    },
}))

export interface CoinMetadataTableProps {
    trending?: TrendingAPI.Trending
}

const brands: Record<TrendingAPI.CommunityType, React.ReactNode> = {
    discord: <Icons.DiscordRoundGray size={16} />,
    facebook: <Icons.FacebookRoundGray size={16} />,
    github: <Icons.GitHubGray size={16} />,
    instagram: <Icons.InstagramRoundGray size={16} />,
    medium: <Icons.MediumGray size={16} />,
    reddit: <Icons.RedditRoundGray size={16} />,
    telegram: <Icons.TelegramRoundGray size={16} />,
    twitter: <Icons.TwitterRoundGray size={16} />,
    youtube: <Icons.YouTubeGray size={16} />,
    other: null,
}

export const CoinMetadataTable = memo(function CoinMetadataTable({ trending }: CoinMetadataTableProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()

    const metadataLinks = [[t.website(), trending?.coin.home_urls]] as Array<[string, string[] | undefined]>

    const contracts = trending?.contracts?.filter((x) => x.chainId) ?? [
        {
            chainId: trending?.coin.chainId!,
            address: trending?.coin.contract_address!,
            pluginID: NetworkPluginID.PLUGIN_EVM,
        },
    ]

    const [menu, openMenu, closeMenu] = useMenuConfig(
        contracts.map((x) => (
            <ContractItem
                key={x.chainId}
                pluginID={x.pluginID}
                chainId={x.chainId!}
                address={x.address}
                name={x.address}
            />
        )),
        {
            anchorSibling: false,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            classes: { paper: classes.menu, list: classes.list },
        },
    )

    useEffect(() => {
        window.addEventListener('scroll', closeMenu)
        return () => window.removeEventListener('scroll', closeMenu)
    }, [closeMenu])

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700}>
                    {t.info()}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        {contracts.length ? (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        {t.contract()}
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
                                                pluginID={contracts[0].pluginID}
                                                chainId={contracts[0].chainId}
                                                address={contracts[0].address}
                                                name={contracts[0].address}
                                            />
                                            {contracts.length > 1 ? (
                                                <IconButton size="small" onClick={openMenu}>
                                                    <MoreHorizIcon style={{ fontSize: 16 }} />
                                                </IconButton>
                                            ) : null}
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
                                        <div>
                                            {links.map((x, i) => (
                                                <Linking
                                                    key={i}
                                                    href={x}
                                                    LinkProps={{ className: classes.link }}
                                                    TypographyProps={{ fontWeight: 700, fontSize: 14 }}
                                                />
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {!!trending?.coin.community_urls?.length && (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        {t.community()}
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
                                        gap={1}>
                                        {trending.coin.community_urls.map((x) =>
                                            brands[x.type] ? (
                                                <Linking
                                                    key={x.link}
                                                    href={x.link}
                                                    LinkProps={{
                                                        className: classes.link,
                                                    }}>
                                                    {brands[x.type]}
                                                </Linking>
                                            ) : null,
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
})

export const CoinMetadataTableSkeleton = memo(function CoinMetadataTableSkeleton() {
    const t = useSharedI18N()
    const { classes } = useStyles()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700}>
                    {t.info()}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <Typography className={classes.label} variant="body2">
                                    {t.contract()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cellValue} align="right">
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <Typography className={classes.label} variant="body2">
                                    {t.website()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cellValue} align="right">
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <Typography className={classes.label} variant="body2">
                                    {t.community()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cellValue} align="right">
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
})
