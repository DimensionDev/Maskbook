import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { isMobileFacebook } from '../isMobile'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { Banner } from '../../../components/Welcomes/Banner'
import { SocialNetworkUI } from '../../../social-network/ui'

export function injectWelcomeBannerFacebook(this: SocialNetworkUI) {
    const to = new MutationObserverWatcher(
        new LiveSelector().querySelector<HTMLDivElement>(isMobileFacebook ? '#MComposer' : '#pagelet_composer'),
    )
        .enableSingleMode()
        .setDomProxyOption({ beforeShadowRootInit: { mode: 'closed' } })
        .startWatch()

    const unmount = renderInShadowRoot(
        <Banner networkIdentifier={this.networkIdentifier} unmount={() => unmount()} />,
        to.firstVirtualNode.beforeShadow,
    )
}
