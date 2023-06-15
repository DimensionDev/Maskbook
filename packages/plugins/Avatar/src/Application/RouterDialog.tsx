import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useI18N } from '../locales/index.js'
import { RoutePaths } from './Routes.js'

export function RouterDialog(props: InjectedDialogProps) {
    const t = useI18N()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const title = matchPath(RoutePaths.Upload, pathname)
        ? t.application_edit_profile_dialog_title()
        : t.application_dialog_title()

    const isOnBack = pathname !== RoutePaths.Personas

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) {
            props.onClose?.()
        }
    }, [pathname === RoutePaths.Exit, props.onClose])

    return (
        <InjectedDialog
            {...props}
            title={title}
            isOnBack={isOnBack}
            onClose={() => {
                if (!isOnBack) {
                    props.onClose?.()
                    return
                }
                navigate(-1)
            }}
        />
    )
}
