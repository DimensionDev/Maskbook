import type { ReactElement } from 'react'
import { Box, Button, CardContent, CardHeader, Link, Paper, Tab, Tabs, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import formatDateTime from 'date-fns/format'
import isValidDate from 'date-fns/isValid'
import isAfter from 'date-fns/isAfter'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useI18N, useSettingsSwitcher } from '../../../utils'
import { ArticleTab } from './ArticleTab'
import { TokenTab } from './TokenTab'
import { OfferTab } from './OfferTab'
import { ListingTab } from './ListingTab'
import { HistoryTab } from './HistoryTab'
import { LinkingAvatar } from './LinkingAvatar'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleCard } from './CollectibleCard'
import { CollectibleTab } from '../types'
import { resolveAssetLinkOnCurrentProvider, resolveCollectibleProviderName } from '../pipes'
import { ActionBar } from './ActionBar'
import { NonFungibleAssetProvider, useChainId } from '@masknet/web3-shared-evm'
import { getEnumAsArray } from '@dimensiondev/kit'
import { LoadingAnimation } from '@masknet/shared'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { currentNonFungibleAssetProviderSettings } from '../settings'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
        },
        content: {
            width: '100%',
            height: 'var(--contentHeight)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
        },
        body: {
            flex: 1,
            overflow: 'auto',
            maxHeight: 350,
            borderRadius: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            height: 'var(--tabHeight)',
            width: '100%',
            minHeight: 'unset',
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        tab: {
            height: 'var(--tabHeight)',
            minHeight: 'unset',
            minWidth: 'unset',
            whiteSpace: 'nowrap',
        },
        subtitle: {
            fontSize: 12,
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
            'text-overflow': 'ellipsis',
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '3',
        },
    }
})

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const { token, asset, provider, tabIndex, setTabIndex } = CollectibleState.useContainer()

    // #region provider switcher
    const CollectibleProviderSwitcher = useSettingsSwitcher(
        currentNonFungibleAssetProviderSettings,
        getEnumAsArray(NonFungibleAssetProvider).map((x) => x.value),
        resolveCollectibleProviderName,
    )
    // #endregion

    if (!asset.value || !token)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography color="textPrimary" sx={{ marginTop: 8, marginBottom: 8 }}>
                    Failed to load your collectible on {resolveCollectibleProviderName(provider)}.
                </Typography>
                {CollectibleProviderSwitcher}
                <Button
                    color="primary"
                    size="small"
                    variant="text"
                    onClick={() => asset.retry()}
                    sx={{ marginTop: 1.5 }}>
                    Refresh
                </Button>
            </Box>
        )
    const tabs = [
        <Tab className={classes.tab} key="article" label={t('plugin_collectible_article')} />,
        <Tab className={classes.tab} key="details" label={t('plugin_collectible_details')} />,
        <Tab className={classes.tab} key="offers" label={t('plugin_collectible_offers')} />,
        <Tab className={classes.tab} key="listing" label={t('plugin_collectible_listing')} />,
        <Tab className={classes.tab} key="history" label={t('plugin_collectible_history')} />,
    ]

    const renderTab = (tabIndex: CollectibleTab) => {
        const tabMap: Record<CollectibleTab, ReactElement> = {
            [CollectibleTab.ARTICLE]: <ArticleTab />,
            [CollectibleTab.TOKEN]: <TokenTab />,
            [CollectibleTab.OFFER]: <OfferTab />,
            [CollectibleTab.LISTING]: <ListingTab />,
            [CollectibleTab.HISTORY]: <HistoryTab />,
        }

        return tabMap[tabIndex] || null
    }

    const _asset = asset.value
    const endDate = _asset.end_time
    return (
        <>
            <CollectibleCard classes={{ root: classes.root }}>
                <CardHeader
                    avatar={
                        <LinkingAvatar
                            href={_asset.collectionLinkUrl}
                            title={_asset.owner?.user?.username ?? _asset.owner?.address ?? ''}
                            src={
                                _asset.collection?.image_url ??
                                _asset.creator?.profile_img_url ??
                                _asset.owner?.profile_img_url ??
                                ''
                            }
                        />
                    }
                    title={
                        <Typography style={{ display: 'flex', alignItems: 'center' }}>
                            {token ? (
                                <Link
                                    color="primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={resolveAssetLinkOnCurrentProvider(
                                        chainId,
                                        token.contractAddress,
                                        token.tokenId,
                                        provider,
                                    )}>
                                    {_asset.name ?? ''}
                                </Link>
                            ) : (
                                _asset.name ?? ''
                            )}
                            {_asset.safelist_request_status === 'verified' ? (
                                <VerifiedUserIcon color="primary" fontSize="small" sx={{ marginLeft: 0.5 }} />
                            ) : null}
                        </Typography>
                    }
                    subheader={
                        <>
                            {_asset.description ? (
                                <Box display="flex" alignItems="center">
                                    <Typography className={classes.subtitle} component="div" variant="body2">
                                        <Markdown classes={{ root: classes.markdown }} content={_asset.description} />
                                    </Typography>
                                </Box>
                            ) : null}

                            {_asset?.current_price ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography className={classes.description} component="span">
                                        <Trans
                                            i18nKey="plugin_collectible_description"
                                            values={{
                                                price: _asset?.current_price,
                                                symbol: _asset?.current_symbol,
                                            }}
                                        />
                                    </Typography>
                                </Box>
                            ) : null}
                        </>
                    }
                />
                <CardContent className={classes.content}>
                    <Tabs
                        className={classes.tabs}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        value={tabIndex}
                        onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                        TabIndicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}>
                        {tabs}
                    </Tabs>
                    <Paper className={classes.body}>
                        {(asset.loading && (
                            <div className={classes.loading}>
                                <LoadingAnimation />
                            </div>
                        )) || <>{renderTab(tabIndex)}</>}
                    </Paper>
                </CardContent>
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
            {provider === NonFungibleAssetProvider.OPENSEA ? <ActionBar /> : null}
        </>
    )
}
