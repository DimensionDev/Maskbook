import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { isMobileFacebook } from '../isMobile'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { Banner } from '../../../components/Welcomes/Banner'
import { facebookUISelf } from '../ui-provider'

export function injectWelcomeBannerFacebook() {
    const to = new MutationObserverWatcher(
        new LiveSelector()
            .querySelector<HTMLDivElement>(isMobileFacebook ? '#MComposer' : '#pagelet_composer')
            .enableSingleMode(),
    )
        .setDOMProxyOption({ beforeShadowRootInit: { mode: 'closed' } })
        .startWatch()

    const unmount = renderInShadowRoot(
        <Banner networkIdentifier={facebookUISelf.networkIdentifier} unmount={() => unmount()} />,
        to.firstDOMProxy.beforeShadow,
    )
}
