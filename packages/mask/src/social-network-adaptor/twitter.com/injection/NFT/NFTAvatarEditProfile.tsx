import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton.js'
import { startWatch, createReactRootShadowed } from '../../../../utils/index.js'
import { searchEditProfileSelector } from '../../utils/selector.js'
import { ConnectPersonaBoundary } from '../../../../components/shared/ConnectPersonaBoundary.js'
import { PluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { injectOpenNFTAvatarEditProfileButtonAtEditProfileDialog } from './NFTAvatarEditProfileDialog.js'
import { useLocation } from 'react-use'

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

interface StyleProps {
    minHeight: number
    fontSize: number
    marginBottom: number
    color: string
    height: number
    fontWeight: string
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        minHeight: props.minHeight,
        fontSize: props.fontSize,
        marginBottom: props.marginBottom,
        marginTop: 1,
        marginRight: theme.spacing(2),
        height: props.height,
    },
    text: {
        fontWeight: props.fontWeight,
    },
}))

export function openNFTAvatarSettingDialog() {
    const editDom = searchEditProfileSelector().evaluate()
    editDom?.click()
}

function useNFTAvatarButtonStyles() {
    const setStyleFromEditProfileSelector = () => {
        const editDom = searchEditProfileSelector().evaluate()
        if (!editDom)
            return {
                minHeight: 32,
                fontSize: 14,
                marginBottom: 11,
                color: '',
                height: 36,
                fontWeight: '400',
            }
        const css = window.getComputedStyle(editDom)
        const fontWeightCss = window.getComputedStyle(editDom.firstChild! as HTMLDivElement)
        const spanCss = window.getComputedStyle(editDom.querySelector('span')!)
        return {
            height: Number.parseFloat(css.height.replace('px', '')),
            minHeight: Number.parseFloat(css.minHeight.replace('px', '')),
            fontSize: Number.parseFloat(css.fontSize.replace('px', '')),
            marginBottom: Number.parseFloat(css.marginBottom.replace('px', '')),
            color: spanCss.color,
            fontWeight: fontWeightCss.fontWeight,
        }
    }
    const location = useLocation()
    const style = useMemo(() => setStyleFromEditProfileSelector(), [location])
    return useStyles(style)
}
function OpenNFTAvatarEditProfileButtonInTwitter() {
    const { classes } = useNFTAvatarButtonStyles()

    const clickHandler = () => {
        CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
            open: true,
            pluginID: PluginID.Avatar,
        })
    }

    return (
        <ConnectPersonaBoundary handlerPosition="top-right" customHint directTo={PluginID.Avatar}>
            <NFTAvatarButton classes={{ root: classes.root, text: classes.text }} onClick={clickHandler} />
        </ConnectPersonaBoundary>
    )
}
