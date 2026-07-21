import {
    SearchResultContent,
    SearchResultContentForProfileTab,
    SearchResultTabContent,
    getSearchResultTabs,
    useActivatedPluginsSiteAdaptorNotMinimal,
    useIsMinimalMode,
    usePluginTransField,
} from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST, PluginID, type ProfileTabs, type SocialIdentity } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import { DSearch } from '@masknet/web3-providers'
import { type SearchResult, SearchResultType } from '@masknet/web3-shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { TabContext } from '@mui/lab'
import { Stack, Tab } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword.js'

const useStyles = makeStyles<{ isProfilePage?: boolean; searchType?: SearchResultType }>()(
    (theme, { isProfilePage, searchType }) => ({
        contentWrapper: {
            background:
                isProfilePage || (searchType !== SearchResultType.EOA && searchType !== SearchResultType.Domain) ?
                    'transparent'
                :   'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        },
        tabContent: {
            position: 'relative',
            maxHeight: 478,
            borderBottom: isProfilePage ? 'unset' : `1px solid ${theme.vars.palette.divider}`,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }),
)

interface SearchResultInspectorProps {
    keyword?: string
    identity?: SocialIdentity | null
    isProfilePage?: boolean
    profileTabType?: ProfileTabs
    searchResults?: Array<SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    currentSearchResult?: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const { identity, profileTabType, isProfilePage } = props

    const translate = usePluginTransField()
    const isMinimalMode = useIsMinimalMode(PluginID.Handle)

    const keyword_ = useSearchedKeyword()
    const keyword = props.keyword || keyword_
    const activatedPlugins = useActivatedPluginsSiteAdaptorNotMinimal()

    const { data: searchResults } = useQuery({
        queryKey: ['d-search', keyword],
        queryFn: async () => {
            if (!keyword) return EMPTY_LIST
            return DSearch.search(keyword)
        },
    })
    const resultList = props.searchResults ?? searchResults ?? EMPTY_LIST

    useEffect(() => {
        if (profileTabType || !resultList?.length) return
        const type = resultList[0].type
        let timer: NodeJS.Timeout | undefined
        if (type === SearchResultType.FungibleToken)
            timer = setTimeout(() => Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineDsearchToken), 500)
        return () => {
            if (!timer) return
            clearTimeout(timer)
        }
    }, [resultList, profileTabType])

    const currentResult = props.currentSearchResult ?? resultList?.[0]

    const { classes } = useStyles({ isProfilePage, searchType: currentResult?.type })

    const tabs = useMemo(() => {
        if (!currentResult) return EMPTY_LIST
        return getSearchResultTabs(activatedPlugins, currentResult, translate)
    }, [activatedPlugins, resultList, translate])

    const defaultTab = first(tabs)?.id ?? PluginID.Trader
    const [currentTab, onChange, , setTab] = useTabs(defaultTab, ...tabs.map((tab) => tab.id))
    useLayoutEffect(() => {
        setTab(defaultTab)
    }, [currentResult, defaultTab])

    if (isMinimalMode && !isProfilePage) return null
    if (!currentResult || !keyword || !resultList?.length) return null
    const Component = profileTabType ? SearchResultContentForProfileTab : SearchResultContent

    return (
        <div>
            <ScopedDomainsContainer>
                <div className={classes.contentWrapper}>
                    <div>
                        <Component
                            resultList={resultList}
                            currentResult={currentResult}
                            isProfilePage={isProfilePage}
                            identity={identity}
                        />
                    </div>
                    {tabs.length ?
                        <Stack sx={{ px: 2 }}>
                            <TabContext value={currentTab}>
                                <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                                    {tabs.map((tab) => (
                                        <Tab key={tab.id} label={tab.label} value={tab.id} />
                                    ))}
                                </MaskTabList>
                            </TabContext>
                        </Stack>
                    :   null}
                </div>
                {currentResult ?
                    <div className={classes.tabContent}>
                        <SearchResultTabContent result={currentResult} tabId={currentTab} />
                    </div>
                :   null}
            </ScopedDomainsContainer>
        </div>
    )
}
