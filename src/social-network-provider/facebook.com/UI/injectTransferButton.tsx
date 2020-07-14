import React from 'react'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { TransferButton } from '../../../components/InjectedComponents/TransferButton'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'

const messagerButtonMobile = new LiveSelector().querySelector<HTMLDivElement>(
    '[data-sigil="hq-profile-logging-action-bar-button"]',
)

export function TransferButtonAtFacebook() {
    return <TransferButton></TransferButton>
}

export function injectTransferButtonAtFacebook(this: SocialNetworkUI) {
    const watcher = new MutationObserverWatcher(messagerButtonMobile)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: webpackEnv.shadowRootMode },
        })
        .useForeach((content) => {
            const update = () => {
                console.log('update...')
            }
            const unmount = renderInShadowRoot(<TransferButtonAtFacebook></TransferButtonAtFacebook>, {
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
