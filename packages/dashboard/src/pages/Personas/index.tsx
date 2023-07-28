import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { capitalize } from 'lodash-es'
import { TabContext, TabPanel } from '@mui/lab'
import { Paper, Stack, Tab, Tabs } from '@mui/material'
import { makeStyles, MaskColorVar, useCustomSnackbar } from '@masknet/theme'
import { PersonaSetup } from './components/PersonaSetup/index.js'
import { PersonaDrawer } from './components/PersonaDrawer/index.js'
import { PersonaContext } from './hooks/usePersonaContext.js'
import { useDashboardI18N } from '../../locales/index.js'
import { DashboardRoutes, type PersonaInformation } from '@masknet/shared-base'
import { ContentContainer } from '../../components/ContentContainer/index.js'
import { PersonaContent } from './components/PersonaContent/index.js'
import { PersonaRowCard } from './components/PersonaCard/Row.js'
import { PersonaStateBar } from './components/PersonaStateBar/index.js'
import { UserProvider } from '../Settings/hooks/UserContext.js'
import { PageFrame } from '../../components/PageFrame/index.js'

const useStyles = makeStyles()((theme) => ({
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
        if (personas?.length !== 0) return
        showSnackbar(t.personas_setup_tip(), { variant: 'warning' })
        navigate(DashboardRoutes.SignUpPersona)
    }, [personas])

    const [activeTab, setActiveTab] = useState(
        firstProfileNetwork(currentPersona) ?? definedSocialNetworks[0].networkIdentifier,
    )

    useEffect(() => {
        setActiveTab(firstProfileNetwork(currentPersona) ?? definedSocialNetworks[0].networkIdentifier)
    }, [currentPersona, definedSocialNetworks])

    if (!personas.length) return null

    return (
        <UserProvider>
            <PageFrame
                title={t.personas()}
                noBackgroundFill
                primaryAction={
                    <PersonaStateBar
                        nickname={currentPersona?.nickname}
                        fingerprint={currentPersona?.identifier.rawPublicKey}
                        drawerOpen={drawerOpen}
                        toggleDrawer={toggleDrawer}
                    />
                }>
                <Paper variant="rounded" className={classes.personaCard}>
                    <PersonaRowCard />
                </Paper>
                <ContentContainer style={{ display: 'flex', flexDirection: 'column' }}>
                    <TabContext value={activeTab}>
                        <Tabs value={activeTab ? activeTab : false} onChange={(event, tab) => setActiveTab(tab)}>
                            {definedSocialNetworks.map(({ networkIdentifier }) => (
                                <Tab
                                    key={networkIdentifier}
                                    value={networkIdentifier}
                                    // They should be localized
                                    label={capitalize(networkIdentifier.split('.')[0])}
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
