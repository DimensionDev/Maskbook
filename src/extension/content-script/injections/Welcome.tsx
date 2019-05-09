import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { myUsername, getUsername } from './LiveSelectors'
import { Banner } from '../../../components/Welcomes/Banner'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import Services from '../../service'
import { getStorage, setStorage, LATEST_WELCOME_VERSION } from '../../../components/Welcomes/WelcomeVersion'

getStorage().then(({ init, userDismissedWelcomeAtVersion }) => {
    const to = new MutationObserverWatcher(new LiveSelector().querySelector<HTMLDivElement>('#pagelet_composer'))
        .setDomProxyOption({ beforeShadowRootInit: { mode: 'closed' } })
        .startWatch()
    if (userDismissedWelcomeAtVersion && userDismissedWelcomeAtVersion >= LATEST_WELCOME_VERSION) return
    if (init && init >= LATEST_WELCOME_VERSION) return
    const unmount = renderInShadowRoot(
        <Banner
            close={() => {
                setStorage({ userDismissedWelcomeAtVersion: LATEST_WELCOME_VERSION })
                unmount()
            }}
            getStarted={() => {
                unmount()
                Services.Welcome.openWelcomePage(getUsername(myUsername.evaluateOnce()[0])!)
                setStorage({ init: LATEST_WELCOME_VERSION })
            }}
        />,
        to.firstVirtualNode.beforeShadow,
    )
})
