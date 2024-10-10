import { Icons } from '@masknet/icons'
import { EmptyStatus, LoadingStatus, Markdown, NFTSpamBadge, ReloadStatus, useReportSpam } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    LoadingBase,
    MaskTabList,
    ShadowRootTooltip,
    TextOverflowTooltip,
    makeStyles,
    useDetectOverflow,
    useTabs,
} from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Box, CardContent, CardHeader, IconButton, Paper, Tab, Typography } from '@mui/material'
import { format as formatDateTime, isAfter, isValid as isValidDate } from 'date-fns'
import { useMemo } from 'react'
import { Context } from '../Context/index.js'
import { LinkingAvatar } from '../Shared/LinkingAvatar.js'
import { CollectiblePaper } from './CollectiblePaper.js'
import { AboutTab } from './tabs/AboutTab.js'
import { ActivitiesTab } from './tabs/ActivitiesTab.js'
import { DetailsTab } from './tabs/DetailsTab.js'
import { OffersTab } from './tabs/OffersTab.js'
import { Trans } from '@lingui/macro'

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
            overflow: 'auto',
            padding: 10,
        },
        headerContent: {
            overflow: 'auto',
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
            scrollbarWidth: 'none',
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
        reportButton: {
            marginLeft: 'auto',
            backgroundColor: theme.palette.maskColor.bg,
            width: 24,
            height: 24,
            borderRadius: 4,
            color: theme.palette.maskColor.main,
            '&:hover': {
                backgroundColor: theme.palette.maskColor.bg,
            },
        },
        empty: {
            height: 150,
        },
    }
})

export function Collectible() {
    const [currentTab, onChange, tabs] = useTabs('about', 'details', 'offers', 'activities')
    const { classes } = useStyles({ currentTab })
    const { asset, orders } = Context.useContainer()
    const [outVerified, titleRef] = useDetectOverflow<HTMLDivElement>()

    const { isReporting, isSpam, promptReport } = useReportSpam({
        address: asset.data?.address,
        chainId: asset.data?.chainId,
        collectionId: asset.data?.collection?.id,
    })

    const offers = useMemo(() => orders.data?.pages.flatMap((x) => x.data) ?? EMPTY_LIST, [orders.data?.pages])

    if (asset.isPending) return <LoadingStatus height={148} p={1} />

    if (!asset.data && !asset.error) {
        return (
            <EmptyStatus className={classes.empty}>
                <Trans>NFT is not minted yet.</Trans>
            </EmptyStatus>
        )
    }

    if (!asset.data) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" pb={2} pt={4}>
                <ReloadStatus onRetry={() => asset.refetch()} />
            </Box>
        )
    }

    const _asset = asset.data
    const endDate = _asset.auction?.endAt
    const renderTab = () => {
        const tabMap = {
            [tabs.about]: <AboutTab asset={asset.data} isLoading={asset.isPending} />,
            [tabs.details]: <DetailsTab asset={asset.data} isLoading={asset.isPending} />,
            [tabs.offers]: (
                <OffersTab
                    offers={offers}
                    loading={orders.isPending}
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
        { value: tabs.about, label: <Trans>About</Trans> },
        { value: tabs.details, label: <Trans>Details</Trans> },
        { value: tabs.offers, label: <Trans>Offers</Trans> },
        { value: tabs.activities, label: <Trans>Activities</Trans> },
    ]

    return (
        <>
            <CollectiblePaper classes={{ root: classes.root }}>
                <CardHeader
                    className={classes.header}
                    classes={{ content: classes.headerContent }}
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
                            <TextOverflowTooltip
                                as={ShadowRootTooltip}
                                placement="top"
                                title={_asset.metadata?.name || '-'}>
                                <Typography className={classes.cardTitle} ref={titleRef}>
                                    {_asset.metadata?.name || '-'}
                                    {_asset.collection?.verified && !outVerified ?
                                        <Icons.Verification size={20} sx={{ marginLeft: 0.5 }} />
                                    :   null}
                                </Typography>
                            </TextOverflowTooltip>
                            {_asset.collection?.verified && outVerified ?
                                <Icons.Verification size={20} sx={{ marginLeft: 0.5 }} />
                            :   null}

                            {isSpam ?
                                <NFTSpamBadge ml="auto" />
                            :   <IconButton
                                    className={classes.reportButton}
                                    onClick={promptReport}
                                    disabled={isReporting}>
                                    {isReporting ?
                                        <LoadingBase size={16} />
                                    :   <Icons.Flag size={16} />}
                                </IconButton>
                            }
                        </Typography>
                    }
                    subheader={
                        _asset.metadata?.description ?
                            <Typography className={classes.subtitle} component="div" variant="body2">
                                <Markdown className={classes.markdown}>{_asset.metadata.description}</Markdown>
                            </Typography>
                        :   null
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
            {endDate && isValidDate(endDate) && isAfter(endDate, Date.now()) ?
                <Box sx={{ marginTop: 1 }}>
                    <Typography className={classes.countdown}>
                        <Trans>Sale ends in {formatDateTime(endDate, 'yyyy-MM-dd HH:mm:ss')}</Trans>
                    </Typography>
                </Box>
            :   null}
        </>
    )
}
