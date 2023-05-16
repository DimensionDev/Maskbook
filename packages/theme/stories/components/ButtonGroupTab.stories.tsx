import { story } from '../utils/index.js'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import { useState } from 'react'
import { ButtonGroupTabList, type ButtonGroupTabListProps } from '../../src/index.js'

const defaultTabs = ['One', 'Two', 'Three']
const { meta, of } = story(function ({
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
})
export default meta({
    title: 'Components/Button Group Tab',
    argTypes: {},
})

export const ButtonGroupTab = of({
    args: { tabs: defaultTabs, disabled: false, fullWidth: false },
})
