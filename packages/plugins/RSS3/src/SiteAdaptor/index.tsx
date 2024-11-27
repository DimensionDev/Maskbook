import type { Plugin } from '@masknet/plugin-infra'
import {
    EMPTY_OBJECT,
    NetworkPluginID,
    type SocialAccount,
    SocialAddressType,
    type SocialIdentity,
} from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EVMWeb3ContextProvider, ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import { SearchResultType } from '@masknet/web3-shared-base'
import { Box } from '@mui/material'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { FinanceFeeds } from './FinanceFeeds/index.js'
import { Modals } from './modals/index.js'
import { SocialFeeds } from './SocialFeeds/index.js'
import { useMemo } from 'react'

function shouldDisplay(_?: SocialIdentity, socialAccount?: SocialAccount<Web3Helper.ChainIdAll>) {
    return socialAccount?.pluginID === NetworkPluginID.PLUGIN_EVM
}

const FinanceTabConfig: Plugin.SiteAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_finance_feeds`,
    label: 'Finance',
    priority: 2,
    UI: {
        TabContent({ socialAccount }) {
            return <FinanceFeeds address={socialAccount?.address} />
        },
    },
    Utils: {
        shouldDisplay,
    },
}

const FinanceTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_Finance`,
    label: 'Finance',
    priority: 2,
    UI: {
        TabContent({ socialAccount }) {
            return <FinanceFeeds address={socialAccount?.address} />
        },
    },
    Utils: {
        shouldDisplay,
    },
}

const FinanceTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = {
    ID: `${PLUGIN_ID}_Finance`,
    label: 'Finance',
    priority: 2,
    UI: {
        TabContent({ result }) {
            const hasAddress = result.type === SearchResultType.Domain || result.type === SearchResultType.EOA
            const map = useMemo(() => {
                if (!hasAddress || !result.address || !result.domain) return EMPTY_OBJECT
                return {
                    [result.address]: result.domain,
                }
            }, [result])
            if (result.type === SearchResultType.Domain || result.type === SearchResultType.EOA) {
                return (
                    <Box style={{ minHeight: 300 }}>
                        <ScopedDomainsContainer.Provider initialState={map}>
                            <FinanceFeeds address={result.address} />
                        </ScopedDomainsContainer.Provider>
                    </Box>
                )
            }
            return null
        },
    },
    Utils: {
        shouldDisplay(result) {
            return [SearchResultType.Domain, SearchResultType.EOA].includes(result.type)
        },
    },
}

const SocialTabConfig: Plugin.SiteAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_social_feeds`,
    label: 'Social',
    priority: 1,
    UI: {
        TabContent: ({ socialAccount, identity }) => {
            return (
                <EVMWeb3ContextProvider>
                    <SocialFeeds address={socialAccount?.address} userId={identity?.identifier?.userId} />
                </EVMWeb3ContextProvider>
            )
        },
    },
    Utils: {
        shouldDisplay,
    },
}

const SocialTabConfigInProfileCard: Plugin.SiteAdaptor.ProfileTab = {
    ID: `${PLUGIN_ID}_profile_card_social_feeds`,
    label: 'Social',
    priority: 1,
    UI: {
        TabContent: ({ socialAccount, identity }) => {
            return (
                <EVMWeb3ContextProvider>
                    <SocialFeeds address={socialAccount?.address} userId={identity?.identifier?.userId} />
                </EVMWeb3ContextProvider>
            )
        },
    },
    Utils: {
        shouldDisplay,
    },
}
const SocialTabConfigInSearchResult: Plugin.SiteAdaptor.SearchResultTab = {
    ID: `${PLUGIN_ID}_Social`,
    label: 'Social',
    priority: 1,
    UI: {
        TabContent({ result }) {
            const socialAccount = {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                address: result.type === SearchResultType.Domain ? (result.address ?? '') : result.keyword,
                label: result.type === SearchResultType.Domain ? result.keyword : '',
                supportedAddressTypes: [SocialAddressType.ENS],
            }
            return (
                <Box minHeight={300} sx={{ scrollbarWidth: 'none' }}>
                    <EVMWeb3ContextProvider>
                        <SocialFeeds key={socialAccount.address} address={socialAccount.address} />
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

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    GlobalInjection() {
        return <Modals />
    },
    ProfileTabs: [FinanceTabConfig, SocialTabConfig],
    ProfileCardTabs: [FinanceTabConfigInProfileCard, SocialTabConfigInProfileCard],
    SearchResultTabs: [FinanceTabConfigInSearchResult, SocialTabConfigInSearchResult],
}

export default site
