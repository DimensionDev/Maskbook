import { Tab, Tabs, createStyles, Box, makeStyles } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useEffect, useMemo, useState } from 'react'
import { capitalize, compact, head, isEmpty } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { useDefinedSocialNetworkUIs, useMyPersonas } from './api'
import { useConnectSocialNetwork } from './hooks/useConnectSocialNetwork'
import { AuthorIcon } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { PersonaDrawer } from './components/PersonaDrawer'
import { PersonaState } from './hooks/usePersonaState'
import { useValueRef } from '@dimensiondev/maskbook-shared'
import { currentPersonaSettings, PersonaInfo } from './settings'
import stringify from 'json-stable-stringify'

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

    const { toggleDrawer } = PersonaState.useContainer()
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
                    identifier: persona.identifier.toText(),
                    nickname: persona.nickname,
                    providers: providers,
                }
            })
    }, [myPersonas, definedSocialNetworkUIs])

    const currentPersonaInfo = useMemo(() => {
        return JSON.parse(currentPersona) as PersonaInfo
    }, [currentPersona])

    const [activeTab, setActiveTab] = useState(currentPersonaInfo?.providers?.[0]?.internalName ?? '')

    const [connectState, onConnect] = useConnectSocialNetwork()

    useEffect(() => {
        if (personas.length) {
            currentPersonaSettings.value = stringify(
                isEmpty(currentPersonaInfo)
                    ? head(personas)
                    : personas.find((i) => i.identifier === currentPersonaInfo.identifier),
            )
        }
    }, [currentPersonaInfo, personas])

    useEffect(() => {
        setActiveTab(currentPersonaInfo?.providers?.[0]?.internalName ?? '')
    }, [currentPersonaInfo])

    return (
        <PageFrame
            title="Personas"
            primaryAction={<AuthorIcon onClick={toggleDrawer} style={{ fill: MaskColorVar.secondaryBackground }} />}>
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
