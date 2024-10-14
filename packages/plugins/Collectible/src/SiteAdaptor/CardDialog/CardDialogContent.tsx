import { useCallback } from 'react'
import { openWindow } from '@masknet/shared-base-ui'
import { useSubscription } from 'use-subscription'
import { alpha, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { ConnectPersonaBoundary, LoadingStatus, ReloadStatus } from '@masknet/shared'
import { PluginID, NetworkPluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { SourceType, resolveSourceTypeName } from '@masknet/web3-shared-base'
import {
    useAllPersonas,
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
} from '@masknet/plugin-infra/content-script'
import { currentPersonaIdentifier } from '@masknet/plugin-infra/content-script/context'
import { openDashboard } from '@masknet/plugin-infra/dom/context'
import { AboutTab } from './tabs/AboutTab.js'
import { OffersTab } from './tabs/OffersTab.js'
import { ActivitiesTab } from './tabs/ActivitiesTab.js'
import { TabType } from '../../types.js'
import { FigureCard } from '../Shared/FigureCard.js'
import { Context } from '../Context/index.js'
import { useCollectibleTrans } from '../../locales/i18n_generated.js'

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
            flexShrink: 0,
        },
        contentLayout: {
            width: '100%',
            height: '100%',
            display: 'flex',
            padding: 24,
            boxSizing: 'border-box',
            gap: theme.spacing(4),
            paddingBottom: 72,
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabWrapper: {
            overflowY: 'auto',
            scrollbarWidth: 'none',
            flexGrow: 1,
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        footer: {
            position: 'sticky',
            bottom: 0,
            boxSizing: 'content-box',
            display: 'flex',
            backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
            boxShadow:
                theme.palette.mode === 'dark' ?
                    '0px 0px 20px rgba(255, 255, 255, 0.12)'
                :   '0px 0px 20px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(16px)',
            padding: theme.spacing(2),
            borderRadius: '0 0 12px 12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            maxHeight: 40,
        },
        buttonText: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
    }),
)

interface CardDialogContentProps {
    currentTab: TabType
    open: boolean
    setOpen: (opened: boolean) => void
}

export function CardDialogContent(props: CardDialogContentProps) {
    const { currentTab } = props
    const { classes } = useStyles()
    const t = useCollectibleTrans()
    const { asset, orders, offers, origin, pluginID } = Context.useContainer()
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useSubscription(currentPersonaIdentifier)
    const personas = useAllPersonas()
    const onBeforeAction = useCallback(() => {
        props.setOpen(false)
    }, [props.setOpen])

    const onPFPButtonClick = useCallback(() => {
        CrossIsolationMessages.events.avatarSettingsDialogEvent.sendToLocal({
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

    if (asset.isPending) return <LoadingStatus height="100%" />
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
                    {currentTab === TabType.About ?
                        <AboutTab orders={offers} asset={asset.data} />
                    : currentTab === TabType.Offers ?
                        <OffersTab
                            offers={offers}
                            loading={orders.isPending}
                            finished={!orders.hasNextPage}
                            onNext={orders.fetchNextPage}
                            onRetry={orders.refetch}
                        />
                    :   <ActivitiesTab />}
                </div>
            </div>

            {origin === 'pfp' && currentVisitingIdentity?.isOwner ?
                <div className={classes.footer}>
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
                </div>
            : externalLink ?
                <div className={classes.footer}>
                    <Button
                        sx={{ display: 'flex', alignItems: 'center' }}
                        variant="contained"
                        size="medium"
                        onClick={onMoreButtonClick}
                        fullWidth>
                        <span className={classes.buttonText}>
                            {t.plugin_collectibles_more_on_button({
                                provider:
                                    asset.data.source === SourceType.NFTScan ?
                                        resolveSourceTypeName(asset.data.source)
                                    :   'platform',
                            })}
                        </span>
                        <Icons.LinkOut size={16} />
                    </Button>
                </div>
            :   null}
        </div>
    )
}
