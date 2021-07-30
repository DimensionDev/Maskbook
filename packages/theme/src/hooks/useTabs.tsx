import { Tab, TabProps, Tabs, TabsProps } from '@material-ui/core'
import { TabContext, TabPanel, TabPanelProps } from '@material-ui/lab'
import React, { useEffect, useState } from 'react'
import { ButtonGroupTabList, ButtonGroupTabListProps } from '../Components'

export interface useTabsOptions {
    variant?: 'standard' | 'buttonGroup'
    tabsProps?: Partial<TabsProps>
    buttonTabGroupProps?: Partial<ButtonGroupTabListProps>
    tabProps?: Partial<TabProps>
    tabPanelProps?: Partial<TabPanelProps>
}
export function useTabs<T extends string>(
    tabGroupName: string,
    children: Record<T, TabProps & { label: string; panel: React.ReactChild }>,
    options?: useTabsOptions,
) {
    const { PanelProps, TabProps, TabsProps, currentTab, setTab } = useTabsUnstyled(tabGroupName, children)
    const tabs = TabProps.map((item) => <Tab {...options?.tabProps} {...item} />)

    return (
        <TabContext value={currentTab}>
            {options?.variant === 'buttonGroup' ? (
                <ButtonGroupTabList
                    aria-label={tabGroupName}
                    {...options.buttonTabGroupProps}
                    onChange={(e, v) => setTab(v as T)}
                    children={tabs}
                />
            ) : (
                <Tabs {...options?.tabsProps} {...TabsProps} children={tabs} />
            )}
            {PanelProps.map((item) => (
                <TabPanel {...options?.tabPanelProps} {...item} />
            ))}
        </TabContext>
    )
}

export function useTabsUnstyled<T extends string>(
    tabGroupName: string,
    tabs: Record<T, TabProps & { label: string; panel: React.ReactChild }>,
) {
    const items = Object.keys(tabs) as T[]
    const first = items[0]
    const [currentTab, setTab] = useState(items[0])
    useEffect(() => {
        if (!currentTab || (!items.includes(currentTab) && first)) setTab(first)
    }, [currentTab, first, items.join(';')])

    const TabsProps: TabsProps = {
        'aria-label': tabGroupName,
        onChange: (e, v) => setTab(v as T),
        value: currentTab,
    }
    const TabProps: TabProps[] = items.map((value) => ({ value, key: value, label: tabs[value].label }))
    const PanelProps: TabPanelProps[] = items.map((value) => ({ value, key: value, children: tabs[value].panel }))
    return { currentTab, setTab, TabsProps, TabProps, PanelProps }
}
