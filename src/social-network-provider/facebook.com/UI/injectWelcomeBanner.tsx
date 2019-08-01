import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'
import { isMobileFacebook } from '../isMobile'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { Banner } from '../../../components/Welcomes/Banner'

export function injectWelcomeBannerFacebook() {
    const to = new MutationObserverWatcher(
        new LiveSelector().querySelector<HTMLDivElement>(isMobileFacebook ? '#MComposer' : '#pagelet_composer'),
    )
        .enableSingleMode()
        .setDomProxyOption({ beforeShadowRootInit: { mode: 'closed' } })
        .startWatch()
    const unmount = renderInShadowRoot(<Banner unmount={() => unmount()} />, to.firstVirtualNode.beforeShadow)
}
