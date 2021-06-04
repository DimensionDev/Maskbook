import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@material-ui/core'
import { ToolboxHint } from '../../../components/InjectedComponents/ToolboxHint'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { toolBoxInSideBarSelector } from '../utils/selector'

export function injectToolboxHintAtMinds(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ToolboxHintAtMinds />)
}

const useStyles = makeStyles((theme) => ({
    wrapper: {
        paddingTop: 4,
        paddingBottom: 4,
        cursor: 'pointer',
        [theme.breakpoints.down('lg')]: {
            justifyContent: 'center',
        },
    },
    menuItem: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    title: {
        color: theme.palette.mode === 'dark' ? '#b8c1ca' : '#72727c', // TODO: theme
        fontSize: 17,
        fontWeight: 700,
        marginLeft: 24,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    },
    text: {
        marginLeft: 12,
        fontSize: 15,
        color: theme.palette.mode === 'dark' ? '#b8c1ca' : '#72727c', // TODO: theme
        paddingRight: theme.spacing(2),
    },
    icon: {
        color: theme.palette.mode === 'dark' ? '#b8c1ca' : '#72727c', // TODO: theme
    },
    button: {
        '&:hover': {
            color: theme.palette.mode === 'dark' ? '#1b85d6' : '#1b85d6', // TODO: theme
        },
        [theme.breakpoints.up('lg')]: {
            paddingLeft: 0,
        },
    },
}))

function ToolboxHintAtMinds() {
    const classes = useStyles()
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
