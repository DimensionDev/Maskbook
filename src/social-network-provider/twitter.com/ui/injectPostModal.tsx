import { useState, useEffect, useCallback } from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { mainSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostModal } from '../../../components/InjectedComponents/PostModal'
import { MessageCenter } from '../../../utils/messages'
import { makeStyles } from '@material-ui/core'
import { useTwtterComponent } from '../utils/theme'

const useStyles = makeStyles({
    MUIInputInput: {
        border: '1px solid rgb(230, 236, 240)',
        padding: '12px 8px',
    },
})

export function injectPostModalAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const watcher = new MutationObserverWatcher(mainSelector())
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostModalAtTwitter />, watcher.firstDOMProxy.beforeShadow)
}

function PostModalAtTwitter() {
    const classes = {
        ...useStyles(),
        button: useTwtterComponent().button,
    }
    const [open, setOpen] = useState(false)
    const [postText, setPostText] = useState('')
    const onStartCompose = useCallback(() => setOpen(true), [])
    const onCancelCompose = useCallback(() => setOpen(false), [])
    useEffect(() => {
        MessageCenter.on('startCompose', onStartCompose)
        MessageCenter.on('cancelCompose', onCancelCompose)
        return () => {
            MessageCenter.off('startCompose', onStartCompose)
            MessageCenter.off('cancelCompose', onCancelCompose)
        }
    }, [onCancelCompose, onStartCompose, open])
    return (
        <>
            <PostModal
                classes={classes}
                open={open}
                postBoxText={postText}
                postBoxButtonDisabled={!postText}
                onPostTextChange={setPostText}
                onCloseButtonClicked={onCancelCompose}
            />
        </>
    )
}
