import { Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { MaskTabList, useTabs } from '@masknet/theme'

export const meta = {
    title: 'Tabs (MaskTabList)',
    description: 'MaskTabList + useTabs + @mui/lab TabContext/TabPanel. Variants: base, round, flexible.',
}

function Example({ variant }: { variant: 'base' | 'round' | 'flexible' }) {
    const [tab, onChange, tabs] = useTabs('overview', 'activity', 'settings')
    return (
        <TabContext value={tab}>
            <MaskTabList variant={variant} onChange={onChange} aria-label={`${variant} tabs`}>
                <Tab label="Overview" value={tabs.overview} />
                <Tab label="Activity" value={tabs.activity} />
                <Tab label="Settings" value={tabs.settings} />
            </MaskTabList>
            <TabPanel value={tabs.overview}>Overview panel</TabPanel>
            <TabPanel value={tabs.activity}>Activity panel</TabPanel>
            <TabPanel value={tabs.settings}>Settings panel</TabPanel>
        </TabContext>
    )
}

export default function TabsDemo() {
    return (
        <div style={{ display: 'grid', gap: 32, maxWidth: 520 }}>
            <div>
                <h4>base</h4>
                <Example variant="base" />
            </div>
            <div>
                <h4>round</h4>
                <Example variant="round" />
            </div>
            <div>
                <h4>flexible</h4>
                <Example variant="flexible" />
            </div>
        </div>
    )
}
