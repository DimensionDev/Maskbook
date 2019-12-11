import { MutationObserverWatcher } from '@holoflows/kit'
import { PersonKnown } from '../../../components/InjectedComponents/PersonKnown'
import { bioSelector, bioCard } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PersonIdentifier } from '../../../database/type'
import { twitterUrl } from '../utils/url'
import { makeStyles } from '@material-ui/styles'
import { timeout } from '../../../utils/utils'
import AsyncComponent from '../../../utils/components/AsyncComponent'
import { useState } from 'react'
import { bioCardParser } from '../utils/fetch'

const useStyles = makeStyles({
    root: {
        marginTop: -10,
        marginBottom: 10,
    },
    center: {
        color: '#657786', // TODO: use color in theme
        justifyContent: 'flex-start',
        marginBottom: 0,
    },
})

function PersonKnownAtTwitter() {
    const [userId, setUserId] = useState(PersonIdentifier.unknown.userId)
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
                    whois={new PersonIdentifier(twitterUrl.hostIdentifier, userId)}
                    AdditionalContentProps={{
                        classes: {
                            ...useStyles(),
                        },
                    }}
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
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })

    renderInShadowRoot(<PersonKnownAtTwitter />, target.firstDOMProxy.beforeShadow)
}
