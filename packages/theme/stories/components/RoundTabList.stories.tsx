import { story } from '../utils'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Stack, Tab } from '@mui/material'
import { useState } from 'react'
import { MaskTabList, MaskTabListProps } from '../../src'

const defaultTabs = ['One', 'Two', 'Three']
const { meta, of } = story(function ({ tabs, ...rest }: { tabs: string[] } & MaskTabListProps) {
    const [state, setState] = useState(tabs[0])
    return (
        <Stack p={3}>
            <TabContext value={tabs.includes(state) ? state : tabs[0]}>
                <MaskTabList variant="round" {...rest} onChange={(e, v) => setState(v)} aria-label="round style tabs">
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
    title: 'Components/Tab List/Round',
    argTypes: {},
})

export const RoundTabsList = of({
    args: { tabs: defaultTabs, disabled: false, fullWidth: false },
})
