import React from 'react'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { TransferButton } from '../../../components/InjectedComponents/TransferButton'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { makeStyles } from '@material-ui/core'

const messagerButtonMobile = new LiveSelector().querySelector<HTMLDivElement>(
    '[data-sigil="hq-profile-logging-action-bar-button"]',
)

const useStyles = makeStyles({
    root: {
        borderRadius: 6,
        width: 48,
        height: 40,
        backgroundColor: '#ebedf0 !important',
        margin: '4px 4px 0 4px',
    },
})

export function TransferButtonAtFacebook() {
    const classes = useStyles()
    return <TransferButton className={classes.root}></TransferButton>
}

export function injectTransferButtonAtFacebook(this: SocialNetworkUI) {
    const watcher = new MutationObserverWatcher(messagerButtonMobile)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: webpackEnv.shadowRootMode },
        })
        .useForeach((content) => {
            console.log(`DEBUG: we got here.`)
            console.log(content)

            const update = () => {
                console.log('update...')
            }
            const unmount = renderInShadowRoot(<TransferButtonAtFacebook />, {
                shadow: () => watcher.firstDOMProxy.afterShadow,
                normal: () => watcher.firstDOMProxy.after,
            })
            return {
                onNodeMutation: update,
                onRemove: unmount,
                onTargetChanged: update,
            }
        })
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })
}
