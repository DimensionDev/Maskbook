import React, { useState, useEffect, useRef, useCallback } from 'react'
import type PopperJs from 'popper.js'
import { Popper, ClickAwayListener, PopperProps, Fade } from '@material-ui/core'
import { useLocation, useWindowScroll } from 'react-use'
import { TraderMessageCenter } from '../../messages'
import { WalletMessageCenter as MessageCenterWallet, MaskbookWalletMessages } from '../../../Wallet/messages'
import type { DataProvider } from '../../types'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'

export interface TrendingPopperProps {
    children?: (name: string, platforms: DataProvider[], reposition?: () => void) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper(props: TrendingPopperProps) {
    const popperRef = useRef<PopperJs | null>(null)
    const [freezed, setFreezed] = useState(false) // disable any click
    const [locked, setLocked] = useState(false) // state is updating, lock UI
    const [name, setName] = useState('')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [availablePlatforms, setAvailablePlatforms] = useState<DataProvider[]>([])

    //#region select token and provider dialog could be open by trending view
    const onFreezed = useCallback((ev) => setFreezed(ev.open), [])
    useRemoteControlledDialog<MaskbookWalletMessages, 'selectERC20TokenDialogUpdated'>(
        MessageCenterWallet,
        'selectERC20TokenDialogUpdated',
        onFreezed,
    )
    useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        MessageCenterWallet,
        'selectProviderDialogUpdated',
        onFreezed,
    )
    useRemoteControlledDialog<MaskbookWalletMessages, 'selectWalletDialogUpdated'>(
        MessageCenterWallet,
        'selectWalletDialogUpdated',
        onFreezed,
    )
    useRemoteControlledDialog<MaskbookWalletMessages, 'walletConnectQRCodeDialogUpdated'>(
        MessageCenterWallet,
        'walletConnectQRCodeDialogUpdated',
        onFreezed,
    )
    //#endregion

    //#region open or close popper
    // open popper from message center
    useEffect(
        () =>
            TraderMessageCenter.on('cashTagObserved', (ev) => {
                const update = () => {
                    setLocked(true)
                    setName(ev.name)
                    setAnchorEl(ev.element)
                    setAvailablePlatforms(ev.availablePlatforms)
                    setLocked(false)
                }
                // observe the same element
                if (anchorEl === ev.element) return
                // close popper on previous element
                if (anchorEl) {
                    setAnchorEl(null)
                    setTimeout(update, 400)
                    return
                }
                update()
            }),
        [anchorEl],
    )

    // close popper if location was changed
    const location = useLocation()
    useEffect(() => setAnchorEl(null), [location.state?.key, location.href])

    // close popper if scroll out of visual screen
    const position = useWindowScroll()
    useEffect(() => {
        if (!anchorEl) return
        const { top } = anchorEl.getBoundingClientRect()
        if (
            top < 0 || // out off top bound
            top > document.documentElement.clientHeight // out off bottom bound
        )
            setAnchorEl(null)
    }, [anchorEl, Math.floor(position.y / 50)])
    //#endregion

    if (locked) return null
    if (!anchorEl) return null
    return (
        <ClickAwayListener
            onClickAway={() => {
                if (!freezed) setAnchorEl(null)
            }}>
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                disablePortal
                transition
                style={{ zIndex: 1, margin: 4 }}
                popperRef={popperRef}
                {...props.PopperProps}>
                {({ TransitionProps }) => (
                    <Fade in={Boolean(anchorEl)} {...TransitionProps}>
                        <div>
                            {props.children?.(name, availablePlatforms, () =>
                                setTimeout(() => popperRef.current?.scheduleUpdate(), 100),
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
