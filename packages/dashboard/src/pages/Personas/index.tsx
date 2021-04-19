import { Button, Tab, Tabs, createStyles, Box } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { capitalize, compact } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { useDefinedSocialNetworkUIs } from './api'
import { useConnectSocialNetwork } from './hooks/useConnectSocialNetwork'

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

export default function Personas() {
    const classes = useStyles()

    const definedSocialNetworkUIs = useDefinedSocialNetworkUIs()
    const providers = compact(
        [...definedSocialNetworkUIs.values()].map((item) => {
            if (item.networkIdentifier === 'localhost') return null!
            return {
                tabName: item.networkIdentifier.replace('.com', ''),
                internalName: item.networkIdentifier,
                network: item.networkIdentifier,
                connected: false,
            }
        }),
    )

    const personasTabs = providers.map(({ tabName }) => tabName)
    const [activeTab, setActiveTab] = useState(personasTabs[0])
    const personasTabsLabel: Record<typeof personasTabs[number], string> = personasTabs.reduce(
        (acc, tabName) => ({ ...acc, [tabName]: tabName }),
        {},
    )

    const [connectState, onConnect] = useConnectSocialNetwork()

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
                    {providers.map((provider) => (
                        <TabPanel key={provider.tabName} value={provider.tabName} className={classes.tabPanel}>
                            <PersonaSetup provider={provider} onConnect={onConnect} />
                        </TabPanel>
                    ))}
                </TabContext>
            </Box>
        </PageFrame>
    )
}
