import { useCallback, useState, useTransition } from 'react'

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
    const [, startTransition] = useTransition()
    const tabRecords = { [defaultTab]: defaultTab } as Record<T, T>
    possibleTabs.forEach((t) => (tabRecords[t] = t))

    const isCurrentTabAvailable = [defaultTab, ...possibleTabs].includes(currentTab)
    if (!isCurrentTabAvailable) setTab(defaultTab)

    const onChange = useCallback((event: unknown, value: any) => {
        startTransition(() => setTab(value))
    }, [])
    return [currentTab, onChange, tabRecords, setTab] as const
}
