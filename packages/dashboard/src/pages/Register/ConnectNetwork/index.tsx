import { memo } from 'react'
import { FacebookIcon, TwitterIcon, InstagramIcon } from '@dimensiondev/icons'
import { makeStyles, Typography } from '@material-ui/core'
import { useDashboardI18N } from '../../../locales'
import {
    SocialNetwork,
    useCurrentPersonaIdentifier,
    useDefinedSocialNetworkUIs,
    useOwnedPersonas,
} from '../../Personas/api'
import { useConnectSocialNetwork } from '../../Personas/hooks/useConnectSocialNetwork'
import { ContainerPage } from '../Components/ContainerPage'
import { StartupActionList, StartupActionListItem } from '../../../components/StartupActionList'

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
    const personas = useOwnedPersonas()
    const currentPersonaIdentifier = useCurrentPersonaIdentifier()
    const currentPersona = personas.find((x) => x.identifier.equals(currentPersonaIdentifier))
    const [, connectPersona] = useConnectSocialNetwork()

    return (
        <ContainerPage>
            <>
                <div className={classes.title}>
                    <Typography variant="h5">Connect Socail Media Profile from "{currentPersona?.nickname}"</Typography>
                </div>
                <StartupActionList>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        if (!currentPersona) return null
                        return (
                            <StartupActionListItem
                                icon={NetworkIcon(networkIdentifier)}
                                title={t.personas_connect_to({ internalName: networkIdentifier })}
                                description={''}
                                action={t.register_login_connect()}
                                onClick={() => connectPersona(currentPersona?.identifier, networkIdentifier)}
                            />
                        )
                    })}
                </StartupActionList>
            </>
        </ContainerPage>
    )
})

export default ConnectSocialNetwork
