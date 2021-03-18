import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorToolbarSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogIcon } from '../../../components/InjectedComponents/PostDialogIcon'
import { MaskMessage } from '../../../utils/messages'
import { isCompose, isMobile } from '../utils/postBox'
import { makeStyles, Theme } from '@material-ui/core'
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

    renderInShadowRoot(<PostDialogIconAtTwitter />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        signal,
    })
}

const useTwitterMaskbookIcon = makeStyles((theme: Theme) => ({
    root: {
        width: 38,
        height: 38,
        boxSizing: 'border-box',
        padding: theme.spacing(1),
    },
}))

function PostDialogIconAtTwitter() {
    const classes = useTwitterMaskbookIcon()
    const onIconClicked = () => MaskMessage.events.compositionUpdated.sendToLocal({ reason: 'timeline', open: true })
    return <PostDialogIcon classes={classes} onClick={onIconClicked} />
}
