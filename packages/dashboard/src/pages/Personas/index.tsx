import { Button, Tab, Tabs, createStyles, Box } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { capitalize } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { ConnectSNSAccount } from './components/ConnectSNAccount'

const useStyles = makeStyles(() =>
    createStyles({
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        },
        wrapper: {
            textTransform: 'none',
        },
        tabPanel: {
            padding: 0,
            flex: 1,
        },
    }),
)

const personasTabs = ['twitter', 'facebook']
type TabType = typeof personasTabs[number]

export default function Personas() {
    const classes = useStyles()

    const [activeTab, setActiveTab] = useState(personasTabs[0])
    const personasTabsLabel: Record<TabType, string> = {
        twitter: 'twitter',
        facebook: 'facebook',
    }

    return (
        <PageFrame title="Personas" primaryAction={<Button>Create a new wallet</Button>}>
            <Box className={classes.container}>
                <TabContext value={activeTab}>
                    <Tabs value={activeTab} onChange={(event, tab) => setActiveTab(tab)}>
                        {personasTabs.map((key) => (
                            <Tab
                                key={key}
                                value={key}
                                label={capitalize(personasTabsLabel[key])}
                                classes={{ wrapper: classes.wrapper }}
                            />
                        ))}
                    </Tabs>
                    <TabPanel key="twitter" value="twitter" className={classes.tabPanel}>
                        <ConnectSNSAccount type="twitter" />
                    </TabPanel>
                    <TabPanel key="facebook" value="facebook" className={classes.tabPanel}>
                        <ConnectSNSAccount type="facebook" />
                    </TabPanel>
                </TabContext>
            </Box>
        </PageFrame>
    )
}
