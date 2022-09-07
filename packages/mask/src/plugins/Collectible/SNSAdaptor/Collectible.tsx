import { Icons } from '@masknet/icons'
import { LoadingBase, makeStyles, MaskColorVar, MaskTabList, useTabs } from '@masknet/theme'
import { resolveSourceName } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { Box, Button, CardContent, CardHeader, Paper, Tab, Typography } from '@mui/material'
import formatDateTime from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import isValidDate from 'date-fns/isValid'
import { useI18N, useSwitcher } from '../../../utils'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { SupportedProvider } from '../constants'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectiblePaper } from './CollectiblePaper'
import { LinkingAvatar } from './LinkingAvatar'
import { AboutTab } from './Tabs/AboutTab'
import { ActivityTab } from './Tabs/ActivityTab'
import { DetailTab } from './Tabs/DetailTab'
import { OffersTab } from './Tabs/OffersTab'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            padding: 0,
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
        },
        body: {
            flex: 1,
            backgroundColor: theme.palette.maskColor.white,
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
            marginTop: -1, // merge duplicate borders
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
            color: theme.palette.maskColor.publicMain,
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
            maxHeight: '3.5rem',
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
            textOverflow: 'ellipsis',
            webkitBoxOrient: 'vertical',
            webkitLineClamp: '3',
            '& > p': {
                color: `${theme.palette.maskColor.publicSecond} !important`,
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
    const { asset, provider, setProvider } = CollectibleState.useContainer()

    // #region provider switcher
    const CollectibleProviderSwitcher = useSwitcher(provider, setProvider, SupportedProvider, resolveSourceName, true)
    // #endregion
    const [currentTab, onChange, tabs] = useTabs('about', 'details', 'offers', 'activity')
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
                    Failed to load your collectible on {resolveSourceName(provider)}.
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
            [tabs.details]: <DetailTab asset={asset} />,
            [tabs.offers]: <OffersTab />,
            [tabs.activity]: <ActivityTab />,
        }

        return tabMap[currentTab] || null
    }
    const Tabs = [
        { value: tabs.about, label: t('plugin_collectible_about') },
        { value: tabs.details, label: t('plugin_collectible_details') },
        { value: tabs.offers, label: t('plugin_collectible_offers') },
        { value: tabs.activity, label: t('plugin_collectible_activity') },
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
                            src={
                                _asset.collection?.iconURL ?? _asset.creator?.avatarURL ?? _asset.owner?.avatarURL ?? ''
                            }
                        />
                    }
                    title={
                        <Typography style={{ display: 'flex', alignItems: 'center' }}>
                            <span className={classes.cardTitle}>{_asset.metadata?.name || '-'}</span>
                            {_asset.collection?.verified ? <Icons.VerifiedCollection sx={{ marginLeft: 0.5 }} /> : null}
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
                    <Paper className={classes.body}>{renderTab()}</Paper>
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
