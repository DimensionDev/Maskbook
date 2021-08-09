import { Tab, Tabs, Box, makeStyles, Typography, IconButton } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useEffect, useState } from 'react'
import { capitalize } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { AuthorIcon, ArrowDownRound, ArrowUpRound } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { PersonaDrawer } from './components/PersonaDrawer'
import { PersonaContext } from './hooks/usePersonaContext'
import { useDashboardI18N } from '../../locales'
import type { PersonaInformation } from '@masknet/shared'
import { ContentContainer } from '../../components/ContentContainer'

const useStyles = makeStyles((theme) => ({
    tabPanel: {
        padding: 0,
        flex: 1,
    },
    author: {
        fill: MaskColorVar.secondaryBackground,
        width: 36,
        height: 36,
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
}))

function firstProfileNetwork(x: PersonaInformation | undefined) {
    return x?.linkedProfiles[0]?.identifier?.network
}
function Personas() {
    const classes = useStyles()
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
            primaryAction={
                <Box display="flex" alignItems="center">
                    <AuthorIcon onClick={toggleDrawer} className={classes.author} />
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
            <ContentContainer>
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
                        if (profile) return <TabPanel key={networkIdentifier} value={networkIdentifier} />
                        return (
                            <TabPanel key={networkIdentifier} value={networkIdentifier} sx={{ flex: 1 }}>
                                <PersonaSetup
                                    networkIdentifier={networkIdentifier}
                                    onConnect={() => connectPersona(currentPersona.identifier, networkIdentifier)}
                                />
                            </TabPanel>
                        )
                    })}
                </TabContext>
            </ContentContainer>
            <PersonaDrawer personas={personas} />
        </PageFrame>
    )
}

export default function () {
    return (
        <PersonaContext.Provider>
            <Personas />
        </PersonaContext.Provider>
    )
}
