import { useTheme } from '@mui/material'
import { useCallback, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { PopupModalRoutes } from '@masknet/shared-base'
import { createContainer } from 'unstated-next'

function useModal() {
    const [open, setOpen] = useState(false)
    const theme = useTheme()
    const openModal = useCallback(() => setOpen(true), [])

    const navigate = useNavigate()
    const timerRef = useRef<NodeJS.Timeout>()
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
 * To open a modal, should navigate with setting state `{ mainLocation: location }`
 */
export function useModalNavigate() {
    const location = useLocation()
    const navigate = useNavigate()
    const openModal = useCallback(
        (path: PopupModalRoutes) => {
            navigate(path, { state: { mainLocation: location } })
        },
        [location, navigate],
    )
    return openModal
}
