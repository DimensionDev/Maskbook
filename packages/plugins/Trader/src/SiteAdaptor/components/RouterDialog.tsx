import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RoutePaths } from '../constants.js'

export function RouterDialog(props: InjectedDialogProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) {
            props.onClose?.()
        }
    }, [pathname === RoutePaths.Exit, props.onClose])

    return (
        <InjectedDialog
            {...props}
            onClose={() => {
                navigate(-1)
            }}
        />
    )
}
