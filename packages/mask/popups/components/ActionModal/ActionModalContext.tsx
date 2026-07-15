import type { PopupModalRoutes } from '@masknet/shared-base'
import { createContainer } from '@masknet/shared-base-ui'
import { useTheme } from '@mui/material'
import { useCallback, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const openModal = useCallback(
        (path: PopupModalRoutes, params?: { [property: string]: any }) => {
            searchParams.set('modal', urlcat(path, params || {}))
            // useLocation().pathname is pathname of modal Routes (maybe since a certain version)
            // So we use pathname in hash instead
            const mainLocationPathname = location.hash.slice(1).replace(/\?.*$/u, '')
            navigate(`${mainLocationPathname}?${searchParams.toString()}`)
        },
        [navigate, searchParams],
    )
    return openModal
}
