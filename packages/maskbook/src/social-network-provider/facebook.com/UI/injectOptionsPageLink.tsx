import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { makeStyles, Box } from '@material-ui/core'
import Services from '../../../extension/service'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { Flags } from '../../../utils/flags'

export function injectDashboardEntranceAtFacebook() {
    const ls = new LiveSelector().querySelector('.mSideMenu').enableSingleMode()
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            beforeShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
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
        width: '100%',
        height: 34,
    },
    icon: {
        width: 34,
        height: 34,
        margin: '4px 5px 0 7px',
    },
})
function Link() {
    const classes = useStyle()
    return (
        <Box className={classes.root} onClick={() => Services.Welcome.openOptionsPage()}>
            <MaskbookIcon className={classes.icon} />
            Maskbook Settings
        </Box>
    )
}
