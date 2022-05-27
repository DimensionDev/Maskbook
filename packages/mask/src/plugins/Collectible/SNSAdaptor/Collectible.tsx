import { ReactElement, useCallback } from 'react'
import { Box, Button, CardActions, CardContent, CardHeader, Link, Paper, Tab, Tabs, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Trans } from 'react-i18next'
import { findIndex } from 'lodash-unified'
import formatDateTime from 'date-fns/format'
import isValidDate from 'date-fns/isValid'
import isAfter from 'date-fns/isAfter'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useI18N, useSwitcher } from '../../../utils'
import { ArticleTab } from './ArticleTab'
import { TokenTab } from './TokenTab'
import { OfferTab } from './OfferTab'
import { ListingTab } from './ListingTab'
import { HistoryTab } from './HistoryTab'
import { LinkingAvatar } from './LinkingAvatar'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleCard } from './CollectibleCard'
import { CollectibleProviderIcon } from './CollectibleProviderIcon'
import { CollectibleTab } from '../types'
import { resolveAssetLinkOnCurrentProvider, resolveCollectibleProviderName } from '../pipes'
import { ActionBar } from './ActionBar'
import { NonFungibleAssetProvider, useChainId } from '@masknet/web3-shared-evm'
import { getEnumAsArray } from '@dimensiondev/kit'
import { FootnoteMenu, FootnoteMenuOption } from '../../Trader/SNSAdaptor/trader/FootnoteMenu'
import { LoadingAnimation } from '@masknet/shared'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
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
        footMenu: {
            color: theme.palette.text.secondary,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
        },
        footName: {
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
    }
})

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const { token, asset, provider, setProvider, tabIndex, setTabIndex } = CollectibleState.useContainer()

    // #region sync with settings
    const collectibleProviderOptions = getEnumAsArray(NonFungibleAssetProvider)
    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setProvider(option.value as NonFungibleAssetProvider)
    }, [])
    // #endregion

    // #region provider switcher
    const CollectibleProviderSwitcher = useSwitcher(
        provider,
        setProvider,
        getEnumAsArray(NonFungibleAssetProvider).map((x) => x.value),
        resolveCollectibleProviderName,
        true,
    )
    // #endregion

    if (!asset.value || !token)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography color={MaskColorVar.textPluginColor} sx={{ marginTop: 8, marginBottom: 8 }}>
                    Failed to load your collectible on {resolveCollectibleProviderName(provider)}.
                </Typography>
                <Box alignItems="center" sx={{ padding: 1, display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <Box sx={{ flex: 1, padding: 1 }}> {CollectibleProviderSwitcher}</Box>
                    <Box sx={{ flex: 1, padding: 1 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => asset.retry()}
                            sx={{
                                marginTop: 1,
                                backgroundColor: MaskColorVar.textPluginColor,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: MaskColorVar.textPluginColor,
                                },
                            }}>
                            Refresh
                        </Button>
                    </Box>
                </Box>
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
                <CardActions className={classes.footer}>
                    {/* flex to make foot menu right */}
                    <div />
                    <div className={classes.footMenu}>
                        <FootnoteMenu
                            options={collectibleProviderOptions.map((x) => ({
                                name: (
                                    <>
                                        <CollectibleProviderIcon provider={x.value} />
                                        <span className={classes.footName}>
                                            {resolveCollectibleProviderName(x.value)}
                                        </span>
                                    </>
                                ),
                                value: x.value,
                            }))}
                            selectedIndex={findIndex(collectibleProviderOptions, (x) => x.value === provider)}
                            onChange={onDataProviderChange}
                        />
                        <ArrowDropDownIcon />
                    </div>
                </CardActions>
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
