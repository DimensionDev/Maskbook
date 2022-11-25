import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { first } from 'lodash-es'
import { Tab } from '@mui/material'
import { TabContext } from '@mui/lab'
import { EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { DSearch } from '@masknet/web3-providers'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import {
    getSearchResultContent,
    getSearchResultTabContent,
    getSearchResultTabs,
    usePluginI18NField,
    useActivatedPluginsSNSAdaptor,
} from '@masknet/plugin-infra/content-script'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword.js'

const useStyles = makeStyles()((theme) => ({}))

export interface SearchResultInspectorProps {}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const { classes } = useStyles()
    const translate = usePluginI18NField()

    const keyword = useSearchedKeyword()
    const activatedPlugins = useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode()

    const result = useAsyncRetry(async () => {
        if (!keyword) return
        return DSearch.search(keyword)
    }, [keyword])

    const contentComponent = useMemo(() => {
        if (!result.value) return null
        const Component = getSearchResultContent(result.value)
        return <Component result={result.value} />
    }, [result.value])

    const tabs = useMemo(() => {
        if (!result.value) return EMPTY_LIST
        return getSearchResultTabs(activatedPlugins, result.value, translate)
    }, [activatedPlugins, result.value])

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

    const tabContentComponent = useMemo(() => {
        if (!result.value) return null
        const Component = getSearchResultTabContent(currentTab)
        return <Component result={result.value} />
    }, [currentTab, result.value])

    if (!keyword && !result.value) return null
    if (!contentComponent) return null

    return (
        <div className={classes.root}>
            <div className={classes.content}>{contentComponent}</div>
            {tabs.length ? (
                <div className={classes.tabs}>
                    <TabContext value={currentTab}>
                        <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                            {tabs.map((tab) => (
                                <Tab key={tab.id} label={tab.label} value={tab.id} />
                            ))}
                        </MaskTabList>
                    </TabContext>
                </div>
            ) : null}
            {tabContentComponent ? <div className={classes.tabContent}>{tabContentComponent}</div> : null}
        </div>
    )
}
