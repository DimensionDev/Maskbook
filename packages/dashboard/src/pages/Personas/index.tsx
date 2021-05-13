import { Tab, Tabs, Box, makeStyles, Typography, IconButton } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useEffect, useState } from 'react'
import { capitalize } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { AuthorIcon, ArrowDownRound, ArrowUpRound } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { PersonaDrawer } from './components/PersonaDrawer'
import { PersonaContext } from './hooks/usePersonaContext'
import { useDashboardI18N } from '../../locales'

const useStyles = makeStyles((theme) => ({
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

function Personas() {
    const classes = useStyles()
    const t = useDashboardI18N()
    const { drawerOpen, toggleDrawer, personas, currentPersona, onConnect } = PersonaContext.useContainer()

    const [activeTab, setActiveTab] = useState(currentPersona?.providers?.[0]?.networkIdentifier ?? '')

    useEffect(() => {
        setActiveTab(currentPersona?.providers?.[0]?.networkIdentifier ?? '')
    }, [currentPersona])

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
            <Box className={classes.container}>
                <TabContext value={activeTab}>
                    <Tabs value={!!activeTab ? activeTab : false} onChange={(event, tab) => setActiveTab(tab)}>
                        {currentPersona?.providers?.map(({ networkIdentifier }) => (
                            <Tab
                                key={networkIdentifier}
                                value={networkIdentifier}
                                label={capitalize(networkIdentifier.replace('.com', ''))}
                                classes={{ wrapper: classes.wrapper }}
                            />
                        ))}
                    </Tabs>
                    {currentPersona?.providers?.map((provider) => (
                        <TabPanel key={provider.networkIdentifier} value={provider.networkIdentifier}>
                            <PersonaSetup
                                connected={provider.connected}
                                networkIdentifier={provider.networkIdentifier}
                                onConnect={() => {
                                    if (currentPersona.identifier) {
                                        onConnect(currentPersona.identifier, provider.networkIdentifier)
                                    }
                                }}
                            />
                        </TabPanel>
                    ))}
                </TabContext>
            </Box>
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
