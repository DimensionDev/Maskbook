import { memo, useState } from 'react'
import { FacebookIcon, TwitterIcon, InstagramIcon } from '@dimensiondev/icons'
import { makeStyles, Typography } from '@material-ui/core'
import { useDashboardI18N } from '../../../locales'
import { SocialNetwork, useDefinedSocialNetworkUIs, useOwnedPersonas } from '../../Personas/api'
import { useConnectSocialNetwork } from '../../Personas/hooks/useConnectSocialNetwork'
import { ContainerPage } from '../Components/ContainerPage'
import { StartupActionList, StartupActionListItem } from '../../../components/StartupActionList'
import { ECKeyIdentifier, Persona, Identifier } from '@dimensiondev/maskbook-shared'
import { Services } from '../../../API'
import { useAsync } from 'react-use'
import { useQueryParams } from '../hooks/useQueryParams'

const useStyles = makeStyles((theme) => ({
    title: {
        marginBottom: theme.spacing(8),
    },
}))

const NetworkIcon = (networkIdentifier: string) => {
    if (networkIdentifier === 'twitter.com') return <TwitterIcon fontSize="inherit" />
    if (networkIdentifier === 'facebook.com') return <FacebookIcon fontSize="inherit" />
    if (networkIdentifier === 'instagram.com') return <InstagramIcon fontSize="inherit" />
    return <TwitterIcon fontSize="inherit" />
}

export const ConnectSocialNetwork = memo(() => {
    const t = useDashboardI18N()
    const classes = useStyles()
    const definedSocialNetworks: SocialNetwork[] = useDefinedSocialNetworkUIs()

    const [persona, setPersona] = useState<Persona | null>(null)

    const personas = useOwnedPersonas()
    const { identifier } = useQueryParams(['identifier'])

    const [, connectPersona] = useConnectSocialNetwork()

    const {
        value = null,
        loading,
        error,
    } = useAsync(async () => {
        const persona = personas.find((x) => x.identifier.toText() === identifier)
        // auto-finished by setup guide
        return identifier
            ? Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap())
            : null
    }, [identifier, personas])

    // update persona when link/unlink really happen
    if (!loading && value?.linkedProfiles.size !== persona?.linkedProfiles.size) setPersona(value)

    // prevent from displaying persona's nickname as 'undefined'
    if (!persona?.nickname) return null

    return (
        <ContainerPage>
            <>
                <div className={classes.title}>
                    <Typography variant="h5">Connect Socail Media Profile from "{persona?.nickname}"</Typography>
                </div>
                <StartupActionList>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        return (
                            <StartupActionListItem
                                icon={NetworkIcon(networkIdentifier)}
                                title={t.personas_connect_to({ internalName: networkIdentifier })}
                                description={''}
                                action={t.register_login_connect()}
                                onClick={() => connectPersona(persona?.identifier, networkIdentifier)}
                            />
                        )
                    })}
                </StartupActionList>
            </>
        </ContainerPage>
    )
})

export default ConnectSocialNetwork
