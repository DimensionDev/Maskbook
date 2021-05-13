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
import type { PersonaInformation } from '@dimensiondev/maskbook-shared'
import { useProfiles } from './hooks/useProfiles'

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

function firstProfileNetwork(x: PersonaInformation | undefined) {
    return x?.linkedProfiles[0]?.identifier?.network
}
function Personas() {
    const classes = useStyles()
    const t = useDashboardI18N()
    const { drawerOpen, toggleDrawer, personas, currentPersona, onConnect, definedSocialNetworkUIs } =
        PersonaContext.useContainer()

    const [activeTab, setActiveTab] = useState(
        firstProfileNetwork(currentPersona) ?? definedSocialNetworkUIs[0].networkIdentifier,
    )

    const providerUIs = useProfiles(currentPersona?.linkedProfiles)

    useEffect(() => {
        setActiveTab(firstProfileNetwork(currentPersona) ?? definedSocialNetworkUIs[0].networkIdentifier)
    }, [currentPersona, definedSocialNetworkUIs])

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
                        {providerUIs?.map(({ identifier }) => (
                            <Tab
                                key={identifier.network}
                                value={identifier.network}
                                label={capitalize(identifier.network.replace('.com', ''))}
                                classes={{ wrapper: classes.wrapper }}
                            />
                        ))}
                    </Tabs>
                    {providerUIs?.map(({ identifier }) => (
                        <TabPanel key={identifier.network} value={identifier.network}>
                            {identifier.userId ? null : (
                                <PersonaSetup
                                    networkIdentifier={identifier.network}
                                    onConnect={() => {
                                        if (currentPersona?.identifier) {
                                            onConnect(currentPersona.identifier, identifier.network)
                                        }
                                    }}
                                />
                            )}
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
