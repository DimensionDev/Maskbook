import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '@masknet/plugin-avatar'
import { startWatch, createReactRootShadowed, MaskMessages } from '../../../../utils/index.js'
import { searchEditProfileSelector } from '../../utils/selector.js'
import { PluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog } from './NFTAvatarEditProfileDialog.js'
import { ButtonStyle, ButtonProps } from '../../constant.js'
import { useLastRecognizedIdentity, useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { usePersonasFromDB } from '../../../../components/DataSource/usePersonasFromDB.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { currentPersonaIdentifier } from '../../../../../shared/legacy-settings/settings.js'
import { ConnectPersonaBoundary } from '@masknet/shared'
import Services from '../../../../extension/service.js'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    injectOpenNFTAvatarEditProfileButtonAtProfilePage(signal)
    injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog(signal)
}

export function injectOpenNFTAvatarEditProfileButtonAtProfilePage(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchEditProfileSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { untilVisible: true, signal }).render(
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
function OpenNFTAvatarEditProfileButtonInTwitter() {
    const { classes } = useNFTAvatarButtonStyles()
    const allPersonas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const clickHandler = () => {
        CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
            open: true,
            pluginID: PluginID.Avatar,
        })
    }

    return (
        <ConnectPersonaBoundary
            currentPersonaIdentifier={currentIdentifier}
            personas={allPersonas}
            identity={lastRecognized}
            openDashboard={Services.Helper.openDashboard}
            ownPersonaChanged={MaskMessages.events.ownPersonaChanged}
            handlerPosition="top-right"
            customHint
            directTo={PluginID.Avatar}>
            <NFTAvatarButton classes={{ root: classes.root, text: classes.text }} onClick={clickHandler} />
        </ConnectPersonaBoundary>
    )
}
