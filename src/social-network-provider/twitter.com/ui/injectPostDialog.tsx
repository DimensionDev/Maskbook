import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { useTwitterButton, useTwitterCloseButton, useTwitterDialog } from '../utils/theme'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import { postEditorInPopupSelector, rootSelector } from '../utils/selector'

const useStyles = makeStyles((theme: Theme) => {
    const { type, grey } = theme.palette
    const borderColor = type === 'dark' ? grey[800] : grey[200]
    return {
        MUIInputInput: {
            border: `1px solid ${borderColor}`,
            borderRadius: 5,
            padding: '12px 8px',
        },
    }
})

export function injectPostDialogAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    renderPostDialogTo(postEditorInPopupSelector())
    renderPostDialogTo(rootSelector())
}

function renderPostDialogTo<T>(ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostDialogAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

function PostDialogAtTwitter() {
    return (
        <PostDialog
            classes={{
                ...useStyles(),
                ...useTwitterDialog(),
                ...useTwitterButton(),
                ...useTwitterCloseButton(),
            }}
            SelectRecipientsUIProps={{
                SelectRecipientsDialogUIProps: {
                    classes: {
                        ...useTwitterDialog(),
                        ...useTwitterButton(),
                        ...useTwitterCloseButton(),
                    },
                },
            }}
        />
    )
}
