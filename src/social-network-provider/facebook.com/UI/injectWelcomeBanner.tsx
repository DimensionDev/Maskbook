import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { isMobileFacebook } from '../isMobile'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { Banner } from '../../../components/Welcomes/Banner'
import { facebookUISelf } from '../ui-provider'
import { makeStyles } from '@material-ui/core'

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
    const useStyle = makeStyles({ root: { borderColor: '#dddfe2' } })
    function Wrapped() {
        const classes = useStyle()
        return <Banner classes={{ root: classes.root }} networkIdentifier={facebookUISelf.networkIdentifier} />
    }

    return renderInShadowRoot(<Wrapped />, to.firstDOMProxy.beforeShadow)
}
