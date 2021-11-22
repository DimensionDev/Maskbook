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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useI18N } from '../../../utils'
import { ArticleTab } from './ArticleTab'
import { TokenTab } from './TokenTab'
import { OfferTab } from './OfferTab'
import { HistoryTab } from './HistoryTab'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleCard } from './CollectibleCard'
import { PluginSkeleton } from './PluginSkeleton'
import { CryptoartAITab } from '../types'
import { MaskTextIcon } from '../../../resources/MaskIcon'
import { resolveAssetLinkOnCryptoartAI } from '../pipes'
import { Markdown } from '../../Snapshot/SNSAdaptor/Markdown'
import { ActionBar } from './ActionBar'
import { useChainId } from '@masknet/web3-shared-evm'
import { resolveWebLinkOnCryptoartAI } from '../pipes'

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
    }
})

export interface CollectibleProps {}

export function Collectible(props: CollectibleProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const { asset, tabIndex, setTabIndex } = CollectibleState.useContainer()

    if (asset.loading) return <PluginSkeleton />
    if (!asset.value)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography color="textPrimary" sx={{ marginTop: 8, marginBottom: 8 }}>
                    Failed to load your collectible on CRYPTOART.AI.
                </Typography>
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
        <Tab className={classes.tab} key="article" label={t('plugin_collectible_overview')} />,
        <Tab className={classes.tab} key="details" label={t('plugin_collectible_details')} />,
        <Tab className={classes.tab} key="offers" label={t('plugin_collectible_offers')} />,
        <Tab className={classes.tab} key="history" label={t('plugin_collectible_history')} />,
    ]

    return (
        <>
            <CollectibleCard classes={classes}>
                <CardHeader
                    avatar={
                        <Link
                            href={
                                resolveWebLinkOnCryptoartAI(chainId) +
                                '/' +
                                (asset.value.owner[0]?.ownerName ?? asset.value.creator?.username ?? '')
                            }
                            title={asset.value.owner[0]?.ownerName ?? asset.value.creator?.username ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Avatar src={asset.value.owner[0]?.ownerAvator ?? asset.value.creator?.avatorPath ?? ''} />
                        </Link>
                    }
                    title={
                        <Typography style={{ display: 'flex', alignItems: 'center' }}>
                            {asset.value.tokenUri && asset.value.token_id ? (
                                <Link
                                    color="primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={resolveAssetLinkOnCryptoartAI(
                                        asset.value.creator?.username,
                                        asset.value.token_id,
                                        chainId,
                                    )}>
                                    {asset.value.title ?? ''}
                                </Link>
                            ) : (
                                asset.value.title ?? ''
                            )}
                            <VerifiedUserIcon color="primary" fontSize="small" sx={{ marginLeft: 0.5 }} />
                        </Typography>
                    }
                    subheader={
                        <>
                            {asset.value.description ? (
                                <Box display="flex" alignItems="center">
                                    <Typography className={classes.subtitle} component="div" variant="body2">
                                        <Markdown content={asset.value.description} />
                                    </Typography>
                                </Box>
                            ) : null}

                            {asset.value?.priceInEth ? (
                                <Box display="flex" alignItems="center" sx={{ marginTop: 1 }}>
                                    <Typography className={classes.description} component="span">
                                        <Trans
                                            i18nKey="plugin_cryptoartai_description"
                                            values={{
                                                bidprice: asset.value?.latestBidVo?.priceInEth ?? 0,
                                                price:
                                                    asset.value?.priceInEth > 100000
                                                        ? 'Unknown'
                                                        : asset.value?.priceInEth,
                                                symbol: ' Ξ',
                                                soldNum:
                                                    asset.value?.soldNum === asset.value?.totalAvailable
                                                        ? asset.value?.soldNum
                                                        : asset.value?.soldNum + 1,
                                                totalAvailable: asset.value?.totalAvailable,
                                                editionNumber: asset.value?.editionNumber,
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
                        {tabIndex === CryptoartAITab.ARTICLE ? <ArticleTab /> : null}
                        {tabIndex === CryptoartAITab.TOKEN ? <TokenTab /> : null}
                        {tabIndex === CryptoartAITab.OFFER ? <OfferTab /> : null}
                        {tabIndex === CryptoartAITab.HISTORY ? <HistoryTab /> : null}
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
                    <div className={classes.footMenu} />
                </CardActions>
            </CollectibleCard>
            <ActionBar />
        </>
    )
}
