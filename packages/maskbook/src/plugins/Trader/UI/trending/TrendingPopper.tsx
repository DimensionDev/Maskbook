import { useState, useEffect, useRef, useCallback } from 'react'
import type { Instance } from '@popperjs/core'
import { Popper, ClickAwayListener, PopperProps, Fade } from '@material-ui/core'
import { useLocation, useWindowScroll } from 'react-use'
import { PluginTraderMessages } from '../../messages'
import { WalletMessages } from '../../../Wallet/messages'
import type { DataProvider, TagType } from '../../types'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../../Transak/messages'
import { EthereumMessages } from '../../../Ethereum/messages'

export interface TrendingPopperProps {
    children?: (name: string, type: TagType, dataProviders: DataProvider[], reposition?: () => void) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper(props: TrendingPopperProps) {
    const popperRef = useRef<Instance | null>(null)
    const [freezed, setFreezed] = useState(false) // disable any click
    const [locked, setLocked] = useState(false) // state is updating, lock UI
    const [name, setName] = useState('')
    const [type, setType] = useState<TagType | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [availableProviders, setAvailableProviders] = useState<DataProvider[]>([])

    //#region select token and provider dialog could be open by trending view
    const onFreezed = useCallback((ev) => setFreezed(ev.open), [])
    useRemoteControlledDialog(EthereumMessages.events.transactionDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectWalletDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.walletConnectQRCodeDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTraderMessages.events.swapSettingsUpdated, onFreezed)
    //#endregion

    //#region open or close popper
    // open popper from message center
    useEffect(
        () =>
            PluginTraderMessages.events.cashTagObserved.on((ev) => {
                const update = () => {
                    setLocked(true)
                    setName(ev.name)
                    setType(ev.type)
                    setAnchorEl(ev.element)
                    setAvailableProviders(ev.dataProviders)
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
    if (!anchorEl || !type) return null
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
                            {props.children?.(name, type, availableProviders, () =>
                                setTimeout(() => popperRef.current?.update(), 100),
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
