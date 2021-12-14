import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared-evm'
import { PluginMessages, Services } from '../../../API'
import { PLUGIN_IDS } from '../../../pages/Labs/constants'
import { PersonaContext } from '../../../pages/Personas/hooks/usePersonaContext'
import { DashboardRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(3.125),
        display: 'flex',
        flexDirection: 'column',
        '& > *': {
            marginBottom: theme.spacing(2),
        },
        [theme.breakpoints.down('md')]: {
            display: 'none',
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
    const account = useAccount()

    const { currentPersona, connectPersona } = PersonaContext.useContainer()
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginMessages.Transak.buyTokenDialogUpdated)

    const isConnectedTwitter = useMemo(() => {
        if (!currentPersona) return false

        const { linkedProfiles } = currentPersona
        if (linkedProfiles.length === 0) return false

        return !!linkedProfiles.find((profile) => profile.identifier.network === TWITTER_NETWORK)
    }, [currentPersona])

    const openTransakDialog = useCallback(() => {
        setBuyDialog({
            open: true,
            address: account ?? '',
        })
    }, [])

    const openTwitter = (pluginId: string) => async () => {
        if (!currentPersona) {
            navigate(DashboardRoutes.SignUp)
            return
        }
        if (isConnectedTwitter) {
            await Services.SocialNetwork.openSNSAndActivatePlugin(`${TWITTER_ADDRESS}/home`, pluginId)
            return
        }
        connectPersona(currentPersona.identifier, TWITTER_NETWORK)
    }

    const openMaskNetwork = () => window.open(`${TWITTER_ADDRESS}/realMaskNetwork`)

    return (
        <div className={classes.container}>
            <img
                className={classes.img}
                onClick={openTwitter(PLUGIN_IDS.RED_PACKET)}
                src={new URL('./SendLuckyDrop.png', import.meta.url).toString()}
            />
            <img
                className={classes.img}
                onClick={openTransakDialog}
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
