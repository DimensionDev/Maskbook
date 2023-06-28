import { useEffect } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarButton } from '@masknet/plugin-avatar'
import { ConnectPersonaBoundary } from '@masknet/shared'
import { useValueRef } from '@masknet/shared'
import { CrossIsolationMessages, MaskMessages, PluginID, currentPersonaIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'

import {
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useThemeSettings,
} from '../../../../components/DataSource/useActivatedUI.js'
import { usePersonasFromDB } from '../../../../components/DataSource/usePersonasFromDB.js'
import { Services } from '../../../../extension/service.js'
import { attachReactTreeWithContainer, startWatch } from '../../../../utils/index.js'
import { ButtonStyle } from '../../constant.js'
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
    CrossIsolationMessages.events.avatarSettingDialogEvent.sendToLocal({
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
                ownPersonaChanged={MaskMessages.events.ownPersonaChanged}
                ownProofChanged={MaskMessages.events.ownProofChanged}
                handlerPosition="top-right"
                customHint
                directTo={PluginID.Avatar}>
                <NFTAvatarButton classes={{ root: classes.button, text: classes.text }} onClick={clickHandler} />
            </ConnectPersonaBoundary>
        </div>
    )
}
