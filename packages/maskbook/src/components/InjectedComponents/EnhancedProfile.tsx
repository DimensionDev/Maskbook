import { getMaskColor } from '@masknet/theme'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import Color from 'color'
import { useCallback, useEffect, useState } from 'react'
import { CollectibleListAddress } from '../../extension/options-page/DashboardComponents/CollectibleList'
import { useEthereumAddress } from '../../social-network-adaptor/twitter.com/injection/useEthereumName'
import {
    searchForegroundColorSelector,
    searchProfileEmptySelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
} from '../../social-network-adaptor/twitter.com/utils/selector'
import { MaskMessage } from '../../utils'

interface StyleProps {
    color: string
    font: string
    fontSize: string
    padding: string
    height: string
    activeColor: string
}

const useEnhancedProfileStyles = makeStyles<StyleProps>()((theme, props) => ({
    tab: {
        '&:hover': {
            backgroundColor: new Color(props.activeColor).alpha(0.1).toString(),
            cursor: 'pointer',
        },
        height: props.height,
    },
    button: {
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: props.padding,
        fontWeight: 700,
        color: props.color,
        font: props.font,
        fontSize: props.fontSize,
        '&:hover': {
            color: props.activeColor,
        },
    },
    hot: {
        color: props.activeColor,
    },
    active: {
        dispaly: 'inline-flex',
        borderRadius: 99999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: props.activeColor,
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

function useLocationChange(handler: () => void) {
    const onLocationChange = useCallback(() => {
        handler()
    }, [handler])

    useEffect(() => {
        window.addEventListener('locationchange', onLocationChange)
        return () => window.removeEventListener('locationchange', onLocationChange)
    }, [onLocationChange])
}

export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const style = getStyle()
    const { classes } = useEnhancedProfileStyles(style)
    const [active, setActive] = useState(false)

    const onClose = () => {
        setActive(false)
        MaskMessage.events.profileNFTsPageUpdated.sendToLocal({ show: false })
        resetStatus()
    }
    const onOpen = () => {
        MaskMessage.events.profileNFTsPageUpdated.sendToLocal({ show: true })
        setActive(true)
    }

    useEffect(() => {
        return MaskMessage.events.profileNFTsTabUpdated.on(onClose)
    }, [])

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
const useEnhancedProfileaPageStyles = makeStyles<StyleProps>()((theme, props) => ({
    empty: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            fontSize: 18,
            fontFamily: 'inherit',
            fontWeight: 700,
            color: getMaskColor(theme).textPrimary,
        },
    },
    button: {
        backgroundColor: props.activeColor,
        color: 'white',
        marginTop: 18,
        '&:hover': {
            backgroundColor: props.activeColor,
        },
    },
}))

export function EnhancedProfileaPage() {
    const [show, setShow] = useState(false)
    const style = getStyle()
    const { classes } = useEnhancedProfileaPageStyles(style)

    useLocationChange(() => {
        MaskMessage.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        return MaskMessage.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [])

    const resolvedAddress = useEthereumAddress()
    return <>{show ? <CollectibleListAddress classes={classes} address={resolvedAddress ?? ''} /> : null}</>
}
