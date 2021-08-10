import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles, Theme } from '@material-ui/core'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import {
    searchForegroundColorSelector,
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
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    if (!eleTab) return

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = ''
    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) elePage.style.display = ''

    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((v) => {
        const _v = v.querySelector('div') as HTMLDivElement
        _v.style.color = ''
        const line = v.querySelector('div > div') as HTMLDivElement
        line.style.display = ''
    })
}

function useRepaceState(handler: () => void) {
    useEffect(() => {
        window.addEventListener('replacestate', handler)
        return () => window.removeEventListener('replacestate', handler)
    }, [handler])
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

function useLocationChange() {
    const onLocationChange = useCallback(() => {
        console.log(location.href)
    }, [])

    useEffect(() => {
        onLocationChange()
        window.addEventListener('locationchange', onLocationChange)
        return () => window.removeEventListener('locationchange', onLocationChange)
    }, [onLocationChange])
}


export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const style = getStyle()
    const classes = useEnhancedProfileStyles(style)

    const [active, setActive] = useState(false)

    const onClose = () => {
        setActive(false)
        MaskMessage.events.profileNFTsPageUpdate.sendToLocal({ show: false })
        resetStatus()
    }
    const onOpen = () => {
        MaskMessage.events.profileNFTsPageUpdate.sendToLocal({ show: true })
        setActive(true)
    }

    useRepaceState(onClose)

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

const EnhancedProfileaPageStyles = makeStyles<Theme, StyleProps>((theme) => ({
    empty: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            fontSize: 18,
            fontFamily: 'inherit',
            fontWeight: 700,
            color: 'black',
        },
    },
    button: {
        backgroundColor: (props: StyleProps) => props.activeColor,
        color: 'white',
        marginTop: 18,
        '&:hover': {
            backgroundColor: (props: StyleProps) => props.activeColor,
        },
    },
}))

export function EnhancedProfileaPage() {
    const [show, setShow] = useState(false)
    const style = getStyle()
    const classes = EnhancedProfileaPageStyles(style)

    useLocationChange()

    useEffect(() => {
        return MaskMessage.events.profileNFTsPageUpdate.on((data) => {
            setShow(data.show)
        })
    }, [])

    const resolvedAddress = useEthereumAddress()
    return <>{show ? <CollectibleListAddress classes={classes} address={resolvedAddress ?? ''} /> : null}</>
}
