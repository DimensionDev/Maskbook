import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ToolboxHint } from '../../../components/InjectedComponents/ToolboxHint'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { toolBoxInSideBarSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'
import { makeStyles } from '@material-ui/core'

export function injectToolboxHintAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxHintAtTwitter />)
}

const useStyles = makeStyles((theme) => ({
    wrapper: {
        paddingTop: 4,
        paddingBottom: 4,
        cursor: 'pointer',
        [theme.breakpoints.down('lg')]: {
            transform: 'translateX(0px)',
        },
    },
    menuItem: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    title: {
        color: theme.palette.mode === 'dark' ? 'rgb(216, 216, 216)' : 'rgb(15, 20, 25)',
    },
    text: {
        marginLeft: 12,
        fontSize: 15,
        color: theme.palette.mode === 'dark' ? 'rgb(216, 216, 216)' : 'rgb(15, 20, 25)',
        paddingRight: theme.spacing(2),
    },
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(216, 216, 216)' : 'rgb(15, 20, 25)',
    },
    button: {
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgb(7, 15, 25)' : 'rgb(233, 246, 253)',
        },
        '&:active': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgb(13, 29, 48)' : 'rgb(212,237,252)',
        },
    },
}))

function GetColor() {
    const ele = new LiveSelector()
        .querySelector<HTMLDivElement>('[data-testid="AppTabBar_More_Menu"]')
        .querySelector<HTMLDivElement>('div')
        .querySelectorAll<HTMLDivElement>('div')
    const style = window.getComputedStyle(ele.evaluate()[1], null)
    return style.color
}
function ToolboxHintAtTwitter() {
    const color = GetColor()
    const classes = useStyles({ color })

    // Todo: add click handler
    return (
        <ToolboxHint
            classes={{
                wrapper: classes.wrapper,
                menuItem: classes.menuItem,
                title: classes.title,
                text: classes.text,
                button: classes.button,
                icon: classes.icon,
            }}
        />
    )
}
