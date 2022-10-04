import formatDateTime from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import isValidDate from 'date-fns/isValid'
import { Icons } from '@masknet/icons'
import { Markdown } from '@masknet/shared'
import { LoadingBase, makeStyles, MaskColorVar, MaskTabList, useTabs } from '@masknet/theme'
import { resolveSourceTypeName } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { Box, Button, CardContent, CardHeader, Paper, Tab, Typography } from '@mui/material'
import { SUPPORTED_PROVIDERS } from '../../constants.js'
import { CollectiblePaper } from './CollectiblePaper.js'
import { LinkingAvatar } from '../Shared/LinkingAvatar.js'
import { AboutTab } from './tabs/AboutTab.js'
import { ActivitiesTab } from './tabs/ActivitiesTab.js'
import { DetailsTab } from './tabs/DetailsTab.js'
import { OffersTab } from './tabs/OffersTab.js'
import { Context } from '../Context/index.js'
import { useI18N, useSwitcher } from '../../../../../utils/index.js'

const useStyles = makeStyles()((theme) => {
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
            maxHeight: 800,
            borderRadius: '0 0 12px 12px',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            background: '#fff !important',
        },
        footer: {
            marginTop: -1,
            zIndex: 1,
            position: 'relative',
            borderTop: `solid 1px ${theme.palette.divider}`,
            justifyContent: 'space-between',
        },
        tabs: {
            height: 'var(--tabHeight)',
            width: '100%',
            minHeight: 'unset',
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
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
            fontSize: 14,
            marginRight: theme.spacing(0.5),
            maxHeight: '3rem',
            overflow: 'hidden',
            wordBreak: 'break-word',
            color: theme.palette.maskColor.publicSecond,
        },
        description: {
            fontSize: 12,
            '& > strong': {
                color: theme.palette.text.primary,
                fontWeight: 300,
            },
        },
        footMenu: {
            color: theme.palette.text.secondary,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
        },
        footName: {
            color: theme.palette.text.primary,
            marginLeft: theme.spacing(0.5),
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
        loading: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(8, 0),
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
            fontSize: 16,
            lineHeight: '20px',
            fontWeight: 700,
            color: theme.palette.maskColor.publicMain,
        },
    }
})

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { asset, events, orders, sourceType, setSourceType } = Context.useContainer()

    // #region provider switcher
    const CollectibleProviderSwitcher = useSwitcher(
        sourceType,
        setSourceType,
        SUPPORTED_PROVIDERS,
        resolveSourceTypeName,
        true,
    )
    // #endregion
    const [currentTab, onChange, tabs] = useTabs('about', 'details', 'offers', 'activities')
    if (asset.loading)
        return (
            <Box
                flex={1}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1}
                padding={1}
                minHeight={148}>
                <LoadingBase />
                <Typography>{t('loading')}</Typography>
            </Box>
        )
    if (!asset.value)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography color={MaskColorVar.textPluginColor} sx={{ marginTop: 8, marginBottom: 8 }}>
                    {t('plugin_collectible_failed_load', { source: resolveSourceTypeName(sourceType) })}
                </Typography>
                <Box alignItems="center" sx={{ padding: 1, display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <Box sx={{ flex: 1, padding: 1 }}> {CollectibleProviderSwitcher}</Box>
                    <Box sx={{ flex: 1, padding: 1 }}>
                        <Button fullWidth onClick={() => asset.retry()} variant="roundedDark">
                            {t('plugin_collectible_refresh')}
                        </Button>
                    </Box>
                </Box>
            </Box>
        )

    const _asset = asset.value
    const endDate = _asset.auction?.endAt
    const renderTab = () => {
        const tabMap = {
            [tabs.about]: <AboutTab asset={asset} />,
            [tabs.details]: <DetailsTab asset={asset} />,
            [tabs.offers]: <OffersTab offers={orders} />,
            [tabs.activities]: <ActivitiesTab events={events} />,
        }

        return tabMap[currentTab] || null
    }
    const Tabs = [
        { value: tabs.about, label: t('plugin_collectible_about') },
        { value: tabs.details, label: t('plugin_collectible_details') },
        { value: tabs.offers, label: t('plugin_collectible_offers') },
        { value: tabs.activities, label: t('plugin_collectible_activities') },
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
                        <Typography style={{ display: 'flex', alignItems: 'center' }}>
                            <span className={classes.cardTitle}>{_asset.metadata?.name || '-'}</span>
                            {_asset.collection?.verified ? (
                                <Icons.VerifiedCollection size={20} sx={{ marginLeft: 0.5 }} />
                            ) : null}
                        </Typography>
                    }
                    subheader={
                        <>
                            {_asset.metadata?.description ? (
                                <Box display="flex" alignItems="center">
                                    <Typography className={classes.subtitle} component="div" variant="body2">
                                        <Markdown
                                            classes={{ root: classes.markdown }}
                                            content={_asset.metadata.description}
                                        />
                                    </Typography>
                                </Box>
                            ) : null}
                        </>
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
            {endDate && isValidDate(endDate) && isAfter(endDate, Date.now()) && (
                <Box sx={{ marginTop: 1 }}>
                    <Typography className={classes.countdown}>
                        {t('plugin_collectible_sale_end', {
                            time: formatDateTime(endDate, 'yyyy-MM-dd HH:mm:ss'),
                        })}
                    </Typography>
                </Box>
            )}
        </>
    )
}
