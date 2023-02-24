import type { Meta } from '@storybook/react'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Tab } from '@mui/material'
import { useState } from 'react'
import { ButtonGroupTabList, ButtonGroupTabListProps } from '../../src/index.js'

const defaultTabs = ['One', 'Two', 'Three']

function Component({
    tabs,
    ...rest
}: {
    tabs: string[]
} & ButtonGroupTabListProps) {
    const [state, setState] = useState(tabs[0])
    return (
        <TabContext value={tabs.includes(state) ? state : tabs[0]}>
            <ButtonGroupTabList {...rest} onChange={(e, v) => setState(v)} aria-label="My tab?">
                {tabs.map((x) => (
                    <Tab key={x} value={x} label={x} />
                ))}
            </ButtonGroupTabList>
            {tabs.map((x) => (
                <TabPanel key={x} value={x}>
                    Tab {x}
                </TabPanel>
            ))}
        </TabContext>
    )
}
export default {
    component: Component,
    title: 'Components/Button Group Tab',
    args: { tabs: defaultTabs, disabled: false, fullWidth: false },
} as Meta<typeof Component>
