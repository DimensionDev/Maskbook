import { makeStyles } from '@masknet/theme'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed, startWatch } from '../../../utils'
import {
    profileTabSelectedSelector,
    profileTabUnselectedSelector,
    searchProfileTabSelector,
    web3TabSelector,
} from '../utils/selector'
import { ProfileTab } from '../../../components/InjectedComponents/ProfileTab'
import { useEffect, useState } from 'react'
import { debounce } from '@mui/material'

function getStyleProps() {
    const EMPTY_STYLE = {} as CSSStyleDeclaration
    const divEle = profileTabUnselectedSelector().evaluate()?.querySelector('div') as Element
    const spanEle = profileTabUnselectedSelector().evaluate()?.querySelector('div span') as Element
    const selectedSpanEle = profileTabSelectedSelector().evaluate()?.querySelector('div span') as Element
    const divStyle = divEle ? window.getComputedStyle(divEle) : EMPTY_STYLE
    const spanStyle = spanEle ? window.getComputedStyle(spanEle) : EMPTY_STYLE
    const selectedSpanStyle = selectedSpanEle ? window.getComputedStyle(selectedSpanEle) : EMPTY_STYLE

    return {
        color: spanStyle.color,
        font: spanStyle.font,
        fontSize: spanStyle.fontSize,
        padding: divStyle.paddingLeft,
        height: divStyle.height,
        hover: 'var(--hover-overlay)',
        line: selectedSpanStyle.color,
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()

    return {
        root: {
            '&:hover': {
                cursor: 'pointer',
            },
            height: props.height,
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            padding: '4px 0',
            boxSizing: 'border-box',
        },
        button: {
            flex: 1,
            zIndex: 1,
            position: 'relative',
            display: 'flex',
            minWidth: 56,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: theme.spacing(0, props.padding),
            color: props.color,
            font: props.font,
            fontSize: props.fontSize,
            fontWeight: 600,
            '&:hover': {
                backgroundColor: props.hover,
                color: props.color,
            },
            borderRadius: 6,
        },
        selected: {
            color: `${props.line} !important`,
        },
        line: {
            borderRadius: 9999,
            position: 'absolute',
            bottom: -4,
            width: '100%',
            alignSelf: 'center',
            height: 3,
            backgroundColor: props.line,
        },
    }
})

export function ProfileTabAtFacebook() {
    const { classes } = useStyles()
    const [action, setAction] = useState('reset')

    function styleTab(textColor: string, borderColor: string) {
        const ele = profileTabSelectedSelector().evaluate()
        if (!ele) return

        const textEle = ele.querySelector('span')
        const borderEle = ele.querySelector('span ~ div:last-child') as HTMLDivElement
        if (!textEle || !borderEle) return
        textEle.style.color = textColor
        borderEle.style.backgroundColor = borderColor

        const iconEle = ele.querySelector('svg')
        if (!iconEle) return
        iconEle.style.fill = textColor
    }

    function clear() {
        setAction('clear')
        styleTab(getStyleProps().color, 'transparent')
    }

    function reset() {
        setAction('reset')
        styleTab('', getStyleProps().line)
    }

    // handle cleared tab will be reactivated after scroll
    useEffect(() => {
        const handler = debounce(() => {
            if (action === 'clear') {
                clear()
            }
        }, 1000)
        window.addEventListener('scroll', handler)

        return () => {
            window.removeEventListener('scroll', handler)
        }
    }, [action])

    return (
        <ProfileTab
            title="Web3"
            classes={classes}
            reset={reset}
            clear={clear}
            children={<div className={classes.line} />}
        />
    )
}

export function injectProfileTabAtFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabAtFacebook />)

    const assign = () => {
        const web3Tab = web3TabSelector().evaluate()
        if (web3Tab) web3Tab.style.float = 'left'
    }

    new MutationObserverWatcher(web3TabSelector())
        .addListener('onChange', assign)
        .addListener('onAdd', assign)
        .startWatch(
            {
                childList: true,
                subtree: true,
                attributes: true,
            },
            signal,
        )
}
