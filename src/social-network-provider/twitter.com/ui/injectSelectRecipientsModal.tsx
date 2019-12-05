import { useTwitterModal } from '../utils/theme'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { SelectRecipientsModal } from '../../../components/shared/SelectRecipients/SelectRecipientsModal'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { mainSelector } from '../utils/selector'
import { twitterUrl } from '../utils/url'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'

const useStyles = makeStyles((theme: Theme) => {
    return {
        root: {},
    }
})

export function injectSelectRecipientsModalAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const watcher = new MutationObserverWatcher(mainSelector())
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<SelectRecipientsModal />, watcher.firstDOMProxy.beforeShadow)
}

function SelectRecipientsModalAtTwitter() {
    const classes = { ...useStyles(), ...useTwitterModal() }

    return <SelectRecipientsModal classes={classes} />
}
