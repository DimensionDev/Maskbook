import type { Meta } from '@storybook/react'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Stack, Tab } from '@mui/material'
import { useState } from 'react'
import { MaskTabList, MaskTabListProps } from '../../src/index.js'

const defaultTabs = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']

function Component({
    tabs,
    ...rest
}: {
    tabs: string[]
} & MaskTabListProps) {
    const [state, setState] = useState(tabs[0])
    return (
        <Stack p={3}>
            <TabContext value={tabs.includes(state) ? state : tabs[0]}>
                <MaskTabList
                    variant="flexible"
                    {...rest}
                    onChange={(e, v) => setState(v)}
                    aria-label="flexible style tabs">
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
        </Stack>
    )
}
export default {
    component: Component,
    title: 'Components/Tab List/Flexible',
    args: { tabs: defaultTabs, disabled: false, fullWidth: false },
} as Meta<typeof Component>
