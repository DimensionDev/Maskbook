import { PluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton.js'
import { startWatch, createReactRootShadowed } from '../../../../utils/index.js'
import { searchProfileAvatarSelector, searchProfileSaveSelector } from '../../utils/selector.js'
import { ConnectPersonaBoundary } from '../../../../components/shared/ConnectPersonaBoundary.js'
import { useCurrentVisitingIdentity, useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { ButtonStyle } from '../../constant.js'
import { useEffect } from 'react'
import { Twitter } from '@masknet/web3-providers'

export function injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <OpenNFTAvatarEditProfileButtonInTwitter />,
    )

    // clear cache
    const saveButtonWatcher = new MutationObserverWatcher(searchProfileSaveSelector()).useForeach(
        (node, key, proxy) => {
            const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
            root.render(<NFTAvatarSave />)
            return () => root.destroy()
        },
    )

    startWatch(saveButtonWatcher, signal)
}

function NFTAvatarSave() {
    const identity = useCurrentVisitingIdentity()
    useEffect(() => {
        if (!identity.identifier?.userId) return
        const saveButton = searchProfileSaveSelector().evaluate()
        if (!saveButton) return
        const clearCache = () => {
            Twitter.staleUserByScreenName(identity.identifier?.userId ?? '')
        }
        saveButton.addEventListener('click', clearCache)
        return () => saveButton.removeEventListener('click', clearCache)
    }, [identity.identifier?.userId])
    return null
}
const useStyles = makeStyles<{ buttonSize: number; fontSize: number }>()((theme, { buttonSize, fontSize }) => ({
    root: {
        display: 'flex',
        top: 211,
        right: 16,
        position: 'absolute',
    },
    button: {
        height: buttonSize,
    },
    text: {
        fontWeight: 700,
        fontSize,
    },
}))

function OpenNFTAvatarEditProfileButtonInTwitter() {
    const clickHandler = () => {
        CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
            open: true,
            pluginID: PluginID.Avatar,
        })
    }
    const themeSettings = useThemeSettings()
    const buttonStyle = ButtonStyle[themeSettings.size]

    const { classes } = useStyles({ buttonSize: buttonStyle.buttonSize, fontSize: buttonStyle.fontSize })
    return (
        <div className={classes.root}>
            <ConnectPersonaBoundary handlerPosition="top-right" customHint directTo={PluginID.Avatar}>
                <NFTAvatarButton classes={{ root: classes.button, text: classes.text }} onClick={clickHandler} />
            </ConnectPersonaBoundary>
        </div>
    )
}
