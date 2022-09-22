import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Button, Typography } from '@mui/material'
import { LoadingBase } from '@masknet/theme'
import { useCurrentWeb3NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { WalletMessages } from '../../../../Wallet/messages.js'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../../../utils/index.js'
import { useStyles } from './hooks/useStyles.js'
import { AboutTab } from './tabs/AboutTab.js'
import { OffersTab } from './tabs/OffersTab.js'
import { ActivityTab } from './tabs/ActivityTab.js'
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
    const { Others } = useWeb3State()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const { asset, orders, events } = Context.useContainer()

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
                        <ActivityTab events={events} />
                    )}
                </div>
            </div>

            <PluginWalletStatusBar className={classes.footer}>
                <Button
                    variant="contained"
                    size="medium"
                    onClick={() => {
                        setSelectProviderDialog({
                            open: true,
                            supportedNetworkList: chainIdList
                                .map((chainId) => Others?.chainResolver.chainNetworkType(chainId))
                                .filter((x) => Boolean(x)) as Web3Helper.NetworkTypeAll[],
                        })
                    }}
                    fullWidth>
                    {pluginID === NetworkPluginID.PLUGIN_EVM
                        ? t('wallet_status_button_change')
                        : t('wallet_status_button_change_to_evm')}
                </Button>
            </PluginWalletStatusBar>
        </div>
    )
}
