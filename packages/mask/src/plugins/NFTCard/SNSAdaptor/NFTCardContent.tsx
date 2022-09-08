import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Button, Typography } from '@mui/material'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../utils'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '../../Wallet/messages'
import {
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import { NFTCardDialogTabs } from './NFTCardDialog'
import { useStyles } from '../useStyles'
import { chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { AboutTab } from './Tabs/AboutTab'
import { OffersTab } from './Tabs/OffersTab'
import { ActivitiesTab } from './Tabs/ActivitiesTab'
import { NFTBasicInfo } from '../../../components/shared/NFTCard/NFTBasicInfo'
import { LoadingBase } from '@masknet/theme'
import { base as pluginDefinition } from '../base'
import { useNFTCardInfo } from './hooks/useNFTCardInfo'

export interface NFTCardContentProps {
    currentTab: NFTCardDialogTabs
    tokenId: string
    tokenAddress: string
}

export function NFTCardContent(props: NFTCardContentProps) {
    const { currentTab, tokenId, tokenAddress } = props
    const { classes } = useStyles()
    const { t: tb } = useBaseI18n()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { asset, orders, events,  } = useNFTCardInfo(tokenAddress, tokenId)

    const chainIdList = pluginDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []

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
                    <Typography className={classes.emptyText}>{tb('plugin_furucombo_load_failed')}</Typography>
                    <Button variant="text" onClick={() => asset.retry()}>
                        {tb('retry')}
                    </Button>
                </div>
            </div>
        )
    return (
        <div className={classes.contentWrapper}>
            <div className={classes.contentLayout}>
                <div className={classes.mediaBox}>
                    <NFTBasicInfo timeline asset={asset.value} />
                </div>

                <div className={classes.tabWrapper}>
                    {currentTab === NFTCardDialogTabs.About ? (
                        <AboutTab orders={orders} asset={asset} />
                    ) : currentTab === NFTCardDialogTabs.Offers ? (
                        <OffersTab offers={orders} />
                    ) : (
                        <ActivitiesTab events={events} />
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
                                .map((chainId) => {
                                    const x = chainResolver.chainNetworkType(chainId)
                                    return x
                                })
                                .filter((x) => Boolean(x)) as NetworkType[],
                        })
                    }}
                    fullWidth>
                    {pluginId === NetworkPluginID.PLUGIN_EVM
                        ? tb('wallet_status_button_change')
                        : tb('wallet_status_button_change_to_evm')}
                </Button>
            </PluginWalletStatusBar>
        </div>
    )
}
