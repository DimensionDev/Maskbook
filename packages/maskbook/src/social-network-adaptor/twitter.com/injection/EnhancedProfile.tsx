import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles, Theme } from '@material-ui/core'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import {
    searchForegroundColorSelector,
    searchProfileActiveTabSelector,
    searchProfileEmptySelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../utils/selector'
import { useEthereumAddress } from './useEthereumName'
import Color from 'color'
import { CollectibleListAddress } from '../../../extension/options-page/DashboardComponents/CollectibleList'

function injectEnhancedProfileTab(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileTab />)
}

function injectEnhancedProfilePageForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPage />)
}

function injectEnhancedProfilePageState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfileaPage />)
}
export function injectEnhancedProfile(signal: AbortSignal) {
    injectEnhancedProfileTab(signal)
    injectEnhancedProfilePageForEmptyState(signal)
    injectEnhancedProfilePageState(signal)
}

interface StyleProps {
    color: string
    font: string
    fontSize: string
    padding: string
    height: string
    activeColor: string
}

const useEnhancedProfileStyles = makeStyles<Theme, StyleProps>((theme) => ({
    tab: {
        '&:hover': {
            backgroundColor: (props: StyleProps) => new Color(props.activeColor).alpha(0.1).toString(),
            cursor: 'pointer',
        },
        height: (props: StyleProps) => props.height,
    },
    button: {
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: (props: StyleProps) => props.padding,
        fontWeight: 700,
        color: (props: StyleProps) => props.color,
        font: (props: StyleProps) => props.font,
        fontSize: (props: StyleProps) => props.fontSize,
        '&:hover': {
            color: (props: StyleProps) => props.activeColor,
        },
    },
    hot: {
        color: (props: StyleProps) => props.activeColor,
    },
    active: {
        dispaly: 'inline-flex',
        borderRadius: 99999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: (props: StyleProps) => props.activeColor,
    },
}))
export interface EnhancedProfileTabProps {}

const EMPTY_STYLE = {} as CSSStyleDeclaration

function clearStatus() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    if (!eleTab) return
    const style = window.getComputedStyle(eleTab)
    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((v) => {
        const _v = v.querySelector('div') as HTMLDivElement
        _v.style.color = style.color
        const line = v.querySelector('div > div') as HTMLDivElement
        line.style.display = 'none'
    })

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = 'none'
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.display = 'none'
}

function resetStatus() {
    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = ''
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.display = ''
}

const onEvent = (parent: HTMLElement, handler: () => void) => {
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.display = ''
    const line = parent.querySelector('div > div') as HTMLDivElement
    if (line) line.style.display = ''
    handler()
}

const addEventListener = (tabList: HTMLElement[], handler: () => void) => {
    tabList.map((v) => {
        v.addEventListener('click', () => onEvent(v, handler), { once: true })
    })
}

const removeEventListener = (tabList: HTMLElement[], handler: () => void) => {
    tabList.map((v) => {
        v.removeEventListener('click', () => onEvent(v, handler))
    })
}
const useBind = (handler: () => void) => {
    const tabList = searchProfileTabListSelector().evaluate()
    useEffect(() => {
        addEventListener(tabList, handler)
        return () => removeEventListener(tabList, handler)
    }, [tabList, addEventListener, removeEventListener, handler])
}

function getStyle() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE
    const eleForegroundColorStyle = searchForegroundColorSelector().evaluate()
    const foregroundColorStyle = eleForegroundColorStyle
        ? window.getComputedStyle(eleForegroundColorStyle)
        : EMPTY_STYLE

    return {
        color: style.color,
        font: style.font,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        height: style.height,
        activeColor: foregroundColorStyle.color,
    } as StyleProps
}
export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const style = getStyle()
    const classes = useEnhancedProfileStyles(style)

    const [active, setActive] = useState(false)

    const onClose = () => {
        setActive(false)
        MaskMessage.events.profileNFTsPageUpdate.sendToLocal({ show: false })
    }
    const onOpen = () => {
        MaskMessage.events.profileNFTsPageUpdate.sendToLocal({ show: true })
        setActive(true)
    }

    useBind(onClose)

    const tab = searchProfileActiveTabSelector().evaluate()
    useEffect(() => {
        const onClick = () => {
            resetStatus()
            setActive(false)
        }

        tab?.addEventListener('click', onClick, { once: true })
        return () => tab?.removeEventListener('click', onClick)
    }, [tab, resetStatus])

    const onClick = useCallback(() => {
        onOpen()
        clearStatus()
    }, [clearStatus, onOpen])

    return (
        <div key="nfts" className={classes.tab}>
            <div className={classNames(classes.button, active ? classes.hot : '')} onClick={onClick}>
                NFTs
                {active ? <div className={classes.active} /> : null}
            </div>
        </div>
    )
}

export function EnhancedProfileaPage() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        MaskMessage.events.profileNFTsPageUpdate.on((data) => {
            setShow(data.show)
        })
        return () =>
            MaskMessage.events.profileNFTsPageUpdate.off((data) => {
                setShow(false)
            })
    }, [])

    const resolvedAddress = useEthereumAddress()
    return <>{show ? <CollectibleListAddress address={resolvedAddress ?? ''} /> : null}</>
}
