import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { first } from 'lodash-es'
import { Tab } from '@mui/material'
import { TabContext } from '@mui/lab'
import { EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { DSearch } from '@masknet/web3-providers'
import { makeStyles, MaskTabList, useStylesExtends, useTabs } from '@masknet/theme'
import {
    getSearchResultTabs,
    getSearchResultContent,
    getSearchResultTabContent,
    usePluginI18NField,
    useActivatedPluginsSNSAdaptor,
} from '@masknet/plugin-infra/content-script'
import { useSearchedKeyword } from '../DataSource/useSearchedKeyword.js'
import { useWeb3State } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    contentWrapper: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
    },
}))

export interface SearchResultInspectorProps {}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const { classes } = useStylesExtends(useStyles(), props)
    const translate = usePluginI18NField()

    const keyword = useSearchedKeyword()
    const { Others } = useWeb3State()
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
    console.log({ contentComponent, tabContentComponent, tabs })
    if (!keyword && !result.value) return null
    if (!contentComponent) return null

    return (
        <div className={classes.root}>
            <div className={classes.contentWrapper}>
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
            </div>
            {tabContentComponent ? <div className={classes.tabContent}>{tabContentComponent}</div> : null}
        </div>
    )
}
