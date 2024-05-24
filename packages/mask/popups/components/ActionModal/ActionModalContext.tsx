import { useTheme } from '@mui/material'
import { useCallback, useRef, useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import type { PopupModalRoutes } from '@masknet/shared-base'
import { createContainer } from '@masknet/shared-base-ui'
import urlcat from 'urlcat'

function useModal() {
    const [open, setOpen] = useState(false)
    const theme = useTheme()
    const openModal = useCallback(() => setOpen(true), [])

    const navigate = useNavigate()
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const leavingScreen = theme.transitions.duration.leavingScreen
    const closeModal = useCallback(() => {
        setOpen(false)
        clearTimeout(timerRef.current)
        // Wait for animation ending
        timerRef.current = setTimeout(navigate, leavingScreen, -1)
    }, [leavingScreen])
    return {
        open,
        /** open the drawer */
        openModal,
        closeModal,
    }
}

/** A Context to control the drawer inside ActionModal,
/* to add duration for the drawer exit-animation before route exiting
 */
export const ActionModalContainer = createContainer(useModal)
/**
 * To close a modal with animation, call `closeModal` instead of `navigate(-1)`
 */
export function useActionModal() {
    return ActionModalContainer.useContainer()
}

/**
 * Open a modal
 */
export function useModalNavigate() {
    const location = useLocation()
    const [, setSearchParams] = useSearchParams()
    const openModal = useCallback(
        (path: PopupModalRoutes, params?: Record<string, any>) => {
            setSearchParams((prev) => {
                prev.set('modal', urlcat(path, params || {}))
                return prev
            })
        },
        [location, setSearchParams],
    )
    return openModal
}
