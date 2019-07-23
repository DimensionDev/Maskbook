import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { myUsernameRef } from './MyUsername'
import { Banner } from '../../../components/Welcomes/Banner'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import Services from '../../service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { getStorage, setStorage } from '../../../components/Welcomes/WelcomeVersion'
import { isMobile } from '../../../social-network-provider/facebook.com/isMobile'

async function main() {
    const ids = await Services.People.queryMyIdentity()
    const storage = await getStorage()
    if (ids.length) return
    if (storage.userDismissedWelcome) return
    const to = new MutationObserverWatcher(
        new LiveSelector().querySelector<HTMLDivElement>(isMobile ? '#MComposer' : '#pagelet_composer'),
    )
        .enableSingleMode()
        .setDomProxyOption({ beforeShadowRootInit: { mode: 'closed' } })
        .startWatch()
    const unmount = renderInShadowRoot(<BannerContainer unmount={() => unmount()} />, to.firstVirtualNode.beforeShadow)
}
main()
function BannerContainer({ unmount }: { unmount: () => void }) {
    const id = useValueRef(myUsernameRef)
    return (
        <Banner
            disabled={id.isUnknown}
            close={() => {
                setStorage({ userDismissedWelcome: true })
                unmount()
            }}
            getStarted={() => {
                unmount()
                Services.Welcome.openWelcomePage(id, isMobile)
            }}
        />
    )
}
