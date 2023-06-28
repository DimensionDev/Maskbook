import { useLayoutEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { first } from 'lodash-es'
import { TabContext } from '@mui/lab'
import { Stack, Tab } from '@mui/material'
import {
    getSearchResultContent,
    getSearchResultContentForProfileTab,
    getSearchResultTabContent,
    getSearchResultTabs,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import {
    EMPTY_LIST,
    PluginID,
    type SocialIdentity,
    ProfileTabs,
    decentralizedSearchSettings,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import { DSearch } from '@masknet/web3-providers'
import { type SearchResult, SearchResultType } from '@masknet/web3-shared-base'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword.js'

const useStyles = makeStyles<{ isProfilePage?: boolean; searchType?: SearchResultType }>()(
    (theme, { isProfilePage, searchType }) => ({
        contentWrapper: {
            background:
                isProfilePage || (searchType !== SearchResultType.EOA && searchType !== SearchResultType.Domain)
                    ? 'transparent'
                    : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        },
        tabContent: {
            position: 'relative',
            maxHeight: 478,
            borderBottom: isProfilePage ? 'unset' : `1px solid ${theme.palette.divider}`,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }),
)

export interface SearchResultInspectorProps {
    keyword?: string
    identity?: SocialIdentity
    isProfilePage?: boolean
    profileTabType?: ProfileTabs
    searchResults?: Array<SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    currentSearchResult?: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const translate = usePluginI18NField()

    const dSearchEnabled = useValueRef(decentralizedSearchSettings)
    const { profileTabType } = props
    const keyword_ = useSearchedKeyword()
    const keyword = props.keyword || keyword_
    const activatedPlugins = useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode()

    const resultList = useAsyncRetry(async () => {
        if (!keyword) return
        return props.searchResults ?? DSearch.search(keyword)
    }, [keyword, props.searchResults])

    const currentResult = props.currentSearchResult ?? resultList.value?.[0]

    const { classes } = useStyles({ isProfilePage: props.isProfilePage, searchType: currentResult?.type })
    const contentComponent = useMemo(() => {
        if (!currentResult || !resultList.value?.length) return null

        const Component = profileTabType
            ? getSearchResultContentForProfileTab(currentResult)
            : getSearchResultContent(currentResult)

        return (
            <Component
                resultList={resultList.value}
                currentResult={currentResult}
                isProfilePage={props.isProfilePage}
                identity={props.identity}
            />
        )
    }, [currentResult, resultList.value, props.isProfilePage, props.identity, profileTabType])

    const tabs = useMemo(() => {
        if (!currentResult) return EMPTY_LIST
        return getSearchResultTabs(activatedPlugins, currentResult, translate)
    }, [activatedPlugins, resultList.value, translate])

    const defaultTab = first(tabs)?.id ?? PluginID.Collectible
    const [currentTab, onChange, , setTab] = useTabs(defaultTab, ...tabs.map((tab) => tab.id))
    useLayoutEffect(() => {
        setTab(defaultTab)
    }, [currentResult, defaultTab])

    const tabContentComponent = useMemo(() => {
        if (!currentResult) return null
        const Component = getSearchResultTabContent(currentTab)
        return <Component result={currentResult} />
    }, [currentTab, resultList.value])

    if (!dSearchEnabled && profileTabType === ProfileTabs.WEB3) return null
    if (!keyword && !currentResult) return null
    if (!contentComponent) return null

    return (
        <div>
            <ScopedDomainsContainer.Provider>
                <div className={classes.contentWrapper}>
                    <div>{contentComponent}</div>
                    {tabs.length ? (
                        <Stack px={2}>
                            <TabContext value={currentTab}>
                                <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                                    {tabs.map((tab) => (
                                        <Tab key={tab.id} label={tab.label} value={tab.id} />
                                    ))}
                                </MaskTabList>
                            </TabContext>
                        </Stack>
                    ) : null}
                </div>
                {tabContentComponent ? <div className={classes.tabContent}>{tabContentComponent}</div> : null}
            </ScopedDomainsContainer.Provider>
        </div>
    )
}
