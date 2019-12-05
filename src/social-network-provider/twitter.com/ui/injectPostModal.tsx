import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { mainSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostModal } from '../../../components/InjectedComponents/PostModal'
import { useTwitterButton, useTwitterCloseButton, useTwitterModal } from '../utils/theme'
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
    return (
        <PostModal
            classes={{
                ...useStyles(),
                ...useTwitterModal(),
                ...useTwitterButton(),
                ...useTwitterCloseButton(),
            }}
            SelectRecipientModalProps={{
                classes: {
                    ...useTwitterModal(),
                    ...useTwitterButton(),
                },
            }}
        />
    )
}
