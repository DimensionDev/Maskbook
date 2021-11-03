import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { startWatch, createReactRootShadowed } from '../../../../utils'
import { searchEditProfileSelector } from '../../utils/selector'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchEditProfileSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInTwitter />,
    )
}

interface StyleProps {
    minHeight: number
    fontSize: number
    marginBottom: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        minHeight: props.minHeight,
        fontSize: props.fontSize,
        marginBottom: props.marginBottom,
        marginTop: 1,
        marginRight: theme.spacing(0.5),
    },
}))

function OpenNFTAvatarEditProfileButtonInTwitter() {
    const editDom = searchEditProfileSelector().evaluate()
    const onClick = () => {
        editDom?.click()
    }

    const styles: StyleProps = {
        minHeight: 32,
        fontSize: 14,
        marginBottom: 11,
    }
    if (editDom) {
        const css = window.getComputedStyle(editDom)
        styles.minHeight = Number(css.minHeight.replace('px', ''))
        styles.fontSize = Number(css.fontSize.replace('px', ''))
        styles.marginBottom = Number(css.marginBottom.replace('px', ''))
    }
    console.log(styles)
    const { classes } = useStyles(styles)
    return <NFTAvatarButton classes={{ root: classes.root }} onClick={onClick} />
}
