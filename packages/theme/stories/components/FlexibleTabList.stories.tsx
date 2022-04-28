import { story } from '../utils'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Tab } from '@mui/material'
import { useState } from 'react'
import { MaskTabList, MaskTabListProps } from '../../src'

const defaultTabs = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
const { meta, of } = story(function ({ tabs, ...rest }: { tabs: string[] } & MaskTabListProps) {
    if (tabs.length === 0) tabs = tabs
    const [state, setState] = useState(tabs[0])
    return (
        <TabContext value={tabs.includes(state) ? state : tabs[0]}>
            <MaskTabList variant="flexible" {...rest} onChange={(e, v) => setState(v)} aria-label="My tab?">
                {tabs.map((x) => (
                    <Tab key={x} value={x} label={x} />
                ))}
            </MaskTabList>
            {tabs.map((x) => (
                <TabPanel key={x} value={x}>
                    Tab {x}
                </TabPanel>
            ))}
        </TabContext>
    )
})
export default meta({
    title: 'Components/Tab List/Flexible',
    argTypes: {},
})

export const FlexibleTabList = of({
    args: { tabs: defaultTabs, disabled: false, fullWidth: false },
})
