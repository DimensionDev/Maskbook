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
import { ContractItem } from './ContractItem.js'
import { ContractSection } from './ContractSection.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        borderRadius: 0,
        backgroundColor: 'transparent',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
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
        margin: theme.spacing(0, 1.5),
        maxHeight: 446,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        background: theme.palette.maskColor.bottom,
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
    },
    item: {
        '& > *': {
            padding: theme.spacing(0, 1.5),
        },
    },
    list: {
        padding: 0,
    },
}))

export interface CoinMetadataTableProps {
    trending?: TrendingAPI.Trending | null
}

const brands: Record<TrendingAPI.CommunityType, React.ReactNode> = {
    discord: <Icons.DiscordRound size={16} />,
    facebook: <Icons.FacebookColored size={16} />,
    github: <Icons.GitHub size={16} />,
    instagram: <Icons.Instagram size={16} />,
    medium: <Icons.Medium size={16} />,
    reddit: <Icons.RedditRound size={16} />,
    telegram: <Icons.TelegramRound size={16} />,
    twitter: <Icons.TwitterXRound size={16} />,
    youtube: <Icons.YouTube size={16} />,
    other: null,
}

export const CoinMetadataTable = memo(function CoinMetadataTable({ trending }: CoinMetadataTableProps) {
    const { classes } = useStyles()

    // eslint-disable-next-line react/no-missing-key
    const metadataLinks = [[<Trans>Website</Trans>, trending?.coin.home_urls]] as const

    const contracts = trending?.contracts?.filter((x) => x.chainId) ?? [
        {
            chainId: trending?.coin.chainId,
            address: trending?.coin.contract_address,
            pluginID: NetworkPluginID.PLUGIN_EVM,
        },
    ]

    const [menu, openMenu, closeMenu] = useMenuConfig(
        contracts.map((x) => (
            <ContractItem
                key={x.chainId}
                pluginID={x.pluginID}
                chainId={x.chainId!}
                address={x.address || ''}
                name={x.address || ''}
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
            MenuListProps: { classes: { root: classes.item } },
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
                    <Trans>Info</Trans>
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        {contracts.length ?
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        <Trans>Contract</Trans>
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cellValue} align="right">
                                    {contracts[0].address ?
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
                                            {contracts.length > 1 ?
                                                <IconButton size="small" onClick={openMenu}>
                                                    <MoreHorizIcon style={{ fontSize: 16 }} />
                                                </IconButton>
                                            :   null}
                                            {menu}
                                        </Stack>
                                    :   '--'}
                                </TableCell>
                            </TableRow>
                        :   null}
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
                        {trending?.coin.community_urls?.length ?
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        <Trans>Community</Trans>
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
                                            brands[x.type] ?
                                                <Linking
                                                    key={x.link}
                                                    href={x.link}
                                                    LinkProps={{
                                                        className: classes.link,
                                                    }}>
                                                    {brands[x.type]}
                                                </Linking>
                                            :   null,
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        :   null}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
})

export const CoinMetadataTableSkeleton = memo(function CoinMetadataTableSkeleton() {
    const { classes } = useStyles()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700}>
                    <Trans>Info</Trans>
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <Typography className={classes.label} variant="body2">
                                    <Trans>Contract</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cellValue} align="right">
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <Typography className={classes.label} variant="body2">
                                    <Trans>Website</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cellValue} align="right">
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <Typography className={classes.label} variant="body2">
                                    <Trans>Community</Trans>
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
