import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useWindowScroll } from 'react-use'
import { ClickAwayListener, Fade, Popper, PopperProps } from '@material-ui/core'
import type { Instance } from '@popperjs/core'
import type { TagType } from '../../Trader/types'
import { PluginLBP_Messages } from '../messages'

export interface PoolPopperProps {
    children?: (name: string, type: TagType, reposition?: () => void) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function PoolPopper(props: PoolPopperProps) {
    const popperRef = useRef<Instance | null>(null)
    const [freezed, setFreezed] = useState(false)
    const [locked, setLocked] = useState(false)
    const [name, setName] = useState('')
    const [type, setType] = useState<TagType>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    //#region select token and provider dialog could be open by trending view
    const onFreezed = useCallback((ev) => setFreezed(ev.open), [])
    //#endregion

    //#region open or close popper
    // open popper from message center
    useEffect(
        () =>
            PluginLBP_Messages.events.tagObserved.on((ev) => {
                const update = () => {
                    setLocked(true)
                    setName(ev.name)
                    setType(ev.type)
                    setAnchorEl(ev.element)
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
                            {props.children?.(name, type, () => setTimeout(() => popperRef.current?.update(), 100))}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
