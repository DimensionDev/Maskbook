import { useState, useEffect, useCallback } from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { mainSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostModal } from '../../../components/InjectedComponents/PostModal'
import { MessageCenter } from '../../../utils/messages'
import { makeStyles, Theme } from '@material-ui/core'
import { useTwitterButton } from '../utils/theme'

const useStyles = makeStyles((theme: Theme) => {
    const { type, grey } = theme.palette
    const borderColor = type === 'dark' ? grey[800] : grey[200]

    return {
        MUIInputInput: {
            border: `1px solid ${borderColor}`,
            borderRadius: 5,
            padding: '12px 8px',
        },
        header: {
            borderBottom: `1px solid ${borderColor}`,
        },
        backdrop: {
            backgroundColor: `${type === 'dark' ? 'rgba(110, 118, 125, 0.3)' : 'rgba(0, 0, 0, 0.3)'} !important`,
        },
        root: {
            borderRadius: 5,
        },
        close: {
            color: theme.palette.primary.main,
        },
    }
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
        ...useTwitterButton(),
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
