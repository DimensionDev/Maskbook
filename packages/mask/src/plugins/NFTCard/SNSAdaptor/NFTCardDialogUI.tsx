import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Button } from '@mui/material'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../utils'
import { PluginId } from '@masknet/plugin-infra'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { NetworkPluginID, NonFungibleAsset, SourceType } from '@masknet/web3-shared-base'
import { NFTCardDialogTabs } from './NFTCardDialog'
import { useStyles } from '../useStyles'
import { chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { AboutTab } from './Tabs/AboutTab'
import { OffersTab } from './Tabs/OffersTab'
import { ActivityTab } from './Tabs/ActivityTab'
import { NFTBasicInfo } from '../../../components/shared/NFTCard/NFTBasicInfo'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
interface NFTCardDialogUIProps {
    currentTab: NFTCardDialogTabs
    asset: NonFungibleAsset<ChainId, SchemaType>
    onChangeProvider: (v: SourceType) => void
    provider: SourceType
}

const supportedProvider = [
    // to add providers, temp hide some providers
    SourceType.OpenSea,
    SourceType.Gem,
    SourceType.Rarible,
    // SourceType.X2Y2,
    // SourceType.NFTScan,
    // SourceType.Zora,
    // SourceType.LooksRare,
]

export function NFTCardDialogUI(props: NFTCardDialogUIProps) {
    const { currentTab, asset, onChangeProvider, provider } = props
    const { classes } = useStyles()
    const { t: tb } = useBaseI18n()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const pluginId = useCurrentWeb3NetworkPluginID()
    const chainIdList =
        useActivatedPlugin(PluginId.NFTCard, 'any')?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]
            ?.supportedChainIds ?? []
    return (
        <div className={classes.contentWrapper}>
            <div className={classes.contentLayout}>
                <NFTBasicInfo
                    providers={supportedProvider}
                    currentProvider={provider}
                    asset={asset}
                    onChangeProvider={onChangeProvider}
                />
                <div className={classes.tabWrapper}>
                    {currentTab === NFTCardDialogTabs.About ? (
                        <AboutTab />
                    ) : currentTab === NFTCardDialogTabs.Offers ? (
                        <OffersTab />
                    ) : (
                        <ActivityTab />
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
                                ?.map((chainId) => {
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
