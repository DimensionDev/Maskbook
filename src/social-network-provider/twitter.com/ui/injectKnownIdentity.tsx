import * as React from 'react'
import { MutationObserverWatcher, ValueRef } from '@holoflows/kit'
import { PersonKnown } from '../../../components/InjectedComponents/PersonKnown'
import { bioSelector, bioCard } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { ProfileIdentifier } from '../../../database/type'
import { twitterUrl } from '../utils/url'
import { makeStyles } from '@material-ui/styles'
import { timeout } from '../../../utils/utils'
import AsyncComponent from '../../../utils/components/AsyncComponent'
import { useState } from 'react'
import { bioCardParser } from '../utils/fetch'

const useStyles = makeStyles({
    root: {
        marginBottom: 10,
    },
    center: {
        color: '#657786', // TODO: use color in theme
        justifyContent: 'flex-start',
        marginBottom: 0,
    },
})

function PersonKnownAtTwitter(props: { bio: ValueRef<string> }) {
    const [userId, setUserId] = useState(ProfileIdentifier.unknown.userId)
    return (
        <AsyncComponent
            promise={async () => {
                const [bioCardNode] = await timeout(new MutationObserverWatcher(bioCard<false>(false)), 10000)
                setUserId(bioCardParser(bioCardNode).handle)
            }}
            dependencies={[userId]}
            awaitingComponent={null}
            completeComponent={
                <PersonKnown
                    pageOwner={new ProfileIdentifier(twitterUrl.hostIdentifier, userId)}
                    AdditionalContentProps={{ classes: useStyles() }}
                    bioContent={props.bio}
                />
            }
            failedComponent={null}
        />
    )
}

export function injectKnownIdentityAtTwitter() {
    const target = new MutationObserverWatcher(bioSelector())
        .setDOMProxyOption({
            beforeShadowRootInit: { mode: 'closed' },
            afterShadowRootInit: { mode: 'closed' },
        })
        .useForeach(content => {
            const ref = new ValueRef(content.innerText)
            const unmount = renderInShadowRoot(<PersonKnownAtTwitter bio={ref} />, renderPoint)
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
    const renderPoint = target.firstDOMProxy.afterShadow
}
