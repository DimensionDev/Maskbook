import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, type SocialAccount, SocialAddressType, type SocialIdentity } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { SearchResultType } from '@masknet/web3-shared-base'
import { Box, type BoxProps } from '@mui/material'
import { memo } from 'react'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { toggleFilter, useInsideFeedsTab, useIsTabActionEnabled } from './emitter.js'
import { type FeedsPageProps, FeedsPage } from './FeedsPage.js'
import { Modals } from './modals/index.js'

function shouldDisplay(_?: SocialIdentity, socialAccount?: SocialAccount<Web3Helper.ChainIdAll>) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

interface ProfileTabConfigOptions {
    slot: Plugin.SiteAdaptor.ProfileTabSlot
    label: string
    feedsPageProps: Omit<FeedsPageProps, 'slot'>
    priority: number
}

const createProfileTabConfig = ({
    label,
    feedsPageProps: props,
    priority = 1,
    slot,
}: ProfileTabConfigOptions): Plugin.SiteAdaptor.ProfileTab => {
    return {
        ID: `${PLUGIN_ID}_${label}`,
        label,
        priority,
        UI: {
            TabContent: ({ socialAccount }) => {
                const key = [socialAccount?.address ?? '-', props.tags ?? '-'].join('/')
                useInsideFeedsTab(slot)

                return (
                    <EVMWeb3ContextProvider>
                        <FeedsPage key={key} address={socialAccount?.address} slot={slot} {...props} />
                    </EVMWeb3ContextProvider>
                )
            },
        },
        Utils: {
            shouldDisplay,
        },
    }
}

const createSearchTabConfig = ({
    slot,
    label,
    feedsPageProps: props,
    priority = 1,
}: ProfileTabConfigOptions): Plugin.SiteAdaptor.SearchResultTab => {
    return {
        ID: `${PLUGIN_ID}_${label}`,
        label,
        priority,
        UI: {
            TabContent: ({ result }) => {
                const socialAccount = {
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    address: result.type === SearchResultType.Domain ? result.address ?? '' : result.keyword,
                    label: result.type === SearchResultType.Domain ? result.keyword : '',
                    supportedAddressTypes: [SocialAddressType.ENS],
                }
                const key = [socialAccount.address ?? '-', props.tags ?? '-'].join('_')
                useInsideFeedsTab(slot)

                return (
                    <Box style={{ minHeight: 300 }}>
                        <EVMWeb3ContextProvider>
                            <FeedsPage key={key} address={socialAccount.address} slot={slot} {...props} />
                        </EVMWeb3ContextProvider>
                    </Box>
                )
            },
        },
        Utils: {
            shouldDisplay(result) {
                return [SearchResultType.Domain, SearchResultType.EOA].includes(result.type)
            },
        },
    }
}

const FinanceTags = [RSS3BaseAPI.Tag.Exchange, RSS3BaseAPI.Tag.Transaction]
const FinanceTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig({
    slot: 'profile-page',
    label: 'Finance',
    feedsPageProps: { tags: FinanceTags },
    priority: 2,
})
const listProps: BoxProps = {
    style: {
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'auto',
        scrollbarWidth: 'none',
    },
}
const FinanceTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig({
    slot: 'profile-card',
    label: 'Finance',
    feedsPageProps: {
        tags: FinanceTags,
        height: 392,
        overflow: 'auto',
        listProps,
    },
    priority: 2,
})
const FinanceTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig({
    slot: 'search',
    label: 'Finance',
    feedsPageProps: {
        tags: FinanceTags,
        height: 478,
        overflow: 'auto',
        listProps,
    },
    priority: 2,
})

const SocialTabConfig: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig({
    slot: 'profile-page',
    label: 'Social',
    feedsPageProps: {
        tags: [RSS3BaseAPI.Tag.Social],
    },
    priority: 1,
})
const SocialTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = createProfileTabConfig({
    slot: 'profile-card',
    label: 'Social',
    feedsPageProps: {
        tags: [RSS3BaseAPI.Tag.Social],
        height: 392,
        overflow: 'auto',
        listProps,
    },
    priority: 1,
})
const SocialTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = createSearchTabConfig({
    slot: 'search',
    label: 'Social',
    feedsPageProps: {
        tags: [RSS3BaseAPI.Tag.Social],
        height: 478,
        overflow: 'auto',
        listProps,
    },
    priority: 1,
})

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(_, context) {},
    GlobalInjection() {
        return <Modals />
    },
    ProfileTabActions: memo(function FeedFilterButton({ slot }) {
        const enabled = useIsTabActionEnabled(slot)
        return (
            <Icons.Filter
                size={24}
                onClick={() => {
                    if (!enabled) return
                    toggleFilter(slot)
                }}
                disabled={!enabled}
                style={enabled ? undefined : { color: 'rgba(172, 180, 193, 1)', cursor: 'not-allowed' }}
            />
        )
    }),
    ProfileTabs: [FinanceTabConfig, SocialTabConfig],
    ProfileCardTabs: [FinanceTabConfigInProfileCard, SocialTabConfigInProfileCard],
    SearchResultTabs: [FinanceTabConfigInSearchResult, SocialTabConfigInSearchResult],
}

export default site
