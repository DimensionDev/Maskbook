/* eslint-disable no-nested-ternary */
import { useCallback } from 'react'
import { openWindow, useValueRef } from '@masknet/shared-base-ui'
import { Button, Typography } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { ConnectPersonaBoundary, PluginWalletStatusBar } from '@masknet/shared'
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
    useSNSAdaptorContext,
} from '@masknet/plugin-infra/content-script'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string } | void>()(
    (theme, props) => ({
        contentWrapper: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        loadingPlaceholder: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
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
            width: 'calc( 100% - 336px)',
            marginLeft: 36,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        emptyText: {
            color: theme.palette.text.secondary,
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
        events,
        origin,
        parentPluginID = NetworkPluginID.PLUGIN_EVM,
        pluginID,
        chainId,
    } = Context.useContainer()
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const lastRecognized = useLastRecognizedIdentity()
    const { ownPersonaChanged, currentPersonaIdentifier, openDashboard } = useSNSAdaptorContext()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const personas = useAllPersonas()
    const onBeforeAction = useCallback(() => {
        props.setOpen(false)
    }, [props.setOpen])

    const onPFPButtonClick = useCallback(() => {
        CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
            open: true,
            pluginID: PluginID.Avatar,
        })
    }, [])

    const onMoreButtonClick = useCallback(() => {
        const link = asset.value?.link

        if (link) {
            openWindow(link)
            props.setOpen(false)
        }
    }, [asset.value?.link])

    if (asset.loading)
        return (
            <div className={classes.contentWrapper}>
                <div className={classes.loadingPlaceholder}>
                    <LoadingBase />
                </div>
            </div>
        )
    if (!asset.value)
        return (
            <div className={classes.contentWrapper}>
                <div className={classes.loadingPlaceholder}>
                    <Typography className={classes.emptyText}>{t.load_failed()}</Typography>
                    <Button variant="text" onClick={() => asset.retry()}>
                        {t.retry()}
                    </Button>
                </div>
            </div>
        )
    return (
        <div className={classes.contentWrapper}>
            <div className={classes.contentLayout}>
                <div className={classes.mediaBox}>
                    <FigureCard timeline asset={asset.value} />
                </div>

                <div className={classes.tabWrapper}>
                    {currentTab === TabType.About ? (
                        <AboutTab orders={orders.value} asset={asset.value} />
                    ) : currentTab === TabType.Offers ? (
                        <OffersTab offers={orders} />
                    ) : (
                        <ActivitiesTab events={events} />
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
                            ownPersonaChanged={ownPersonaChanged}
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
                    ) : asset.value.link && asset.value.source ? (
                        <Button
                            sx={{ display: 'flex', alignItems: 'center' }}
                            variant="contained"
                            size="medium"
                            onClick={onMoreButtonClick}
                            fullWidth>
                            <span className={classes.buttonText}>
                                {t.plugin_collectibles_more_on_button({
                                    provider:
                                        asset.value.source === SourceType.NFTScan
                                            ? resolveSourceTypeName(asset.value.source)
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
