import { useState, useEffect, useMemo } from 'react'
import { Avatar, Box, Button, CardContent, CardHeader, Link, Paper, Tab, Tabs, Typography } from '@mui/material'
import { Markdown } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useI18N } from '../../../utils/index.js'
import { ArticleTab } from './ArticleTab.js'
import { TokenTab } from './TokenTab.js'
import { OfferTab } from './OfferTab.js'
import { HistoryTab } from './HistoryTab/index.js'
import { CollectibleState } from '../hooks/useCollectibleState.js'
import { CollectiblePaper } from './CollectiblePaper.js'
import { PluginSkeleton } from './PluginSkeleton.js'
import { TabState, TransactionType } from '../types/index.js'
import { resolveAssetLinkOnCryptoartAI, resolveWebLinkOnCryptoartAI } from '../pipes/index.js'
import { ActionBar } from './ActionBar.js'
import { useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { PLUGIN_NAME } from '../constants.js'

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
        failedText: {
            color: theme.palette.maskColor.dark,
        },
    }
})

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { asset, events, tabIndex, setTabIndex, chainId: expectChainId } = CollectibleState.useContainer()

    const assetSource = useMemo(() => {
        if (!asset.value || asset.error) return
        return asset.value
    }, [asset.value])

    const [soldPrice, setSoldPrice] = useState(0)
    useEffect(() => {
        if (
            assetSource?.is24Auction &&
            assetSource?.isSoldOut &&
            [TransactionType.BID_PLACED, TransactionType.SETTLED].includes(events.value?.data[0].transactionType)
        ) {
            setSoldPrice(events.value?.data[0].priceInEth)
        } else setSoldPrice(0)
    }, [asset, events])

    if (asset.loading) return <PluginSkeleton />
    if (!asset.value)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography className={classes.failedText} sx={{ marginTop: 8, marginBottom: 8 }}>
                    {t('plugin_collectible_failed_load', { source: PLUGIN_NAME })}
                </Typography>
                <Button
                    size="small"
                    variant="roundedContained"
                    sx={{
                        width: 254,
                        height: 40,
                        backgroundColor: (theme) => theme.palette.maskColor.publicMain,
                        color: (theme) => theme.palette.maskColor.white,
                        fontSize: 14,
                        fontWeight: 700,
                        marginBottom: 4,
                        marginTop: 2,
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.maskColor.publicMain,
                        },
                    }}
                    onClick={() => asset.retry()}>
                    {t('plugin_collectible_refresh')}
                </Button>
            </Box>
        )

    const tabs = [
        <Tab className={classes.tab} key="article" label={t('plugin_collectible_overview')} />,
        <Tab className={classes.tab} key="details" label={t('plugin_collectible_details')} />,
        <Tab className={classes.tab} key="offers" label={t('plugin_collectible_offers')} />,
        <Tab className={classes.tab} key="history" label={t('plugin_collectible_history')} />,
    ]

    return (
        <>
            <CollectiblePaper classes={{ root: classes.root }}>
                <CardHeader
                    avatar={
                        <Link
                            href={
                                resolveWebLinkOnCryptoartAI(chainId) +
                                '/' +
                                (assetSource?.owner[0]?.ownerName ?? assetSource?.creator?.username ?? '')
                            }
                            title={assetSource?.owner[0]?.ownerName ?? assetSource?.creator?.username ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Avatar
                                src={assetSource?.owner[0]?.ownerAvatar ?? assetSource?.creator?.avatarPath ?? ''}
                            />
                        </Link>
                    }
                    title={
                        <Typography style={{ display: 'flex', alignItems: 'center' }}>
                            {assetSource?.tokenUri && assetSource?.token_id ? (
                                <Link
                                    color="primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={resolveAssetLinkOnCryptoartAI(
                                        assetSource?.creator?.username,
                                        assetSource?.token_id,
                                        chainId,
                                    )}>
                                    {assetSource?.title ?? ''}
                                </Link>
                            ) : (
                                assetSource?.title ?? ''
                            )}
                            <VerifiedUserIcon color="primary" fontSize="small" sx={{ marginLeft: 0.5 }} />
                        </Typography>
                    }
                    subheader={
                        <>
                            {assetSource?.description ? (
                                <Box display="flex" alignItems="center">
                                    <Typography className={classes.subtitle} component="div" variant="body2">
                                        <Markdown content={assetSource?.description} />
                                    </Typography>
                                </Box>
                            ) : null}

                            {assetSource?.priceInEth > 100000 && !assetSource?.isSoldOut ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography className={classes.description} component="span">
                                        <Trans
                                            i18nKey="plugin_cryptoartai_no_price_description"
                                            values={{
                                                bidPrice: assetSource?.is24Auction
                                                    ? assetSource?.latestBidVo?.priceInEth
                                                    : assetSource?.trade?.latestBid,
                                                price: 'Unknown',
                                                symbol: ' \u039E',
                                                soldNum:
                                                    assetSource?.soldNum === assetSource?.totalAvailable
                                                        ? assetSource?.soldNum
                                                        : assetSource?.soldNum + 1,
                                                totalAvailable: assetSource?.totalAvailable,
                                                editionNumber: assetSource?.editionNumber,
                                            }}
                                        />
                                    </Typography>
                                </Box>
                            ) : (
                                ''
                            )}
                            {assetSource?.priceInEth && assetSource?.priceInEth <= 100000 && !assetSource?.isSoldOut ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography className={classes.description} component="span">
                                        <Trans
                                            i18nKey="plugin_cryptoartai_description"
                                            values={{
                                                bidPrice: assetSource?.is24Auction
                                                    ? assetSource?.latestBidVo?.priceInEth
                                                    : assetSource?.trade?.latestBid,
                                                price: assetSource?.priceInEth,
                                                symbol: ' \u039E',
                                                soldNum:
                                                    assetSource?.soldNum &&
                                                    assetSource?.soldNum === assetSource?.totalAvailable
                                                        ? assetSource?.soldNum
                                                        : Number(assetSource?.soldNum) + 1,
                                                totalAvailable: assetSource?.totalAvailable,
                                                editionNumber: assetSource?.editionNumber,
                                            }}
                                        />
                                    </Typography>
                                </Box>
                            ) : (
                                ''
                            )}
                            {assetSource?.is24Auction && assetSource?.isSoldOut ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography className={classes.description} component="span">
                                        <Trans
                                            i18nKey="plugin_cryptoartai_sold_description"
                                            values={{
                                                soldPrice,
                                                symbol: ' \u039E',
                                                soldNum:
                                                    assetSource?.soldNum === assetSource?.totalAvailable
                                                        ? assetSource?.soldNum
                                                        : assetSource?.soldNum + 1,
                                                totalAvailable: assetSource?.totalAvailable,
                                                editionNumber: assetSource?.editionNumber,
                                            }}
                                        />
                                    </Typography>
                                </Box>
                            ) : (
                                ''
                            )}
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
                        {tabIndex === TabState.ARTICLE ? <ArticleTab /> : null}
                        {tabIndex === TabState.TOKEN ? <TokenTab /> : null}
                        {tabIndex === TabState.OFFER ? <OfferTab /> : null}
                        {tabIndex === TabState.HISTORY ? <HistoryTab /> : null}
                    </Paper>
                </CardContent>
            </CollectiblePaper>
            <Box sx={{ display: 'flex', width: 'calc(100% - 24px)', padding: 1.5 }}>
                <ChainBoundary
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={expectChainId ?? chainId}
                    ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                    <ActionBar />
                </ChainBoundary>
            </Box>
        </>
    )
}
