import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import Color from 'color'
import { useCallback, useEffect, useState } from 'react'
import {
    searchForegroundColorSelector,
    searchNewTweetButtonSelector,
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
    hover: string
    line: string
}

const useEnhancedProfileStyles = makeStyles<StyleProps>()((theme, props) => ({
    tab: {
        '&:hover': {
            backgroundColor: new Color(props.hover).alpha(0.1).toString(),
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
            color: props.hover,
        },
    },
    hot: {
        color: props.hover,
    },
    line: {
        dispaly: 'inline-flex',
        borderRadius: 99999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: props.line,
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
    const eleNewTweetButton = searchNewTweetButtonSelector().evaluate()
    const newTweetButtonColorStyle = eleNewTweetButton ? window.getComputedStyle(eleNewTweetButton) : EMPTY_STYLE
    const eleBackButton = searchForegroundColorSelector().evaluate()
    const backButtonColorStyle = eleBackButton ? window.getComputedStyle(eleBackButton) : EMPTY_STYLE

    return {
        color: style.color,
        font: style.font,
        fontSize: style.fontSize,
        padding: style.paddingBottom,
        height: style.height,
        hover: backButtonColorStyle.color,
        line: newTweetButtonColorStyle.backgroundColor,
    } as StyleProps
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
                {active ? <div className={classes.line} /> : null}
            </div>
        </div>
    )
}
