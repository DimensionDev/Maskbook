import { useCallback } from 'react'
import { openWindow, useValueRef } from '@masknet/shared-base-ui'
import { Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { ConnectPersonaBoundary, LoadingStatus, PluginWalletStatusBar, ReloadStatus } from '@masknet/shared'
import { PluginID, NetworkPluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { SourceType, resolveSourceTypeName } from '@masknet/web3-shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { AboutTab } from './tabs/AboutTab.js'
import { OffersTab } from './tabs/OffersTab.js'
import { ActivitiesTab } from './tabs/ActivitiesTab.js'
import { TabType } from '../../types.js'
import { FigureCard } from '../Shared/FigureCard.js'
import { Context } from '../Context/index.js'
import { useI18N } from '../../locales/i18n_generated.js'
import {
    useAllPersonas,
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useSiteAdaptorContext,
} from '@masknet/plugin-infra/content-script'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
        contentWrapper: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        mediaBox: {
            width: 300,
        },
        contentLayout: {
            width: '100%',
            height: '100%',
            display: 'flex',
            padding: 24,
            boxSizing: 'border-box',
            paddingBottom: 72,
        },
        tabWrapper: {
            width: 'calc(100% - 336px)',
            marginLeft: 36,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        footer: {
            boxShadow:
                theme.palette.mode === 'dark'
                    ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                    : '0px 0px 20px rgba(0, 0, 0, 0.05)',
            position: 'sticky',
            bottom: 0,
        },
        buttonText: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
    }),
)

export interface CardDialogContentProps {
    currentTab: TabType
    open: boolean
    setOpen: (opened: boolean) => void
}

export function CardDialogContent(props: CardDialogContentProps) {
    const { currentTab } = props
    const { classes } = useStyles()
    const t = useI18N()
    const {
        asset,
        orders,
        offers,
        origin,
        parentPluginID = NetworkPluginID.PLUGIN_EVM,
        pluginID,
        chainId,
    } = Context.useContainer()
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const lastRecognized = useLastRecognizedIdentity()
    const { currentPersonaIdentifier, openDashboard } = useSiteAdaptorContext()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const personas = useAllPersonas()
    const onBeforeAction = useCallback(() => {
        props.setOpen(false)
    }, [props.setOpen])

    const onPFPButtonClick = useCallback(() => {
        CrossIsolationMessages.events.avatarSettingDialogEvent.sendToLocal({
            open: true,
            startPicking: true,
        })
    }, [])

    const onMoreButtonClick = useCallback(() => {
        const link = asset.data?.link

        if (link) {
            openWindow(link)
            props.setOpen(false)
        }
    }, [asset.data?.link])

    if (asset.isLoading) return <LoadingStatus height="100%" />
    if (!asset.data) return <ReloadStatus height="100%" message={t.load_failed()} onRetry={asset.refetch} />

    // Links of Solana NFTs might be incorrect, we discard them temporarily.
    const externalLink = pluginID !== NetworkPluginID.PLUGIN_SOLANA && asset.data.source ? asset.data.link : null
    return (
        <div className={classes.contentWrapper}>
            <div className={classes.contentLayout}>
                <div className={classes.mediaBox}>
                    <FigureCard timeline asset={asset.data} />
                </div>

                <div className={classes.tabWrapper}>
                    {currentTab === TabType.About ? (
                        <AboutTab orders={offers} asset={asset.data} />
                    ) : currentTab === TabType.Offers ? (
                        <OffersTab
                            offers={offers}
                            loading={orders.isLoading}
                            finished={!orders.hasNextPage}
                            onNext={orders.fetchNextPage}
                            onRetry={orders.refetch}
                        />
                    ) : (
                        <ActivitiesTab />
                    )}
                </div>
            </div>

            <Web3ContextProvider value={{ pluginID: parentPluginID }}>
                <PluginWalletStatusBar className={classes.footer} expectedPluginID={pluginID} expectedChainId={chainId}>
                    {origin === 'pfp' && currentVisitingIdentity?.isOwner ? (
                        <ConnectPersonaBoundary
                            personas={personas}
                            identity={lastRecognized}
                            currentPersonaIdentifier={currentIdentifier}
                            openDashboard={openDashboard}
                            handlerPosition="top-right"
                            customHint
                            directTo={PluginID.Avatar}
                            beforeAction={onBeforeAction}>
                            <Button
                                sx={{ display: 'flex', alignItems: 'center' }}
                                variant="contained"
                                size="medium"
                                onClick={onPFPButtonClick}
                                fullWidth>
                                <Icons.Avatar size={20} />
                                <span className={classes.buttonText}>{t.plugin_collectibles_pfp_button()}</span>
                            </Button>
                        </ConnectPersonaBoundary>
                    ) : externalLink ? (
                        <Button
                            sx={{ display: 'flex', alignItems: 'center' }}
                            variant="contained"
                            size="medium"
                            onClick={onMoreButtonClick}
                            fullWidth>
                            <span className={classes.buttonText}>
                                {t.plugin_collectibles_more_on_button({
                                    provider:
                                        asset.data.source === SourceType.NFTScan
                                            ? resolveSourceTypeName(asset.data.source)
                                            : 'platform',
                                })}
                            </span>
                            <Icons.LinkOut size={16} />
                        </Button>
                    ) : (
                        <div />
                    )}
                </PluginWalletStatusBar>
            </Web3ContextProvider>
        </div>
    )
}
