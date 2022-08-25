import { useMemo } from 'react'
import { first } from 'lodash-unified'
import {
    createInjectHooksRenderer,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useStylesExtends, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Tab } from '@mui/material'

function getTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.SearchResultTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    tabs: {},
    content: {},
}))

export interface SearchResultTabsProps {}

export function SearchResultTabs(props: SearchResultTabsProps) {
    const translate = usePluginI18NField()
    const classes = useStylesExtends(useStyles(), props)

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.SearchResultTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .sort((a, z) => {
                return a.priority - z.priority
            })
    })
    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))

    const [currentTab, onChange] = useTabs(first(tabs)?.id!, ...tabs.map((tab) => tab.id))

    const component = useMemo(() => {
        const Component = getTabContent(currentTab)
        if (!Component) return null

        return <Component keyword={'$Mask'} />
    }, [currentTab])

    return (
        <div className={classes.root}>
            <div className={classes.tabs}>
                <TabContext value={currentTab}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                        {tabs.map((tab) => (
                            <Tab key={tab.id} label={tab.label} value={tab.id} />
                        ))}
                    </MaskTabList>
                </TabContext>
            </div>
            <div className={classes.content}>{component}</div>
        </div>
    )
}
