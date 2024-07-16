import type { Plugin } from '@masknet/plugin-infra'
import { TrendingView } from './trending/TrendingView.js'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import { SearchResultType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVMUtils } from '@masknet/web3-providers'
import { base } from '../base.js'
import { TrendingViewProvider } from './trending/context.js'
import { TagInspector } from './trending/TagInspector.js'
import { enhanceTag } from './cashTag.js'

function openDialog() {
    return CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
        open: true,
    })
}
const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init() {},
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
            </>
        )
    },
    enhanceTag,
    ApplicationEntries: [],
    wrapperProps: {
        icon: <Icons.SwapColorful size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(254, 156, 0, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(254, 156, 0, 0.2) 100%), #FFFFFF;',
    },
}

export default site
