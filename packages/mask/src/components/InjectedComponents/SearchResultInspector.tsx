import {
    getSearchResultContent,
    getSearchResultTabContent,
    getSearchResultTabs,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import { DSearch } from '@masknet/web3-providers'
import type { SearchResult, SocialIdentity } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { Tab } from '@mui/material'
import { first } from 'lodash-es'
import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { decentralizedSearchSettings } from '../../../shared/legacy-settings/settings.js'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword.js'

const useStyles = makeStyles<{ isProfilePage?: boolean }>()((theme, { isProfilePage }) => ({
    contentWrapper: {
        background: isProfilePage
            ? 'transparent'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
    },
    tabContent: {
        position: 'relative',
        maxHeight: 478,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export interface SearchResultInspectorProps {
    keyword?: string
    identity?: SocialIdentity
    isProfilePage?: boolean
    collectionList?: Array<SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    currentCollection?: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const { classes } = useStyles({ isProfilePage: props.isProfilePage })
    const translate = usePluginI18NField()

    const dSearchEnabled = useValueRef(decentralizedSearchSettings)

    const keyword_ = useSearchedKeyword()
    const keyword = props.keyword || keyword_
    const activatedPlugins = useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode()

    const resultList = useAsyncRetry(async () => {
        if (!keyword) return
        return props.collectionList ?? DSearch.search(keyword)
    }, [keyword, JSON.stringify(props.collectionList)])

    const currentCollection = props.currentCollection ?? resultList.value?.[0]

    const contentComponent = useMemo(() => {
        if (!currentCollection || !resultList.value?.length) return null
        const Component = getSearchResultContent(currentCollection)
        return (
            <Component
                resultList={resultList.value}
                currentResult={currentCollection}
                isProfilePage={props.isProfilePage}
                identity={props.identity}
            />
        )
    }, [resultList.value, props.isProfilePage, props.identity])

    const tabs = useMemo(() => {
        if (!currentCollection) return EMPTY_LIST
        return getSearchResultTabs(activatedPlugins, currentCollection, translate)
    }, [activatedPlugins, resultList.value, translate])

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

    const tabContentComponent = useMemo(() => {
        if (!currentCollection) return null
        const Component = getSearchResultTabContent(currentTab)
        return <Component result={currentCollection} />
    }, [currentTab, resultList.value])

    if (!dSearchEnabled) return null
    if (!keyword && !currentCollection) return null
    if (!contentComponent) return null

    return (
        <div>
            <ScopedDomainsContainer.Provider>
                <div className={classes.contentWrapper}>
                    <div>{contentComponent}</div>
                    {tabs.length ? (
                        <div>
                            <TabContext value={currentTab}>
                                <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                                    {tabs.map((tab) => (
                                        <Tab key={tab.id} label={tab.label} value={tab.id} />
                                    ))}
                                </MaskTabList>
                            </TabContext>
                        </div>
                    ) : null}
                </div>
                {tabContentComponent ? <div className={classes.tabContent}>{tabContentComponent}</div> : null}
            </ScopedDomainsContainer.Provider>
        </div>
    )
}
