import { useEffect } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarButton } from '@masknet/plugin-avatar'
import { ConnectPersonaBoundary } from '@masknet/shared'
import { CrossIsolationMessages, PluginID, currentPersonaIdentifier } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import {
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useThemeSettings,
} from '../../../../components/DataSource/useActivatedUI.js'
import { usePersonasFromDB } from '../../../../../shared-ui/hooks/usePersonasFromDB.js'
import Services from '#services'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { ButtonStyle } from '../../constant.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { searchProfileAvatarSelector, searchProfileSaveSelector } from '../../utils/selector.js'

export function injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileAvatarSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <OpenNFTAvatarEditProfileButtonInTwitter />,
    )

    // clear cache
    const saveButtonWatcher = new MutationObserverWatcher(searchProfileSaveSelector()).useForeach(
        (node, key, proxy) => {
            const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
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

function clickHandler() {
    CrossIsolationMessages.events.avatarSettingsDialogEvent.sendToLocal({
        open: true,
    })
}
function OpenNFTAvatarEditProfileButtonInTwitter() {
    const personas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const themeSettings = useThemeSettings()
    const buttonStyle = ButtonStyle[themeSettings.size]

    const { classes } = useStyles({ buttonSize: buttonStyle.buttonSize, fontSize: buttonStyle.fontSize })

    return (
        <div className={classes.root}>
            <ConnectPersonaBoundary
                personas={personas}
                identity={lastRecognized}
                currentPersonaIdentifier={currentIdentifier}
                openDashboard={Services.Helper.openDashboard}
                handlerPosition="top-right"
                customHint
                directTo={PluginID.Avatar}>
                <NFTAvatarButton classes={{ root: classes.button, text: classes.text }} onClick={clickHandler} />
            </ConnectPersonaBoundary>
        </div>
    )
}
