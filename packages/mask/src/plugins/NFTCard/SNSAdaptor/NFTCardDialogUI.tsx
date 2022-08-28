import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Button } from '@mui/material'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../utils'
import { PluginId } from '@masknet/plugin-infra'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import {
    NetworkPluginID,
    SourceType,
    NonFungibleTokenOrder,
    NonFungibleTokenEvent,
    Pageable,
} from '@masknet/web3-shared-base'
import { NFTCardDialogTabs } from './NFTCardDialog'
import { useStyles } from '../useStyles'
import { chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { AboutTab } from './Tabs/AboutTab'
import { OffersTab } from './Tabs/OffersTab'
import { ActivityTab } from './Tabs/ActivityTab'
import { NFTBasicInfo } from '../../../components/shared/NFTCard/NFTBasicInfo'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import { LoadingBase } from '@masknet/theme'
interface NFTCardDialogUIProps {
    currentTab: NFTCardDialogTabs
    asset: AsyncState<Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>>
    onChangeProvider: (v: SourceType) => void
    provider: SourceType
    orders: AsyncState<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
    events: AsyncState<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>>
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
    const { currentTab, asset, orders, onChangeProvider, provider, events } = props
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
            {(asset.value && (
                <div className={classes.contentLayout}>
                    <NFTBasicInfo
                        providers={supportedProvider}
                        currentProvider={provider}
                        asset={asset.value}
                        onChangeProvider={onChangeProvider}
                    />

                    <div className={classes.tabWrapper}>
                        {currentTab === NFTCardDialogTabs.About ? (
                            <AboutTab asset={asset} />
                        ) : currentTab === NFTCardDialogTabs.Offers ? (
                            <OffersTab offers={orders} />
                        ) : (
                            <ActivityTab events={events} />
                        )}
                    </div>
                </div>
            )) || (
                <div className={classes.contentWrapper}>
                    <LoadingBase />
                </div>
            )}

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
