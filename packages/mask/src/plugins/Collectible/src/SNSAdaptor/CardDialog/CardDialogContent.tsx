import { useCallback } from 'react'
import { openWindow } from '@masknet/shared-base-ui'
import { Button, Typography } from '@mui/material'
import { LoadingBase } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { PluginID } from '@masknet/plugin-infra'
import { PluginIDContextProvider, PluginWeb3ContextProvider } from '@masknet/plugin-infra/web3'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { NetworkPluginID, resolveSourceTypeName } from '@masknet/web3-shared-base'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../../../utils/index.js'
import { useStyles } from './hooks/useStyles.js'
import { AboutTab } from './tabs/AboutTab.js'
import { OffersTab } from './tabs/OffersTab.js'
import { ActivitiesTab } from './tabs/ActivitiesTab.js'
import { TabType } from '../../types.js'
import { FigureCard } from '../Shared/FigureCard.js'
import { Context } from '../Context/index.js'
import { useCurrentVisitingIdentity, useIsOwnerIdentity } from '../../../../../components/DataSource/useActivatedUI.js'
import { ConnectPersonaBoundary } from '../../../../../components/shared/ConnectPersonaBoundary.js'

export interface CardDialogContentProps {
    currentTab: TabType
    open: boolean
    setOpen: (opened: boolean) => void
}

export function CardDialogContent(props: CardDialogContentProps) {
    const { currentTab } = props
    const { classes } = useStyles()
    const { t } = useBaseI18n()
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
    const isOwnerIdentity = useIsOwnerIdentity(currentVisitingIdentity)

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
                    <Typography className={classes.emptyText}>{t('plugin_furucombo_load_failed')}</Typography>
                    <Button variant="text" onClick={() => asset.retry()}>
                        {t('retry')}
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
                        <AboutTab orders={orders} asset={asset} />
                    ) : currentTab === TabType.Offers ? (
                        <OffersTab offers={orders} />
                    ) : (
                        <ActivitiesTab events={events} />
                    )}
                </div>
            </div>

            <PluginIDContextProvider value={parentPluginID}>
                <PluginWeb3ContextProvider pluginID={parentPluginID} value={{}}>
                    <PluginWalletStatusBar
                        className={classes.footer}
                        expectedPluginID={pluginID}
                        expectedChainId={chainId}>
                        {origin === 'pfp' && isOwnerIdentity ? (
                            <ConnectPersonaBoundary
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
                                    <span className={classes.buttonText}>{t('plugin_collectibles_pfp_button')}</span>
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
                                    {t('plugin_collectibles_more_on_button', {
                                        provider: resolveSourceTypeName(asset.value.source),
                                    })}
                                </span>
                                <Icons.LinkOut size={16} />
                            </Button>
                        ) : (
                            <div />
                        )}
                    </PluginWalletStatusBar>
                </PluginWeb3ContextProvider>
            </PluginIDContextProvider>
        </div>
    )
}
