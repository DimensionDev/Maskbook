import { Box, IconButton, Paper, Stack, Tab, Tabs, Typography } from '@material-ui/core'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { PageFrame } from '../../components/DashboardFrame'
import { useEffect, useState } from 'react'
import { capitalize } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { ArrowDownRound, ArrowUpRound } from '@masknet/icons'
import { PersonaDrawer } from './components/PersonaDrawer'
import { PersonaContext } from './hooks/usePersonaContext'
import { useDashboardI18N } from '../../locales'
import type { PersonaInformation } from '@masknet/shared'
import { ContentContainer } from '../../components/ContentContainer'
import { PersonaContent } from './components/PersonaContent'
import { PersonaRowCard } from './components/PersonaCard/Row'
import { MaskAvatar } from '../../components/MaskAvatar'

const useStyles = makeStyles()((theme) => ({
    tabPanel: {
        padding: 0,
        flex: 1,
    },
    iconButton: {
        padding: 0,
        fontSize: 16,
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: `1px solid ${MaskColorVar.blue.alpha(0.1)}`,
    },
    arrow: {
        fill: 'none',
        stroke: MaskColorVar.primary,
    },
    label: {
        width: 'auto',
    },
    nickname: {
        margin: theme.spacing(0, 1.5),
        lineHeight: 1.375,
    },
    tab: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
}))

function firstProfileNetwork(x: PersonaInformation | undefined) {
    return x?.linkedProfiles[0]?.identifier?.network
}
function Personas() {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    const { drawerOpen, toggleDrawer, personas, currentPersona, connectPersona, definedSocialNetworks } =
        PersonaContext.useContainer()

    const [activeTab, setActiveTab] = useState(
        firstProfileNetwork(currentPersona) ?? definedSocialNetworks[0].networkIdentifier,
    )

    useEffect(() => {
        setActiveTab(firstProfileNetwork(currentPersona) ?? definedSocialNetworks[0].networkIdentifier)
    }, [currentPersona, definedSocialNetworks])

    return (
        <PageFrame
            title={t.personas()}
            noBackgroundFill={true}
            primaryAction={
                <Box display="flex" alignItems="center">
                    <MaskAvatar onClick={toggleDrawer} />
                    <Typography className={classes.nickname}>{currentPersona?.nickname}</Typography>
                    <IconButton onClick={toggleDrawer} size="small" className={classes.iconButton}>
                        {drawerOpen ? (
                            <ArrowUpRound className={classes.arrow} fontSize="inherit" />
                        ) : (
                            <ArrowDownRound className={classes.arrow} fontSize="inherit" />
                        )}
                    </IconButton>
                </Box>
            }>
            <Paper variant="rounded" sx={{ mb: 3, p: 4 }}>
                <PersonaRowCard />
            </Paper>
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <TabContext value={activeTab}>
                    <Tabs value={!!activeTab ? activeTab : false} onChange={(event, tab) => setActiveTab(tab)}>
                        {definedSocialNetworks.map(({ networkIdentifier }) => (
                            <Tab
                                key={networkIdentifier}
                                value={networkIdentifier}
                                // They should be localizedh
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
                                        onConnect={() => connectPersona(currentPersona.identifier, networkIdentifier)}
                                    />
                                </Stack>
                            </TabPanel>
                        )
                    })}
                </TabContext>
            </ContentContainer>
            <PersonaDrawer personas={personas} />
        </PageFrame>
    )
}

export default Personas
