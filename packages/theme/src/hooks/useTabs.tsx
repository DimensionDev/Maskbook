import { Tab, Tabs } from '@material-ui/core'
import { TabContext, TabPanel, TabPanelClasses } from '@material-ui/lab'
import { useEffect, useState } from 'react'
import { ButtonGroupTabList, ButtonGroupTabListProps } from '../Components'

export interface useTabsOptions {
    variant?: 'standard' | 'buttonGroup'
    tabPanelClasses?: TabPanelClasses
    buttonTabGroupClasses?: ButtonGroupTabListProps['classes']
}
export function useTabs<T extends string>(
    tabGroupName: string,
    tabLabels: Record<T, string>,
    children: Record<T, React.ReactChild>,
    options?: useTabsOptions,
) {
    const items = Object.keys(children) as T[]
    const first = items[0]
    const [currentTab, setState] = useState(items[0])
    useEffect(() => {
        if (!currentTab || (!items.includes(currentTab) && first)) setState(first)
    }, [currentTab, first, items.join(';')])

    const tabs = items.map((item) => <Tab value={item} key={item} label={tabLabels[item]} />)

    return (
        <TabContext value={currentTab}>
            {options?.variant === 'buttonGroup' ? (
                <ButtonGroupTabList
                    aria-label={tabGroupName}
                    onChange={(e, v) => setState(v as T)}
                    children={tabs}
                    classes={options?.buttonTabGroupClasses}
                />
            ) : (
                <Tabs value={currentTab} aria-label={tabGroupName} children={tabs} />
            )}
            {items.map((item) => (
                <TabPanel key={item} value={item} children={children[item]} classes={options?.tabPanelClasses} />
            ))}
        </TabContext>
    )
}
