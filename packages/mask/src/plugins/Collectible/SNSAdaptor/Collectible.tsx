import { useCallback } from 'react'
import {
    Avatar,
    Box,
    Button,
    CardActions,
    CardContent,
    CardHeader,
    Link,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import { findIndex } from 'lodash-unified'
import formatDateTime from 'date-fns/format'
import isValidDate from 'date-fns/isValid'
import isAfter from 'date-fns/isAfter'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useI18N, useSettingsSwitcher } from '../../../utils'
import { ArticleTab } from './ArticleTab'
import { TokenTab } from './TokenTab'
import { OfferTab } from './OfferTab'
import { ListingTab } from './ListingTab'
import { HistoryTab } from './HistoryTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleCard } from './CollectibleCard'
import { CollectibleProviderIcon } from './CollectibleProviderIcon'
import { PluginSkeleton } from './PluginSkeleton'
import { CollectibleProvider, CollectibleTab } from '../types'
import { currentCollectibleProviderSettings } from '../settings'
import { MaskTextIcon } from '../../../resources/MaskIcon'
import { resolveAssetLinkOnOpenSea, resolveCollectibleProviderName } from '../pipes'
import { ActionBar } from './ActionBar'
import { useChainId } from '@masknet/web3-shared-evm'
import { getEnumAsArray } from '@dimensiondev/kit'
import { FootnoteMenu, FootnoteMenuOption } from '../../Trader/SNSAdaptor/trader/FootnoteMenu'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'

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
        footnote: {
            fontSize: 10,
            marginRight: theme.spacing(1),
        },
        footLink: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
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
        mask: {
            width: 40,
            height: 10,
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
    const { asset, provider, tabIndex, setTabIndex } = CollectibleState.useContainer()

    //#region sync with settings
    const collectibleProviderOptions = getEnumAsArray(CollectibleProvider)
    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentCollectibleProviderSettings.value = option.value as CollectibleProvider
    }, [])
    //#endregion

    //#region provider switcher
    const CollectibleProviderSwitcher = useSettingsSwitcher(
        currentCollectibleProviderSettings,
        getEnumAsArray(CollectibleProvider).map((x) => x.value),
        resolveCollectibleProviderName,
    )
    //#endregion

    if (asset.loading) return <PluginSkeleton />
    if (!asset.value)
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

    const endDate = asset.value?.end_time
    return (
        <>
            <CollectibleCard classes={classes}>
                <CardHeader
                    avatar={
                        <Link
                            href={asset.value.owner?.link}
                            title={asset.value.owner?.user?.username ?? asset.value.owner?.address ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Avatar src={asset.value.owner?.profile_img_url ?? ''} />
                        </Link>
                    }
                    title={
                        <Typography style={{ display: 'flex', alignItems: 'center' }}>
                            {asset.value.token_address && asset.value.token_id ? (
                                <Link
                                    color="primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={resolveAssetLinkOnOpenSea(
                                        chainId,
                                        asset.value.token_address,
                                        asset.value.token_id,
                                    )}>
                                    {asset.value.name ?? ''}
                                </Link>
                            ) : (
                                asset.value.name ?? ''
                            )}
                            {asset.value.safelist_request_status === 'verified' ? (
                                <VerifiedUserIcon color="primary" fontSize="small" sx={{ marginLeft: 0.5 }} />
                            ) : null}
                        </Typography>
                    }
                    subheader={
                        <>
                            {asset.value.description ? (
                                <Box display="flex" alignItems="center">
                                    <Typography className={classes.subtitle} component="div" variant="body2">
                                        <Markdown
                                            classes={{ root: classes.markdown }}
                                            content={asset.value.description}
                                        />
                                    </Typography>
                                </Box>
                            ) : null}

                            {asset.value?.current_price ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography className={classes.description} component="span">
                                        <Trans
                                            i18nKey="plugin_collectible_description"
                                            values={{
                                                price: asset.value?.current_price,
                                                symbol: asset.value?.current_symbol,
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
                        {tabIndex === CollectibleTab.ARTICLE ? <ArticleTab /> : null}
                        {tabIndex === CollectibleTab.TOKEN ? <TokenTab /> : null}
                        {tabIndex === CollectibleTab.OFFER ? <OfferTab /> : null}
                        {tabIndex === CollectibleTab.LISTING ? <ListingTab /> : null}
                        {tabIndex === CollectibleTab.HISTORY ? <HistoryTab /> : null}
                    </Paper>
                </CardContent>
                <CardActions className={classes.footer}>
                    <Typography className={classes.footnote} variant="subtitle2">
                        <span>{t('plugin_powered_by')} </span>
                        <Link
                            className={classes.footLink}
                            color="textSecondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Mask"
                            href="https://mask.io">
                            <MaskTextIcon classes={{ root: classes.mask }} viewBox="0 0 80 20" />
                        </Link>
                    </Typography>
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
            {provider === CollectibleProvider.OPENSEA ? <ActionBar /> : null}
        </>
    )
}
