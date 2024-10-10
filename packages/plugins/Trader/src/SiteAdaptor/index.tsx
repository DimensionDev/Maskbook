import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { EVMUtils } from '@masknet/web3-providers'
import { SearchResultType } from '@masknet/web3-shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { base } from '../base.js'
import { enhanceTag } from './cashTag.js'
import { setupStorage, type StorageOptions } from './storage.js'
import { ExchangeInjection } from './trader/ExchangeInjection.js'
import { TrendingViewProvider } from './trending/context.js'
import { TagInspector } from './trending/TagInspector.js'
import { TrendingView } from './trending/TrendingView.js'
import { Trans } from '@lingui/macro'

function openDialog() {
    return CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
        open: true,
    })
}
const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(_, context) {
        setupStorage(context.createKVStorage<StorageOptions>('persistent', { transactions: {} }))
    },
    SearchResultInspector: {
        ID: PluginID.Trader,
        UI: {
            Content: function TraderSearchResultContent({ currentResult, resultList, isProfilePage, identity }) {
                if (!resultList.length || !currentResult) return null
                const { chainId, keyword, pluginID } = currentResult
                return (
                    <Web3ContextProvider network={pluginID} chainId={chainId}>
                        <TrendingViewProvider
                            isDSearch={!isProfilePage}
                            isCollectionProjectPopper={false}
                            isProfilePage={!!isProfilePage}
                            isTokenTagPopper={false}
                            isPreciseSearch={EVMUtils.isValidAddress(keyword)}>
                            <TrendingView
                                resultList={resultList as Web3Helper.TokenResultAll[]}
                                identity={identity}
                                currentResult={currentResult as Web3Helper.TokenResultAll}
                            />
                        </TrendingViewProvider>
                    </Web3ContextProvider>
                )
            },
        },
        Utils: {
            shouldDisplay(result) {
                return [
                    SearchResultType.FungibleToken,
                    SearchResultType.NonFungibleToken,
                    SearchResultType.NonFungibleCollection,
                    SearchResultType.CollectionListByTwitterHandle,
                ].includes(result.type)
            },
        },
    },
    GlobalInjection() {
        return (
            <>
                <TagInspector />
                <ExchangeInjection />
            </>
        )
    },
    enhanceTag,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.SwapColorful size={36} />
            const name = <Trans>Exchange</Trans>
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <ApplicationEntry
                            {...EntryComponentProps}
                            title={name}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            onClick={() => {
                                EntryComponentProps.onClick ? EntryComponentProps.onClick(openDialog) : openDialog()
                                Telemetry.captureEvent(EventType.Access, EventID.EntryAppSwapOpen)
                            }}
                        />
                    )
                },
                appBoardSortingDefaultPriority: 7,
                marketListSortingPriority: 7,
                icon,
                category: 'dapp',
                name,
                tutorialLink: 'https://realmasknetwork.notion.site/f2e7d081ee38487ca1db958393ac1edc',
                description: (
                    <Trans>
                        Pop-up trading widget allows you to instantly view prices of the hottest Crypto/Stock and trade,
                        also invest in the best performing managers.
                    </Trans>
                ),
                iconFilterColor,
                hiddenInList: true,
            }
        })(),
    ],
    wrapperProps: {
        icon: <Icons.SwapColorful size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(254, 156, 0, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(254, 156, 0, 0.2) 100%), #FFFFFF;',
    },
}

export default site
