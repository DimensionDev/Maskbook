import * as React from 'react'
import { useState } from 'react'
import { LiveSelector, MutationObserverWatcher, ValueRef } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { SocialNetworkUI } from '../../../social-network/ui'
import { PersonKnown, PersonKnownProps } from '../../../components/InjectedComponents/PersonKnown'
import { ProfileIdentifier } from '../../../database/type'
import { makeStyles } from '@material-ui/core'

const othersBioLiveSelectorMobile = new LiveSelector().querySelector<HTMLDivElement>(
    '[data-sigil=timeline-cover]:not(:first-child)',
)

const othersBioLiveSelectorPC = new LiveSelector().querySelector<HTMLDivElement>(
    '#intro_container_id > div:first-child',
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
        wordBreak: 'break-word',
        textAlign: 'center',
        marginLeft: 12,
        marginRight: 12,
    },
})

export function PersonKnownAtFacebook(props: PersonKnownProps) {
    return (
        <PersonKnown
            AdditionalContentProps={{
                classes: {
                    ...useStyles(),
                },
            }}
            {...props}
        />
    )
}

export function injectKnownIdentityAtFacebook(this: SocialNetworkUI) {
    const self = othersBioLiveSelectorMobile.clone().concat(othersBioLiveSelectorPC)
    const watcher = new MutationObserverWatcher(self)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .useForeach(content => {
            const bioRef = new ValueRef(content.innerText)
            const pageOwnerRef = new ValueRef<ProfileIdentifier | null>(getCurrentIdentity())
            const unmount = renderInShadowRoot(
                <PersonKnownAtFacebook pageOwner={pageOwnerRef} bioContent={bioRef} />,
                renderPoint,
            )
            const update = () => {
                bioRef.value = content.innerText
                pageOwnerRef.value = getCurrentIdentity()
            }
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
    const renderPoint = watcher.firstDOMProxy.afterShadow
}
