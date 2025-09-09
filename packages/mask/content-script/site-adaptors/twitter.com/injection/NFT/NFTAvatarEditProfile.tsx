import Services from '#services'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarButton } from '@masknet/plugin-avatar'
import { ConnectPersonaBoundary } from '@masknet/shared'
import { CrossIsolationMessages, currentPersonaIdentifier, PluginID } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { useEffect } from 'react'
import { usePersonasFromDB } from '../../../../../shared-ui/hooks/usePersonasFromDB.js'
import { useLastRecognizedIdentity, useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { ButtonStyle, type ButtonProps } from '../../constant.js'
import { searchEditProfileSelector } from '../../utils/selector.js'
import { injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog } from './NFTAvatarEditProfileDialog.js'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    injectOpenNFTAvatarEditProfileButtonAtProfilePage(signal)
    injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog(signal)
}

function injectOpenNFTAvatarEditProfileButtonAtProfilePage(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchEditProfileSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.beforeShadow, { untilVisible: true, signal }).render(
        <OpenNFTAvatarEditProfileButtonInTwitter />,
    )
}

const useStyles = makeStyles<ButtonProps>()((theme, props) => ({
    root: {
        minHeight: props.buttonSize,
        marginBottom: props.marginBottom,
        marginTop: 1,
        marginRight: theme.spacing(2),
        height: props.buttonSize,
    },
    text: {
        fontWeight: 700,
        fontSize: props.fontSize,
    },
}))

export function openNFTAvatarSettingDialog() {
    const editDom = searchEditProfileSelector().evaluate()
    editDom?.click()
}

function useNFTAvatarButtonStyles() {
    const themeSettings = useThemeSettings()
    const style = ButtonStyle[themeSettings.size]
    return useStyles(style)
}
function requestSettingAvatar() {
    CrossIsolationMessages.events.avatarSettingsDialogEvent.sendToLocal({
        open: true,
        startPicking: true,
    })
}
function OpenNFTAvatarEditProfileButtonInTwitter() {
    const { classes } = useNFTAvatarButtonStyles()
    const allPersonas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    useEffect(() => {
        const clearTasks = [
            CrossIsolationMessages.events.personaBindFinished.on((ev) => {
                if (!(ev.pluginID === PluginID.Avatar)) return
                requestSettingAvatar()
            }),
            CrossIsolationMessages.events.applicationDialogEvent.on((ev) => {
                if (!(ev.pluginID === PluginID.Avatar && ev.isVerified)) return
                requestSettingAvatar()
            }),
        ]

        return () => {
            clearTasks.forEach((task) => task())
        }
    }, [])

    return (
        <ConnectPersonaBoundary
            personas={allPersonas}
            identity={lastRecognized}
            currentPersonaIdentifier={currentIdentifier}
            openDashboard={Services.Helper.openDashboard}
            handlerPosition="top-right"
            customHint>
            <NFTAvatarButton classes={{ root: classes.root, text: classes.text }} onClick={requestSettingAvatar} />
        </ConnectPersonaBoundary>
    )
}
