import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { postPopupInjectPointSelector, newPostEditorBelow, hasDraftEditor } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostModalHint } from '../../../components/InjectedComponents/PostModalHint'
import { makeStyles, Theme } from '@material-ui/core'
import { MessageCenter } from '../../../utils/messages'
import { useCallback } from 'react'
import { useTwitterButton } from '../utils/theme'

export function injectPostModalHintAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const emptyNode = document.createElement('div')
    const watcher = new MutationObserverWatcher(newPostEditorBelow().map(x => (hasDraftEditor(x) ? x : emptyNode)))
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostModalHintAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

const useStyles = makeStyles((theme: Theme) => {
    const { type, grey } = theme.palette
    return {
        root: {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
        },
        content: {
            borderTop: `1px solid ${type === 'dark' ? grey[800] : grey[200]}`,
            padding: '16px 17px 16px 15px',
        },
        title: {
            fontSize: 15,
            fontWeight: 'bold',
        },
    }
})
function PostModalHintAtTwitter() {
    const classes = {
        ...useStyles(),
        ...useTwitterButton(),
    }
    const onHintButtonClicked = useCallback(() => {
        MessageCenter.emit('startCompose', undefined, true)
    }, [])
    return <PostModalHint classes={classes} onHintButtonClicked={onHintButtonClicked} />
}
