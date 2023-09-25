import { Icons } from '@masknet/icons'
import { EmptyStatus, LoadingStatus, Markdown, RetryHint } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Box, CardContent, CardHeader, Paper, Tab, Typography } from '@mui/material'
import formatDateTime from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import isValidDate from 'date-fns/isValid'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCollectibleI18N } from '../../locales/i18n_generated.js'
import { Context } from '../Context/index.js'
import { LinkingAvatar } from '../Shared/LinkingAvatar.js'
import { CollectiblePaper } from './CollectiblePaper.js'
import { AboutTab } from './tabs/AboutTab.js'
import { ActivitiesTab } from './tabs/ActivitiesTab.js'
import { DetailsTab } from './tabs/DetailsTab.js'
import { OffersTab } from './tabs/OffersTab.js'

const useStyles = makeStyles<{ currentTab: string }>()((theme, { currentTab }) => {
    return {
        root: {
            width: '100%',
            padding: 0,
            paddingBottom: theme.spacing(2),
            backgroundColor: 'unset',
        },
        content: {
            height: 'var(--contentHeight)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
            margin: '0 12px',
        },
        header: {
            alignItems: 'unset',
            padding: 10,
        },
        body: {
            flex: 1,
            backgroundColor: theme.palette.maskColor.bg,
            overflow: 'auto',
            maxHeight: currentTab === 'about' ? 800 : 327,
            borderRadius: '0 0 12px 12px',
            scrollbarWidth: 'none',
            background: '#fff !important',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tab: {
            whiteSpace: 'nowrap',
            background: 'transparent',
            color: theme.palette.maskColor.publicSecond,
            '&:hover': {
                background: 'transparent',
            },
        },
        tabActive: {
            background: '#fff',
            color: theme.palette.maskColor.publicMain,
            '&:hover': {
                background: '#fff',
            },
        },
        subtitle: {
            marginRight: theme.spacing(0.5),
            maxHeight: '3rem',
            overflow: 'auto',
            wordBreak: 'break-word',
            color: theme.palette.maskColor.publicSecond,
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        countdown: {
            fontSize: 12,
            borderRadius: 8,
            display: 'block',
            white: '100%',
            color: theme.palette.common.white,
            backgroundColor: '#eb5757',
            padding: theme.spacing(0.5, 2),
        },
        markdown: {
            overflow: 'hidden',
            '& > p': {
                display: 'inline',
                color: `${theme.palette.maskColor.publicSecond} !important`,
            },
            '& hr': {
                display: 'none',
            },
            '& a': {
                color: `${theme.palette.maskColor.publicMain} !important`,
            },
        },
        cardTitle: {
            display: 'inline-flex',
            fontSize: 16,
            lineHeight: '20px',
            fontWeight: 700,
            color: theme.palette.maskColor.publicMain,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            width: 380,
        },
        empty: {
            height: 150,
        },
    }
})

export function Collectible() {
    const t = useCollectibleI18N()
    const [currentTab, onChange, tabs] = useTabs('about', 'details', 'offers', 'activities')
    const { classes } = useStyles({ currentTab })
    const { asset, orders } = Context.useContainer()
    const titleRef = useRef<HTMLDivElement>(null)
    const [outVerified, setOutVerified] = useState(false)

    useLayoutEffect(() => {
        if (!titleRef) return
        const offsetWidth = titleRef.current?.offsetWidth
        const scrollWidth = titleRef.current?.scrollWidth

        if (!offsetWidth || !scrollWidth) {
            setOutVerified(false)
        } else {
            setOutVerified(scrollWidth > offsetWidth)
        }
    }, [])

    const offers = useMemo(() => orders.data?.pages.flatMap((x) => x.data) ?? EMPTY_LIST, [orders.data?.pages])

    if (asset.isLoading) return <LoadingStatus height={148} p={1} />

    if (!asset.data && !asset.error) {
        return <EmptyStatus className={classes.empty}>{t.nft_minted()}</EmptyStatus>
    }

    if (!asset.data) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" pb={2} pt={4}>
                <RetryHint
                    ButtonProps={{ startIcon: <Icons.Restore color="white" size={18} />, sx: { width: 256 } }}
                    retry={() => asset.refetch()}
                />
            </Box>
        )
    }

    const _asset = asset.data
    const endDate = _asset.auction?.endAt
    const renderTab = () => {
        const tabMap = {
            [tabs.about]: <AboutTab asset={asset.data} isLoading={asset.isLoading} />,
            [tabs.details]: <DetailsTab asset={asset.data} isLoading={asset.isLoading} />,
            [tabs.offers]: (
                <OffersTab
                    offers={offers}
                    loading={orders.isLoading}
                    error={orders.error as Error | undefined}
                    finished={!orders.hasNextPage}
                    onRetry={orders.refetch}
                    onNext={orders.fetchNextPage}
                />
            ),
            [tabs.activities]: <ActivitiesTab />,
        }

        return tabMap[currentTab] || null
    }
    const Tabs = [
        { value: tabs.about, label: t.plugin_collectible_about() },
        { value: tabs.details, label: t.plugin_collectible_details() },
        { value: tabs.offers, label: t.plugin_collectible_offers() },
        { value: tabs.activities, label: t.plugin_collectible_activities() },
    ]

    return (
        <>
            <CollectiblePaper classes={{ root: classes.root }}>
                <CardHeader
                    className={classes.header}
                    avatar={
                        <LinkingAvatar
                            href={_asset.link ?? ''}
                            title={_asset.owner?.nickname ?? _asset.owner?.address ?? ''}
                            name={_asset.metadata?.name ?? ''}
                            src={
                                _asset.collection?.iconURL ?? _asset.creator?.avatarURL ?? _asset.owner?.avatarURL ?? ''
                            }
                        />
                    }
                    title={
                        <Typography component="div" style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography className={classes.cardTitle} ref={titleRef}>
                                {_asset.metadata?.name || '-'}
                                {_asset.collection?.verified && !outVerified ? (
                                    <Icons.Verification size={20} sx={{ marginLeft: 0.5 }} />
                                ) : null}
                            </Typography>
                            {_asset.collection?.verified && outVerified ? (
                                <Icons.Verification size={20} sx={{ marginLeft: 0.5 }} />
                            ) : null}
                        </Typography>
                    }
                    subheader={
                        _asset.metadata?.description ? (
                            <Typography className={classes.subtitle} component="div" variant="body2">
                                <Markdown className={classes.markdown}>{_asset.metadata.description}</Markdown>
                            </Typography>
                        ) : null
                    }
                />
                <CardContent className={classes.content}>
                    <TabContext value={currentTab}>
                        <MaskTabList variant="base" aria-label="collectible" onChange={onChange}>
                            {Tabs.map((x) => (
                                <Tab
                                    key={x.value}
                                    className={x.value === currentTab ? classes.tabActive : classes.tab}
                                    value={x.value}
                                    label={x.label}
                                />
                            ))}
                        </MaskTabList>
                    </TabContext>
                    <Paper className={classes.body} elevation={0}>
                        {renderTab()}
                    </Paper>
                </CardContent>
            </CollectiblePaper>
            {endDate && isValidDate(endDate) && isAfter(endDate, Date.now()) ? (
                <Box sx={{ marginTop: 1 }}>
                    <Typography className={classes.countdown}>
                        {t.plugin_collectible_sale_end({
                            time: formatDateTime(endDate, 'yyyy-MM-dd HH:mm:ss'),
                        })}
                    </Typography>
                </Box>
            ) : null}
        </>
    )
}
