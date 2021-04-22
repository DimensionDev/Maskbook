import { Tab, Tabs, createStyles, Box } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useEffect, useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { capitalize, compact, head, isEmpty } from 'lodash-es'
import { TabContext, TabPanel } from '@material-ui/lab'
import { PersonaSetup } from './components/PersonaSetup'
import { useDefinedSocialNetworkUIs } from './api'
import { useConnectSocialNetwork } from './hooks/useConnectSocialNetwork'
import { AuthorIcon } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { PersonaDrawer } from './components/PersonaDrawer'
import { PersonaState } from './hooks/usePersonaState'
import { useMyPersonas } from '../../../../maskbook/src/components/DataSource/useMyPersonas'
import { useValueRef } from '../../../../maskbook/src/utils/hooks/useValueRef'
import { CurrentPersona, currentPersonaSettings } from './settings'
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

    const definedSocialNetworkUIs = useDefinedSocialNetworkUIs()
    const myPersonas = useMyPersonas()
    const currentPersona = useValueRef(currentPersonaSettings)

    const definedSocialNetworkProviders = [...definedSocialNetworkUIs.values()]
    const personas = myPersonas
        .sort((a, b) => {
            if (a.updatedAt > b.updatedAt) return -1
            if (a.updatedAt < b.updatedAt) return 1
            return 0
        })
        .map((persona) => {
            const profiles = persona ? [...persona.linkedProfiles] : []
            const providers = compact(
                definedSocialNetworkProviders.map((i) => {
                    const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
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
                persona: persona,
                providers: providers,
            }
        })

    useEffect(() => {
        if (isEmpty(JSON.parse(currentPersona)) && personas.length) {
            currentPersonaSettings.value = stringify(head(personas))
        }
    }, [currentPersona, personas])

    const currentPersonaProviders = useMemo(() => {
        const persona = JSON.parse(currentPersona) as CurrentPersona
        return persona?.providers ?? []
    }, [currentPersona])

    const [activeTab, setActiveTab] = useState(currentPersonaProviders[0]?.internalName ?? '')
    const [connectState, onConnect] = useConnectSocialNetwork()
    const { toggleDrawer } = PersonaState.useContainer()

    return (
        <PageFrame
            title="Personas"
            primaryAction={<AuthorIcon onClick={toggleDrawer} style={{ fill: MaskColorVar.secondaryBackground }} />}>
            <Box className={classes.container}>
                <TabContext value={activeTab}>
                    <Tabs value={activeTab} onChange={(event, tab) => setActiveTab(tab)}>
                        {currentPersonaProviders.map(({ internalName }) => (
                            <Tab
                                key={internalName}
                                value={internalName}
                                label={capitalize(internalName.replace('.com', ''))}
                                classes={{ wrapper: classes.wrapper }}
                            />
                        ))}
                    </Tabs>
                    {currentPersonaProviders.map((provider) => (
                        <TabPanel key={provider.internalName} value={provider.internalName}>
                            <PersonaSetup provider={provider} onConnect={onConnect} />
                        </TabPanel>
                    ))}
                </TabContext>
            </Box>
            <PersonaDrawer personas={personas} />
        </PageFrame>
    )
}
