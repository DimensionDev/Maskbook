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

const useStyles = makeStyles()(() => ({
    contentWrapper: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
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
    isProfilePage?: boolean
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    const { classes } = useStyles()
    const translate = usePluginI18NField()

    const keyword_ = useSearchedKeyword()
    const keyword = props.keyword || keyword_
    const activatedPlugins = useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode()

    const resultList = useAsyncRetry(async () => {
        if (!keyword) return
        return DSearch.search(keyword)
    }, [keyword])

    const contentComponent = useMemo(() => {
        if (!resultList.value?.length) return null
        const Component = getSearchResultContent(resultList.value[0])
        return <Component result={resultList.value} isProfilePage={props.isProfilePage} />
    }, [resultList.value])

    const tabs = useMemo(() => {
        if (!resultList.value?.length) return EMPTY_LIST
        return getSearchResultTabs(activatedPlugins, resultList.value[0], translate)
    }, [activatedPlugins, resultList.value, translate])

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

    const tabContentComponent = useMemo(() => {
        if (!resultList.value?.length) return null
        const Component = getSearchResultTabContent(currentTab)
        return <Component result={resultList.value[0]} />
    }, [currentTab, resultList.value])
    if (!keyword && !resultList.value?.length) return null
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
