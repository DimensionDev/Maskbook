import { PluginID } from '@masknet/plugin-infra'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { startWatch, createReactRootShadowed } from '../../../../utils'
import { searchProfileAvatarSelector } from '../../utils/selector'
import { ConnectPersonaBoundary } from '../../../../components/shared/ConnectPersonaBoundary'

export function injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInTwitter />,
    )
}

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        top: 211,
        right: 16,
        position: 'absolute',
    },
    button: {
        height: 32,
    },
}))

function OpenNFTAvatarEditProfileButtonInTwitter() {
    const clickHandler = () => {
        CrossIsolationMessages.events.requestOpenApplication.sendToLocal({
            open: true,
            application: PluginID.Avatar,
        })
    }

    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            <ConnectPersonaBoundary handlerPosition="top-right" customHint directTo={PluginID.Avatar}>
                <NFTAvatarButton classes={{ root: classes.button }} onClick={clickHandler} />
            </ConnectPersonaBoundary>
        </div>
    )
}
