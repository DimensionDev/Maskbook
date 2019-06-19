import React, { useState, useEffect } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { myUsernameRef } from './LiveSelectors'
import { Banner } from '../../../components/Welcomes/Banner'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import Services from '../../service'
import { getStorage, setStorage, LATEST_WELCOME_VERSION } from '../../../components/Welcomes/WelcomeVersion'
import { PersonIdentifier } from '../../../database/type'

getStorage().then(({ init, userDismissedWelcomeAtVersion }) => {
    const to = new MutationObserverWatcher(new LiveSelector().querySelector<HTMLDivElement>('#pagelet_composer'))
        .enableSingleMode()
        .setDomProxyOption({ beforeShadowRootInit: { mode: 'closed' } })
        .startWatch()
    if (userDismissedWelcomeAtVersion && userDismissedWelcomeAtVersion >= LATEST_WELCOME_VERSION) return
    if (init && init >= LATEST_WELCOME_VERSION) return
    const unmount = renderInShadowRoot(<BannerContainer unmount={() => unmount()} />, to.firstVirtualNode.beforeShadow)
})
function BannerContainer({ unmount }: { unmount: () => void }) {
    const [id, set] = useState(PersonIdentifier.unknown)
    useEffect(() => myUsernameRef.addListener(set))
    return (
        <Banner
            disabled={id.isUnknown}
            close={() => {
                setStorage({ userDismissedWelcomeAtVersion: LATEST_WELCOME_VERSION })
                unmount()
            }}
            getStarted={() => {
                unmount()
                Services.Welcome.openWelcomePage(id)
                setStorage({ init: LATEST_WELCOME_VERSION })
            }}
        />
    )
}
