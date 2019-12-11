import * as React from 'react'
import { useState } from 'react'
import { LiveSelector, MutationObserverWatcher, ValueRef } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { SocialNetworkUI } from '../../../social-network/ui'
import { PersonIdentifier } from '../../../database/type'
import { PersonKnown, PersonKnownProps } from '../../../components/InjectedComponents/PersonKnown'
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
            return new PersonIdentifier('facebook.com', id)
        } catch {}
    }
    try {
        const id = location.pathname.substr(1)
        return new PersonIdentifier('facebook.com', id)
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
            const ref = new ValueRef(content.innerText)
            const unmount = renderInShadowRoot(
                <PersonKnownAtFacebook pageOwner={getCurrentIdentity()} bioContent={ref} />,
                renderPoint,
            )
            const update = () => (ref.value = content.innerText)
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
