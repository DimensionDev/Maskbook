import React from 'react'
import { getUrl } from '../../../utils/utils'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { makeStyles } from '@material-ui/core'
import Services from '../../../extension/service'
import { MaskbookIcon } from '../../../resources/Maskbook-Circle-WhiteGraph-BlueBackground'

const settings = new LiveSelector().querySelector('.mSideMenu').enableSingleMode()
export function injectOptionsPageLinkAtFacebook() {
    if (location.hostname !== 'm.facebook.com') return
    const watcher = new MutationObserverWatcher(settings)
        .setDOMProxyOption({
            beforeShadowRootInit: { mode: 'closed' },
        })
        .startWatch({ subtree: true, childList: true })
    renderInShadowRoot(<Link></Link>, {
        shadow: () => watcher.firstDOMProxy.beforeShadow,
        normal: () => watcher.firstDOMProxy.before,
    })
}

const useStyle = makeStyles({
    root: {
        display: 'flex',
        minHeight: 42,
        lineHeight: '42px',
        fontSize: '1rem',
        borderBottom: '1px solid rgb(233, 234, 237)',
        width: 34,
        height: 34,
    },
    icon: { transform: 'translate(-1px, 1px)', margin: '4px 5px 0 7px' },
})
function Link() {
    const style = useStyle()
    return (
        <a
            className={style.root}
            onClick={() => {
                Services.Welcome.openOptionsPage('/')
            }}>
            <MaskbookIcon className={style.icon}></MaskbookIcon>
            Maskbook Settings
        </a>
    )
}
