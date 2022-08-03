import { useCallback } from 'react'
import { Box, Button, CardContent, CardHeader, Paper, Tab, Typography } from '@mui/material'
import { makeStyles, MaskColorVar, MaskTabList, useTabs } from '@masknet/theme'
import formatDateTime from 'date-fns/format'
import isValidDate from 'date-fns/isValid'
import isAfter from 'date-fns/isAfter'
import { useI18N, useSwitcher } from '../../../utils'
import { LinkingAvatar } from './LinkingAvatar'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleCard } from './CollectibleCard'
import { ActionBar } from './OpenSea/ActionBar'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, resolveSourceName, SourceType } from '@masknet/web3-shared-base'
import type { FootnoteMenuOption } from '../../Trader/SNSAdaptor/trader/components/FootnoteMenuUI'
import { getEnumAsArray } from '@dimensiondev/kit'
import { TabContext } from '@mui/lab'
import { AboutTab } from './Tabs/AboutTab'
import { DetailTab } from './Tabs/DetailTab'
import { Icons } from '@masknet/icons'
import { OffersTab } from './Tabs/OffersTab'
import { ActivityTab } from './Tabs/ActivityTab'

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
            maxHeight: 350,
            borderRadius: '0 0 12px 12px',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
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
        },
        subtitle: {
            fontSize: 14,
            marginRight: theme.spacing(0.5),
            maxHeight: '3.5rem',
            overflow: 'hidden',
            wordBreak: 'break-word',
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
            display: '-webkit-box',
            webkitBoxOrient: 'vertical',
            webkitLineClamp: '3',
        },
        cardTitle: {
            fontSize: 16,
            lineHeight: '20px',
            fontWeight: 700,
            color: theme.palette.maskColor.main,
        },
    }
})

const supportedProvider = [SourceType.OpenSea, SourceType.Rarible, SourceType.NFTScan]

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { token, asset, provider, setProvider } = CollectibleState.useContainer()

    // #region sync with settings
    const collectibleProviderOptions = getEnumAsArray(SourceType).filter((x) => supportedProvider.includes(x.value))

    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setProvider(option.value as SourceType)
    }, [])
    // #endregion

    // #region provider switcher
    const CollectibleProviderSwitcher = useSwitcher(provider, setProvider, supportedProvider, resolveSourceName, true)
    // #endregion
    const [currentTab, onChange, tabs, setTab] = useTabs('about', 'details', 'offers', 'activity')

    if (!asset.value || !token)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography color={MaskColorVar.textPluginColor} sx={{ marginTop: 8, marginBottom: 8 }}>
                    Failed to load your collectible on {resolveSourceName(provider)}.
                </Typography>
                <Box alignItems="center" sx={{ padding: 1, display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <Box sx={{ flex: 1, padding: 1 }}> {CollectibleProviderSwitcher}</Box>
                    <Box sx={{ flex: 1, padding: 1 }}>
                        <Button fullWidth onClick={() => asset.retry()} variant="roundedDark">
                            Refresh
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
            [tabs.offers]: <OffersTab asset={asset} />,
            [tabs.activity]: <ActivityTab asset={asset} />,
        }

        return tabMap[currentTab] || null
    }
    return (
        <>
            <CollectibleCard classes={{ root: classes.root }}>
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
                            <Typography className={classes.cardTitle}>{_asset.metadata?.name ?? ''}</Typography>
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
                            <Tab className={classes.tab} value={tabs.about} label={t('plugin_collectible_about')} />
                            <Tab className={classes.tab} value={tabs.details} label={t('plugin_collectible_details')} />
                            <Tab className={classes.tab} value={tabs.offers} label={t('plugin_collectible_offers')} />
                            <Tab
                                className={classes.tab}
                                value={tabs.activity}
                                label={t('plugin_collectible_activity')}
                            />
                        </MaskTabList>
                    </TabContext>
                    <Paper className={classes.body}>{renderTab()}</Paper>
                </CardContent>
                {/* <CardActions className={classes.footer}>
                    <div />
                    <div className={classes.footMenu}>
                        <FootnoteMenuUI
                            options={collectibleProviderOptions.map((x) => ({
                                name: (
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        <CollectibleProviderIcon provider={x.value} />
                                        <span className={classes.footName}>{resolveSourceName(x.value)}</span>
                                    </Stack>
                                ),
                                value: x.value,
                            }))}
                            selectedIndex={findIndex(collectibleProviderOptions, (x) => x.value === provider)}
                            onChange={onDataProviderChange}
                        />
                    </div>
                </CardActions> */}
            </CollectibleCard>
            {endDate && isValidDate(endDate) && isAfter(endDate, Date.now()) && (
                <Box sx={{ marginTop: 1 }}>
                    <Typography className={classes.countdown}>
                        {t('plugin_collectible_sale_end', {
                            time: formatDateTime(endDate, 'yyyy-MM-dd HH:mm:ss'),
                        })}
                    </Typography>
                </Box>
            )}
            {provider === SourceType.OpenSea ? <ActionBar /> : null}
        </>
    )
}
