import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorToolbarSelector } from '../utils/selector'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogIcon } from '../../../components/InjectedComponents/PostDialogIcon'
import { MaskMessages } from '../../../utils/messages'
import { isCompose, isMobile } from '../utils/postBox'
import { makeStyles } from '@masknet/theme'
import { startWatch } from '../../../utils/watcher'

export function injectPostDialogIconAtTwitter(signal: AbortSignal) {
    const emptyNode = document.createElement('div')
    renderPostDialogIconTo(
        postEditorToolbarSelector().map((x) => (isMobile() && isCompose() ? x : emptyNode)),
        signal,
    )
}

function renderPostDialogIconTo<T>(ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<PostDialogIconAtTwitter />)
}
const useTwitterMaskIcon = makeStyles()((theme) => ({
    root: {
        width: 38,
        height: 38,
        boxSizing: 'border-box',
        padding: theme.spacing(1),
    },
}))

function PostDialogIconAtTwitter() {
    const { classes } = useTwitterMaskIcon()
    const onIconClicked = () => MaskMessages.events.requestComposition.sendToLocal({ reason: 'timeline', open: true })
    return <PostDialogIcon classes={classes} onClick={onIconClicked} />
}
