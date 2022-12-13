import { Trans } from 'react-i18next'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { TraderDialog } from './trader/TraderDialog.js'
import { SearchResultInspector } from './trending/SearchResultInspector.js'
import { TagInspector } from './trending/TagInspector.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { enhanceTag } from './cashTag.js'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { CrossIsolationMessages, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { setupStorage, storageDefaultValue } from '../storage/index.js'
import { SearchResultType, FungibleTokenResult } from '@masknet/web3-shared-base'
import { usePayloadFromTokenSearchKeyword } from '../trending/usePayloadFromTokenSearchKeyword.js'

const sns: Plugin.SNSAdaptor.Definition<
    ChainId,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
> = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage('persistent', storageDefaultValue))
    },
    SearchResultInspector: {
        ID: PluginID.Trader,
        UI: {
            Content({ result }) {
                console.log({ result })
                const searchResult = usePayloadFromTokenSearchKeyword(
                    result as FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
                )
                return (
                    <Web3ContextProvider
                        value={{
                            pluginID: result.pluginID,
                            chainId: result.chainId ?? ChainId.Mainnet,
                        }}>
                        <SearchResultInspector keyword={result.keyword} searchResult={searchResult} />
                    </Web3ContextProvider>
                )
            },
        },
        Utils: {
            shouldDisplay(result) {
                return SearchResultType.FungibleToken === result.type
            },
        },
    },
    GlobalInjection() {
        return (
            <>
                <TagInspector />
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                    <TraderDialog />
                </Web3ContextProvider>
            </>
        )
    },
    enhanceTag,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.SwapColorful size={36} />
            const name = <Trans i18nKey="plugin_trader_swap" />
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const openDialog = () =>
                        CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
                            open: true,
                        })
                    return (
                        <ApplicationEntry
                            {...EntryComponentProps}
                            title={name}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            onClick={
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(openDialog)
                                    : openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 10,
                marketListSortingPriority: 5,
                icon,
                category: 'dapp',
                name,
                tutorialLink: 'https://realmasknetwork.notion.site/f2e7d081ee38487ca1db958393ac1edc',
                description: <Trans i18nKey="plugin_trader_swap_description" />,
                iconFilterColor,
            }
        })(),
    ],
    wrapperProps: {
        icon: <Icons.SwapColorful size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(254, 156, 0, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(254, 156, 0, 0.2) 100%), #FFFFFF;',
    },
}

export default sns
