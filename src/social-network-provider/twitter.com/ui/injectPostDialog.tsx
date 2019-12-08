import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { mainSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { useTwitterButton, useTwitterCloseButton, useTwitterDialog } from '../utils/theme'
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
    }
})

export function injectPostDialogAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const watcher = new MutationObserverWatcher(mainSelector())
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostDialogAtTwitter />, watcher.firstDOMProxy.beforeShadow)
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
