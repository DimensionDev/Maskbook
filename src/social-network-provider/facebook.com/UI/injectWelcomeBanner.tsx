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
        .startWatch({
            childList: true,
            subtree: true,
        })

    return renderInShadowRoot(
        <Banner networkIdentifier={facebookUISelf.networkIdentifier} />,
        to.firstDOMProxy.beforeShadow,
    )
}
