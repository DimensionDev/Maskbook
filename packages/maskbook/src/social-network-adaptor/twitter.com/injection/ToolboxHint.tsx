import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { ToolboxHint } from '../../../components/InjectedComponents/ToolboxHint'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { toolBoxInSideBarSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'
import { createStyles, makeStyles } from '@material-ui/core'
import type { ClassNames } from '@emotion/react'

export function injectToolboxHintAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxHintAtTwitter />)
}

const useStyles = makeStyles((theme) =>
    createStyles({
        menuItem: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        },
        wrapper: {
            padding: '16px 26px 16px 12px',
            [theme.breakpoints.down('lg')]: {
                padding: 16,
            },
        },
    }),
)

function ToolboxHintAtTwitter() {
    const classes = useStyles()
    // Todo: add click handler
    return (
        <ToolboxHint
            classes={{
                menuItem: classes.menuItem,
                wrapper: classes.wrapper,
            }}
        />
    )
}
