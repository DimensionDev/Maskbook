import { useEffect, useState } from 'react'
import { debounce } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import {
    profileTabSelectedSelector,
    profileTabUnselectedSelector,
    searchProfileTabSelector,
    web3TabSelector,
} from '../utils/selector.js'
import { ProfileTab } from '../../../components/InjectedComponents/ProfileTab.js'

function getStyleProps() {
    const EMPTY_STYLE = {} as CSSStyleDeclaration
    const divEle = profileTabUnselectedSelector().evaluate()?.querySelector('div') as Element
    const spanEle = profileTabUnselectedSelector().evaluate()?.querySelector('div span') as Element
    const selectedSpanEle = profileTabSelectedSelector().evaluate()?.querySelector('div span') as Element
    const divStyle = divEle ? window.getComputedStyle(divEle) : EMPTY_STYLE
    const spanStyle = spanEle ? window.getComputedStyle(spanEle) : EMPTY_STYLE
    const selectedSpanStyle = selectedSpanEle ? window.getComputedStyle(selectedSpanEle) : EMPTY_STYLE

    return {
        color: 'var(--secondary-text)',
        font: spanStyle.font,
        fontSize: spanStyle.fontSize,
        padding: divStyle.paddingLeft,
        height: divStyle.height ?? '60px',
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
            display: 'inline-flex',
            width: 80,
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
            height: 52,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: theme.spacing(0, props.padding || 0),
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
            color: 'var(--accent)',
        },
        line: {
            borderRadius: 9999,
            position: 'absolute',
            bottom: -4,
            width: '100%',
            alignSelf: 'center',
            height: 3,
            backgroundColor: 'var(--accent)',
        },
    }
})

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
function ProfileTabAtFacebook() {
    const { classes } = useStyles()
    const [action, setAction] = useState('reset')

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
            classes={{
                root: classes.root,
                button: classes.button,
                selected: classes.selected,
            }}
            reset={reset}
            clear={clear}
            children={<div className={classes.line} />}
        />
    )
}

export function injectProfileTabAtFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabAtFacebook />)
    const assign = () => {
        const web3Tab = web3TabSelector().evaluate()
        if (web3Tab) {
            web3Tab.style.float = 'right'
            web3Tab.style.marginRight = '15px'
        }
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
