import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorToolbarSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogIcon } from '../../../components/InjectedComponents/PostDialogIcon'
import { MaskMessage } from '../../../utils/messages'
import { isCompose, isMobile } from '../utils/postBox'
import { makeStyles, Theme } from '@material-ui/core'
import { startWatch } from '../../../utils/watcher'

export function injectPostDialogIconAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const emptyNode = document.createElement('div')
    renderPostDialogIconTo(postEditorToolbarSelector().map((x) => (isMobile() && isCompose() ? x : emptyNode)))
}

function renderPostDialogIconTo<T>(ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher)

    renderInShadowRoot(<PostDialogIconAtTwitter />, { shadow: () => watcher.firstDOMProxy.afterShadow })
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

// <div style="height: 64px"></div>
