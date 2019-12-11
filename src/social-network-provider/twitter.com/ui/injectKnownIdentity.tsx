import * as React from 'react'
import { MutationObserverWatcher, ValueRef } from '@holoflows/kit'
import { PersonKnown, PersonKnownProps } from '../../../components/InjectedComponents/PersonKnown'
import { bioCard } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PersonIdentifier } from '../../../database/type'
import { twitterUrl } from '../utils/url'
import { makeStyles } from '@material-ui/styles'
import { bioCardParser } from '../utils/fetch'
import { twitterEncoding } from '../encoding'

const useStyles = makeStyles({
    root: {
        padding: '0 15px',
    },
    center: {
        color: '#657786', // TODO: use color in theme
        justifyContent: 'flex-start',
        marginBottom: 0,
    },
})

export function PersonKnownAtTwitter(props: PersonKnownProps) {
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

export function injectKnownIdentityAtTwitter() {
    const watcher = new MutationObserverWatcher(bioCard<false>(false))
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .useForeach(content => {
            const bioRef = new ValueRef('')
            const userIdRef = new ValueRef('')
            const update = () => {
                const { publicKeyEncoder, publicKeyDecoder } = twitterEncoding
                const { bio: bioText, handle } = bioCardParser(content)

                userIdRef.value = handle
                bioRef.value = publicKeyEncoder(publicKeyDecoder(bioText)[0] || '')
            }

            update()

            const unmount = renderInShadowRoot(
                <PersonKnownAtTwitter
                    pageOwner={new PersonIdentifier(twitterUrl.hostIdentifier, userIdRef.value)}
                    bioContent={bioRef}
                />,
                renderPoint,
            )
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
