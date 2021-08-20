import { useCallback } from 'react'
import { useState } from 'react'

/**
 * @example
 *  const [currentTab, onChange, tabs, setTab] = useTab('tab1', 'tab2', 'tab3')
 *  return (
 *      <TabContext value={currentTab}>
 *          <TabList onChange={onChange}>
 *              <Tab label="Item One" value={tabs.tab1} />
 *              <Tab label="Item Two" value={tabs.tab2} />
 *              <Tab label="Item Three" value={tabs.tab3} />
 *          </TabList>
 *          <TabPanel value={tabs.tab1}>Item One</TabPanel>
 *          <TabPanel value={tabs.tab2}>Item Two</TabPanel>
 *          <TabPanel value={tabs.tab3}>Item Three</TabPanel>
 *      </TabContext>
 *  )
 */
export function useTabs<T extends string>(defaultTab: T, ...possibleTabs: T[]) {
    const [currentTab, setTab] = useState(defaultTab)
    const enum_: Record<T, T> = { [defaultTab]: defaultTab } as any
    possibleTabs.forEach((t) => (enum_[t] = t))

    const onChange = useCallback((event: unknown, value: any) => {
        setTab(value)
    }, [])
    return [currentTab, onChange, enum_, setTab] as const
}
