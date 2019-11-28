import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { postPopupInjectPointSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostModalHint } from '../../../components/InjectedComponents/PostModalHint'
import { makeStyles } from '@material-ui/core'

export function injectPostModalHintAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const watcher = new MutationObserverWatcher(postPopupInjectPointSelector())
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostModalHintAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

const useStyles = makeStyles({
    root: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    content: {
        borderTop: '1px solid rgb(204, 214, 221)',
    },
    button: {
        minHeight: 39,
        borderRadius: 9999,
        boxShadow: 'none',
        backgroundColor: 'rgb(29, 161, 242)',
        '&:hover': {
            boxShadow: 'none',
            backgroundColor: 'rgb(26, 145, 218)',
        },
    },
})
function PostModalHintAtTwitter() {
    return <PostModalHint classes={useStyles()} />
}
