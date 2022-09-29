import { useCallback } from 'react'
import { openWindow } from '@masknet/shared-base-ui'
import { Button, Typography } from '@mui/material'
import { LoadingBase } from '@masknet/theme'
import { resolveSourceTypeName } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../../../utils/index.js'
import { useStyles } from './hooks/useStyles.js'
import { AboutTab } from './tabs/AboutTab.js'
import { OffersTab } from './tabs/OffersTab.js'
import { ActivitiesTab } from './tabs/ActivitiesTab.js'
import { base as pluginDefinition } from '../../base.js'
import { TabType } from '../../types.js'
import { FigureCard } from '../Shared/FigureCard.js'
import { Context } from '../Context/index.js'

export interface CardDialogContentProps {
    currentTab: TabType
}

export function CardDialogContent(props: CardDialogContentProps) {
    const { currentTab } = props
    const { classes } = useStyles()
    const { t } = useBaseI18n()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { asset, orders, events } = Context.useContainer()

    const onMoreButtonClick = useCallback(() => {
        const link = asset.value?.link
        if (link) openWindow(link)
    }, [asset.value?.link])

    const chainIdList = pluginDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? []

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

            <PluginWalletStatusBar className={classes.footer}>
                {asset.value.link && asset.value?.source ? (
                    <Button variant="contained" size="medium" onClick={onMoreButtonClick} fullWidth>
                        {t('plugin_collectibles_more_on_button', {
                            provider: resolveSourceTypeName(asset.value.source),
                        })}
                    </Button>
                ) : (
                    <div></div>
                )}
            </PluginWalletStatusBar>
        </div>
    )
}
