import { memo, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { PluginMessages, Services } from '../../../API'
import { PLUGIN_IDS } from '../../../pages/Labs/constants'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PersonaContext } from '../../../pages/Personas/hooks/usePersonaContext'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../type'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(3.125),
        display: 'flex',
        flexDirection: 'column',
        '& > *': {
            marginBottom: theme.spacing(2),
        },
    },
    img: {
        fill: 'none',
        width: 250,
        height: 140,
        cursor: 'pointer',
    },
}))

const TWITTER_NETWORK = 'twitter.com'
const TWITTER_ADDRESS = 'https://www.twitter.com'

export const FeaturePromotions = memo(() => {
    const { classes } = useStyles()
    const navigate = useNavigate()

    const { currentPersona, connectPersona } = PersonaContext.useContainer()
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const isConnectedTwitter = useMemo(() => {
        if (!currentPersona) return false

        const { linkedProfiles } = currentPersona
        if (linkedProfiles.length === 0) return false

        return !!linkedProfiles.find((profile) => profile.identifier.network === TWITTER_NETWORK)
    }, [currentPersona])

    const openTwitter = (pluginId: string) => async () => {
        if (!currentPersona) {
            navigate(RoutePaths.SignUp)
            return
        }
        if (isConnectedTwitter) {
            await Services.Settings.openSNSAndActivatePlugin(`${TWITTER_ADDRESS}/home`, pluginId)
            return
        }
        connectPersona(currentPersona.identifier, TWITTER_NETWORK)
    }

    const openMaskNetwork = () => Services.Settings.openSNSAndActivatePlugin(`${TWITTER_ADDRESS}/realmaskbook`, '')

    return (
        <div className={classes.container}>
            <img
                className={classes.img}
                onClick={openTwitter(PLUGIN_IDS.RED_PACKET)}
                src={new URL('./SendRedPacket.png', import.meta.url).toString()}
            />
            <img
                className={classes.img}
                onClick={openTwitter(PLUGIN_IDS.MARKETS)}
                src={new URL('./ITO.png', import.meta.url).toString()}
            />
            <img
                className={classes.img}
                onClick={openSwapDialog}
                src={new URL('./BuyETH.png', import.meta.url).toString()}
            />
            <img
                onClick={openMaskNetwork}
                className={classes.img}
                src={new URL('./FollowUs.png', import.meta.url).toString()}
                style={{ height: 80 }}
            />
        </div>
    )
})
