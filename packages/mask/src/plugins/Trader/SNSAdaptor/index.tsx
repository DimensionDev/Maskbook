import { Trans } from 'react-i18next'
import { Box } from '@mui/material'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { useState } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { TrendingView } from './trending/TrendingView.js'
import { useWeb3State, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { TraderDialog } from './trader/TraderDialog.js'
import { TagInspector } from './trending/TagInspector.js'
import { enhanceTag } from './cashTag.js'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { CrossIsolationMessages, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { SearchResultType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NFTProjectAvatarBadge } from './NFTProjectAvatarBadge.js'
import { useCollectionByTwitterHandler } from '../../../plugins/Trader/trending/useTrending.js'

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
    init() {},
    SearchResultInspector: {
        ID: PluginID.Trader,
        UI: {
            Content({ result: _resultList, isProfilePage }) {
                const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
                const resultList = _resultList as Web3Helper.TokenResultAll[]
                const [result, setResult] = useState(resultList[0])
                const { chainId, keyword, address, pluginID } = result
                return (
                    <Web3ContextProvider
                        value={{
                            pluginID,
                            chainId: chainId ?? ChainId.Mainnet,
                        }}>
                        <TrendingView
                            isProfilePage={isProfilePage}
                            isTokenTagPopper={false}
                            setResult={setResult}
                            result={result}
                            resultList={resultList}
                            expectedChainId={chainId ?? ChainId.Mainnet}
                            isPreciseSearch={Boolean(Others?.isValidAddress(keyword))}
                            searchedContractAddress={
                                Others?.isValidAddress(keyword)
                                    ? keyword
                                    : Others?.isValidAddress(address)
                                    ? address
                                    : undefined
                            }
                        />
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
                ].includes(result.type)
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
    AvatarRealm: {
        ID: `${base.ID}_nft_project_card`,
        label: 'Avatar Web3 Profile',
        priority: 99999,
        UI: {
            Decorator({ identity }) {
                const { value: collection } = useCollectionByTwitterHandler(identity?.identifier?.userId)
                const isMinimalMode = useIsMinimalMode(PluginID.Web3ProfileCard)
                if (!identity?.identifier?.userId || !collection || isMinimalMode) return null

                return (
                    <Box display="flex" alignItems="top" justifyContent="center">
                        <NFTProjectAvatarBadge
                            userId={identity.identifier.userId}
                            address={collection.contract_address}
                        />
                    </Box>
                )
            },
        },
        Utils: {
            shouldDisplay(_, socialAccounts) {
                return !socialAccounts?.length
            },
        },
    },
}

export default sns
