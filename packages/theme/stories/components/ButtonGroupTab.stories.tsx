import { story } from '../utils'
import TabContext from '@material-ui/lab/TabContext'
import TabPanel from '@material-ui/lab/TabPanel'
import { useState } from 'react'
import { ButtonGroupTabList, ButtonTab } from '../../src/Components/ButtonGroupTab'

const defaultTabs = ['One', 'Two', 'Three']
const { meta, of } = story(function ({ tabs }: { tabs: string[] }) {
    if (tabs.length === 0) tabs = tabs
    const [state, setState] = useState(tabs[0])
    return (
        <TabContext value={tabs.includes(state) ? state : tabs[0]}>
            <ButtonGroupTabList onChange={(e, v) => setState(v)} aria-label="My tab?">
                {tabs.map((x) => (
                    <ButtonTab key={x} value={x}>
                        {x}
                    </ButtonTab>
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
    args: { tabs: defaultTabs },
})
