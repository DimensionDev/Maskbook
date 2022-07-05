import { ReactElement, useCallback } from 'react'
import {
    Box,
    Button,
    CardActions,
    CardContent,
    CardHeader,
    Link,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Trans } from 'react-i18next'
import formatDateTime from 'date-fns/format'
import isValidDate from 'date-fns/isValid'
import isAfter from 'date-fns/isAfter'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useI18N, useSwitcher } from '../../../utils'
import { ArticleTab } from './ArticleTab'
import { TokenTab } from './TokenTab'
import { OfferTab } from './OfferTab'
import { ListingTab } from './ListingTab'
import { HistoryTab } from './HistoryTab'
import { LinkingAvatar } from './LinkingAvatar'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleCard } from './CollectibleCard'
import { CollectibleTab } from '../types'
import { resolveAssetLinkOnCurrentProvider } from '../pipes'
import { ActionBar } from './OpenSea/ActionBar'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { useChainId } from '@masknet/plugin-infra/web3'
import { CurrencyType, NetworkPluginID, resolveSourceName, SourceType } from '@masknet/web3-shared-base'
import { FootnoteMenu, FootnoteMenuOption } from '../../Trader/SNSAdaptor/trader/FootnoteMenu'
import { CollectibleProviderIcon } from './CollectibleProviderIcon'
import { getEnumAsArray } from '@dimensiondev/kit'
import { findIndex } from 'lodash-unified'

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

const supportedProvider = [SourceType.OpenSea, SourceType.Rarible, SourceType.NFTScan]

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { token, asset, provider, setProvider, tabIndex, setTabIndex } = CollectibleState.useContainer()

    // #region sync with settings
    const collectibleProviderOptions = getEnumAsArray(SourceType).filter((x) => supportedProvider.includes(x.value))

    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setProvider(option.value as SourceType)
    }, [])
    // #endregion

    // #region provider switcher
    const CollectibleProviderSwitcher = useSwitcher(provider, setProvider, supportedProvider, resolveSourceName, true)
    // #endregion

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
    const endDate = _asset.auction?.endAt
    return (
        <>
            <CollectibleCard classes={{ root: classes.root }}>
                <CardHeader
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
                                    {_asset.metadata?.name ?? ''}
                                </Link>
                            ) : (
                                _asset.metadata?.name ?? ''
                            )}
                            {_asset.collection?.verified ? (
                                <VerifiedUserIcon color="primary" fontSize="small" sx={{ marginLeft: 0.5 }} />
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

                            {_asset?.price?.[CurrencyType.USD] ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography className={classes.description} component="span">
                                        <Trans
                                            i18nKey="plugin_collectible_description"
                                            values={{
                                                price: _asset?.price[CurrencyType.USD],
                                                symbol: CurrencyType.USD,
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
                    <Paper className={classes.body}>{renderTab(tabIndex)}</Paper>
                </CardContent>
                <CardActions className={classes.footer}>
                    {/* flex to make foot menu right */}
                    <div />
                    <div className={classes.footMenu}>
                        <FootnoteMenu
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
            {provider === SourceType.OpenSea ? <ActionBar /> : null}
        </>
    )
}
