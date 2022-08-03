import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { searchFacebookProfileCoverSelector } from '../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover'

export function injectFacebookProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookProfileCoverSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtFacebook />)
}

const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
    },
}))

export function ProfileCoverAtFacebook() {
    const { classes } = useStyles()
    return <ProfileCover classes={classes} />
}
