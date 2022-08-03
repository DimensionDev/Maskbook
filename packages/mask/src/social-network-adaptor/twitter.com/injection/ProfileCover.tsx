import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchProfileCoverSelector } from '../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../utils'
import { ProfileCover } from '../../../components/InjectedComponents/ProfileCover'
import { makeStyles } from '@masknet/theme'

export function injectProfileCover(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileCoverSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileCoverAtTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
    },
}))

export function ProfileCoverAtTwitter() {
    const { classes } = useStyles()
    return <ProfileCover classes={classes} />
}
