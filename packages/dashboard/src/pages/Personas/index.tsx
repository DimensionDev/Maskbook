import { Tab, Tabs, Box, makeStyles, Typography, IconButton } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useEffect, useMemo, useState } from 'react'
import { capitalize, compact, head, isEmpty } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { useDefinedSocialNetworkUIs, useMyPersonas } from './api'
import { useConnectSocialNetwork } from './hooks/useConnectSocialNetwork'
import { AuthorIcon, ArrowDownRound, ArrowUpRound } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { PersonaDrawer } from './components/PersonaDrawer'
import { PersonaState } from './hooks/usePersonaState'
import { useValueRef } from '@dimensiondev/maskbook-shared'
import { currentPersonaSettings } from './settings'
import type { PersonaInfo } from './type'
import stringify from 'json-stable-stringify'
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
        border: `1px solid ${MaskColorVar.blue}`,
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

export default function Personas() {
    const classes = useStyles()
    const t = useDashboardI18N()
    const { drawerOpen, toggleDrawer } = PersonaState.useContainer()
    const definedSocialNetworkUIs = useDefinedSocialNetworkUIs()
    const myPersonas = useMyPersonas()
    const currentPersona = useValueRef(currentPersonaSettings)
    const personas = useMemo(() => {
        return myPersonas
            .sort((a, b) => {
                if (a.updatedAt > b.updatedAt) return -1
                if (a.updatedAt < b.updatedAt) return 1
                return 0
            })
            .map((persona) => {
                const profiles = persona ? [...persona.linkedProfiles] : []
                const providers = compact(
                    definedSocialNetworkUIs.map((i) => {
                        const profile = profiles.find(([key]) => key.network === i.networkIdentifier)
                        if (i.networkIdentifier === 'localhost') return null
                        return {
                            internalName: i.networkIdentifier,
                            network: i.networkIdentifier,
                            connected: !!profile,
                            userId: profile?.[0].userId,
                            identifier: profile?.[0],
                        }
                    }),
                )

                return {
                    identifier: persona.identifier,
                    nickname: persona.nickname,
                    providers: providers,
                }
            })
    }, [myPersonas, definedSocialNetworkUIs])

    const currentPersonaInfo = useMemo<PersonaInfo>(() => {
        return JSON.parse(currentPersona)
    }, [currentPersona])

    const [activeTab, setActiveTab] = useState(currentPersonaInfo?.providers?.[0]?.internalName ?? '')

    const [, onConnect] = useConnectSocialNetwork()

    useEffect(() => {
        if (personas.length) {
            //#region when the personas changed, update the currentPersona Info
            const persona = isEmpty(currentPersonaInfo)
                ? head(personas)
                : personas.find((i) => i.identifier.toText() === currentPersonaInfo.identifier)
            currentPersonaSettings.value = stringify({
                ...persona,
                identifier: persona!.identifier.toText(),
            })
        }
    }, [currentPersonaInfo, personas])

    useEffect(() => {
        setActiveTab(currentPersonaInfo?.providers?.[0]?.internalName ?? '')
    }, [currentPersonaInfo])

    return (
        <PageFrame
            title={t.personas()}
            primaryAction={
                <Box display="flex" alignItems="center">
                    <AuthorIcon onClick={toggleDrawer} className={classes.author} />
                    <Typography className={classes.nickname}>{currentPersonaInfo.nickname}</Typography>
                    <IconButton onClick={toggleDrawer} size="small" className={classes.iconButton}>
                        {drawerOpen ? (
                            <ArrowDownRound className={classes.arrow} fontSize="inherit" />
                        ) : (
                            <ArrowUpRound className={classes.arrow} fontSize="inherit" />
                        )}
                    </IconButton>
                </Box>
            }>
            <Box className={classes.container}>
                <TabContext value={activeTab}>
                    <Tabs value={!!activeTab ? activeTab : false} onChange={(event, tab) => setActiveTab(tab)}>
                        {currentPersonaInfo?.providers?.map(({ internalName }) => (
                            <Tab
                                key={internalName}
                                value={internalName}
                                label={capitalize(internalName.replace('.com', ''))}
                                classes={{ wrapper: classes.wrapper }}
                            />
                        ))}
                    </Tabs>
                    {currentPersonaInfo?.providers?.map((provider) => (
                        <TabPanel key={provider.internalName} value={provider.internalName}>
                            <PersonaSetup
                                provider={provider}
                                onConnect={() => {
                                    if (currentPersonaInfo.identifier) {
                                        onConnect(currentPersonaInfo.identifier, provider)
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
