import { memo, useCallback, useState } from 'react'
import { FacebookIcon, TwitterIcon, InstagramIcon } from '@dimensiondev/icons'
import { makeStyles, Typography } from '@material-ui/core'
import { useDashboardI18N } from '../../../locales'
import { SocialNetwork, useDefinedSocialNetworkUIs, useOwnedPersonas } from '../../Personas/api'
import { useConnectSocialNetwork } from '../../Personas/hooks/useConnectSocialNetwork'
import { ContainerPage } from '../Components/ContainerPage'
import { StartupActionList, StartupActionListItem } from '../../../components/StartupActionList'
import { ECKeyIdentifier, Persona, Identifier, delay } from '@dimensiondev/maskbook-shared'
import { Services } from '../../../API'
import { useAsync } from 'react-use'
import { useQueryParams } from '../hooks/useQueryParams'
import { RoutePaths } from '../../routes'
import { useNavigate } from 'react-router-dom'

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

    //#region
    const Navigate = useNavigate()
    const onClick = useCallback(
        async (networkIdentifier: string) => {
            connectPersona(persona?.identifier!, networkIdentifier)
            await delay(300)
            Navigate(RoutePaths.Personas)
        },
        [persona],
    )
    //#endregion

    //#region
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
    //#endregion
    return (
        <ContainerPage>
            <>
                <div className={classes.title}>
                    <Typography variant="h5">
                        {t.register_connect_network_title({ name: persona?.nickname })}
                    </Typography>
                </div>
                <StartupActionList>
                    {definedSocialNetworks.map(({ networkIdentifier }) => {
                        return (
                            <StartupActionListItem
                                key={networkIdentifier}
                                icon={NetworkIcon(networkIdentifier)}
                                title={t.personas_connect_to({ internalName: networkIdentifier })}
                                description=""
                                action={t.register_login_connect()}
                                onClick={() => onClick(networkIdentifier)}
                            />
                        )
                    })}
                </StartupActionList>
            </>
        </ContainerPage>
    )
})

export default ConnectSocialNetwork
