import React from 'react'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { LiveSelector, MutationObserverWatcher, ValueRef } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { makeStyles } from '@material-ui/core'
import { TransferDemo, TransferDemoProps } from '../../../components/InjectedComponents/TransferDemo'
import { ProfileIdentifier } from '../../../database/type'

const messagerButtonMobile = new LiveSelector().querySelector<HTMLDivElement>(
    '[data-sigil="hq-profile-logging-action-bar-button"]',
)

function getCurrentIdentity() {
    if (location.pathname === '/profile.php') {
        try {
            const id = new URLSearchParams(location.search).get('id')
            if (!id) return null
            return new ProfileIdentifier('facebook.com', id)
        } catch {}
    }
    try {
        const id = location.pathname.substr(1)
        return new ProfileIdentifier('facebook.com', id)
    } catch {}
    return null
}

const useStyles = makeStyles({
    root: {
        borderRadius: 6,
        width: 48,
        height: 40,
        backgroundColor: '#ebedf0 !important',
        margin: '4px 4px 0 4px',
    },
    actions: {},
})

export function TransferDemoAtFacebook(props: TransferDemoProps) {
    const classes = useStyles()
    return (
        <TransferDemo
            TransferButtonProps={{
                classes: {
                    root: classes.root,
                },
            }}
            {...props}
        />
    )
}

export function injectTransferDemoAtFacebook(this: SocialNetworkUI) {
    const watcher = new MutationObserverWatcher(messagerButtonMobile)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: webpackEnv.shadowRootMode },
        })
        .useForeach(() => {
            const recipientRef = new ValueRef<ProfileIdentifier | null>(getCurrentIdentity())
            const update = () => {
                console.log(`DEBUG: update`)
                console.log(getCurrentIdentity())
                recipientRef.value = getCurrentIdentity()
            }
            const unmount = renderInShadowRoot(<TransferDemoAtFacebook recipientRef={recipientRef} />, {
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
