import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { mainSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostModal } from '../../../components/InjectedComponents/PostModal'
import { MessageCenter } from '../../../utils/messages'
import { useTwitterButton, useTwitterCloseButton } from '../utils/theme'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

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
            padding: '10px 15px',
            borderBottom: `1px solid ${borderColor}`,
        },
        backdrop: {
            backgroundColor: `${type === 'dark' ? 'rgba(110, 118, 125, 0.3)' : 'rgba(0, 0, 0, 0.3)'} !important`,
        },
        root: {
            borderRadius: 5,
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
        ...useTwitterCloseButton(),
    }
    return (
        <>
            <PostModal classes={classes} />
        </>
    )
}
