import { TabContext, TabPanel } from '@mui/lab'
import { Stack, Tab } from '@mui/material'
import { useState } from 'react'
import { MaskTabList, type MaskTabListProps } from '../../src/index.js'
import { story } from '../utils/index.js'

const defaultTabs = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
const { meta, of } = story(function ({
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
})
export default meta({
    title: 'Components/Tab List/Flexible',
    argTypes: {},
})

export const FlexibleTabList = of({
    args: { tabs: defaultTabs, disabled: false, fullWidth: false },
})
