import { memo, useEffect, useState } from 'react'
import { useLocation } from 'react-use'
import { ClickAwayListener, Fade } from '@mui/material'
import type { SocialIdentity } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { AnchorProvider, useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { PluginTraderMessages } from '../../messages.js'

interface TrendingPopperProps {
    children?: (
        name?: string,
        type?: TrendingAPI.TagType,
        currentResult?: Web3Helper.TokenResultAll,
        setActive?: (x: boolean) => void,
        identity?: SocialIdentity,
        address?: string,
        isCollectionProjectPopper?: boolean,
    ) => React.ReactNode
    locked?: boolean
}

export const TrendingPopper = memo(function TrendingPopper({ children, locked }: TrendingPopperProps) {
    const [active, setActive] = useState(false)
    const [name, setName] = useState('')
    const [isCollectionProjectPopper, setIsNFTProjectPopper] = useState(false)
    const [identity, setIdentity] = useState<SocialIdentity>()
    const [badgeBounding, setBadgeBounding] = useState<DOMRect>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [address, setAddress] = useState('')
    const [currentResult, setCurrentResult] = useState<Web3Helper.TokenResultAll>()
    const [type, setType] = useState<TrendingAPI.TagType>()
    const [initialOffsetY, setInitialOffsetY] = useState(0)

    // open popper from message center
    useEffect(() => {
        return PluginTraderMessages.trendingAnchorObserved.on((ev) => {
            setInitialOffsetY(window.scrollY)
            setName(ev.name)
            setCurrentResult(ev.currentResult)
            setType(ev.type)
            setBadgeBounding(ev.anchorBounding)
            setAnchorEl(ev.anchorEl)
            setAddress(ev.address ?? '')
            setIdentity(ev.identity)
            setIsNFTProjectPopper(!!ev.isCollectionProjectPopper)
            setActive(true)
        })
    }, [])

    useEffect(() => {
        const onResize = () => setActive(false)

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    // close popper if location was changed
    const location = useLocation()
    useRenderPhraseCallbackOnDepsChange(() => setActive(false), [location.state?.key, location.href])

    const badgeBoundingBottom = badgeBounding?.bottom ?? 0
    const badgeBoundingLeft = badgeBounding?.left ?? 0
    const positionY_Type = badgeBoundingBottom < 550 ? 'bottom' : 'top'
    const positionX_Type = window.innerWidth - badgeBoundingLeft < 700 ? 'right' : 'left'

    if (!type) return null

    return (
        <ClickAwayListener
            onClickAway={() => {
                if (!locked) setActive(false)
            }}>
            <Fade in={active} easing="linear" timeout={250}>
                <div
                    style={{
                        position: 'absolute',
                        left: positionX_Type === 'left' ? badgeBoundingLeft - 20 : badgeBoundingLeft - 300,
                        ...(positionY_Type === 'bottom' ?
                            { top: badgeBoundingBottom + initialOffsetY + 10 }
                        :   { bottom: window.innerHeight - badgeBoundingBottom + 10 - initialOffsetY }),
                    }}>
                    <AnchorProvider anchorEl={anchorEl} anchorBounding={badgeBounding}>
                        {children?.(name, type, currentResult, setActive, identity, address, isCollectionProjectPopper)}
                    </AnchorProvider>
                </div>
            </Fade>
        </ClickAwayListener>
    )
})
