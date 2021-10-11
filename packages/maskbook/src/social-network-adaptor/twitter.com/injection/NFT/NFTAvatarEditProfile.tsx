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

const useStyles = makeStyles()((theme) => ({
    root: {
        minHeight: 32,
        fontSize: 14,
        marginBottom: 11,
        marginTop: 1,
        marginRight: theme.spacing(0.5),
    },
}))

function OpenNFTAvatarEditProfileButtonInTwitter() {
    const editDom = searchEditProfileSelector().evaluate()
    const onClick = () => {
        editDom?.click()
    }
    const { classes } = useStyles()
    return <NFTAvatarButton classes={{ root: classes.root }} onClick={onClick} />
}
