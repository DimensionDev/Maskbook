import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ToolboxHint } from '../../../components/InjectedComponents/ToolboxHint'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { toolBoxInSideBarSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'
import { makeStyles, Theme } from '@material-ui/core'
import { fromRGB } from '../../../utils/theme-tools'

export function injectToolboxHintAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxHintAtTwitter />)
}

function toRGBA(color: string, a: number): string | undefined {
    const rgb = fromRGB(color)
    if (!rgb) return
    return `rgba(${rgb.join()}, ${a})`
}
const useStyles = makeStyles<Theme, { color: string; fontSize: string; iconSize: string }>((theme) => ({
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
        color: (props) => props.color,
        fontSize: (props) => props.fontSize,
    },
    text: {
        marginLeft: 12,
        fontSize: 15,
        color: (props) => props.color,
        paddingRight: theme.spacing(2),
    },
    icon: {
        color: (props) => props.color,
        width: (props) => props.iconSize,
        height: (props) => props.iconSize,
    },
    button: {
        '&:hover': {
            backgroundColor: toRGBA(theme.palette.primary.main, 0.1),
        },
        '&:active': {
            backgroundColor: toRGBA(theme.palette.primary.main, 0.2),
        },
    },
}))

function GetMoreStyle(): { color: string; fontSize: string; iconSize: string } {
    const ele = new LiveSelector()
        .querySelector<HTMLDivElement>('[data-testid="AppTabBar_More_Menu"]')
        .querySelector<HTMLDivElement>('div')
        .querySelectorAll<HTMLDivElement>('div')
    const style = window.getComputedStyle(ele.evaluate()[1], null)
    const svgStyle = window.getComputedStyle(ele.evaluate()[0], null)
    return { color: style.color, fontSize: style.fontSize, iconSize: svgStyle.height }
}
function ToolboxHintAtTwitter() {
    const style = GetMoreStyle()
    const classes = useStyles({ color: style.color, fontSize: style.fontSize, iconSize: style.iconSize })

    // Todo: add click handler
    return <ToolboxHint classes={classes} />
}
