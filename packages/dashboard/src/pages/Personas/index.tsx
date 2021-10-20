import { Paper, Stack, Tab, Tabs } from '@mui/material'
import { makeStyles, MaskColorVar, useCustomSnackbar } from '@masknet/theme'
import { PageFrame } from '../../components/DashboardFrame'
import { useEffect, useState } from 'react'
import { capitalize } from 'lodash-es'
import { TabContext, TabPanel } from '@mui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { PersonaDrawer } from './components/PersonaDrawer'
import { PersonaContext } from './hooks/usePersonaContext'
import { useDashboardI18N } from '../../locales'
import type { PersonaInformation } from '@masknet/shared'
import { ContentContainer } from '../../components/ContentContainer'
import { PersonaContent } from './components/PersonaContent'
import { PersonaRowCard } from './components/PersonaCard/Row'
import { PersonaStateBar } from './components/PersonaStateBar'
import { UserProvider } from '../Settings/hooks/UserContext'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'

const useStyles = makeStyles()((theme) => ({
    tabPanel: {
        padding: 0,
        flex: 1,
    },
    label: {
        width: 'auto',
    },
    tab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    personaCard: {
        padding: theme.spacing(4),
        marginBottom: theme.spacing(3),
        backgroundColor: MaskColorVar.primaryBackground,
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(2),
        },
    },
}))

function firstProfileNetwork(x: PersonaInformation | undefined) {
    return x?.linkedProfiles[0]?.identifier?.network
}
function Personas() {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const { drawerOpen, toggleDrawer, personas, currentPersona, connectPersona, definedSocialNetworks } =
        PersonaContext.useContainer()

    useEffect(() => {
        if (personas?.length === 0) {
            showSnackbar(t.personas_setup_tip(), { variant: 'warning' })
            navigate(RoutePaths.Setup)
        }
    }, [personas])

    const [activeTab, setActiveTab] = useState(
        firstProfileNetwork(currentPersona) ?? definedSocialNetworks[0].networkIdentifier,
    )

    useEffect(() => {
        setActiveTab(firstProfileNetwork(currentPersona) ?? definedSocialNetworks[0].networkIdentifier)
    }, [currentPersona, definedSocialNetworks])

    return (
        <UserProvider>
            <PageFrame
                title={t.personas()}
                noBackgroundFill={true}
                primaryAction={
                    <PersonaStateBar
                        nickname={currentPersona?.nickname}
                        fingerprint={currentPersona?.identifier.compressedPoint}
                        drawerOpen={drawerOpen}
                        toggleDrawer={toggleDrawer}
                    />
                }>
                <Paper variant="rounded" className={classes.personaCard}>
                    <PersonaRowCard />
                </Paper>
                <ContentContainer style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <TabContext value={activeTab}>
                        <Tabs value={!!activeTab ? activeTab : false} onChange={(event, tab) => setActiveTab(tab)}>
                            {definedSocialNetworks.map(({ networkIdentifier }) => (
                                <Tab
                                    key={networkIdentifier}
                                    value={networkIdentifier}
                                    // They should be localized
                                    label={capitalize(networkIdentifier.replace('.com', ''))}
                                />
                            ))}
                        </Tabs>
                        {definedSocialNetworks.map(({ networkIdentifier }) => {
                            if (!currentPersona) return null
                            const profile = currentPersona.linkedProfiles.find(
                                (x) => x.identifier.network === networkIdentifier,
                            )
                            if (profile)
                                return (
                                    <TabPanel
                                        key={networkIdentifier}
                                        value={networkIdentifier}
                                        className={activeTab === networkIdentifier ? classes.tab : undefined}>
                                        <PersonaContent network={networkIdentifier} />
                                    </TabPanel>
                                )
                            return (
                                <TabPanel
                                    key={networkIdentifier}
                                    value={networkIdentifier}
                                    className={activeTab === networkIdentifier ? classes.tab : undefined}
                                    sx={{ flex: 1, height: 'calc(100% - 48px)' }}>
                                    <Stack alignItems="center" height="100%">
                                        <PersonaSetup
                                            networkIdentifier={networkIdentifier}
                                            onConnect={() =>
                                                connectPersona(currentPersona.identifier, networkIdentifier)
                                            }
                                        />
                                    </Stack>
                                </TabPanel>
                            )
                        })}
                    </TabContext>
                </ContentContainer>
                <PersonaDrawer personas={personas} />
            </PageFrame>
        </UserProvider>
    )
}

export default Personas
