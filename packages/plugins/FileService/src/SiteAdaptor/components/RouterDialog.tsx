import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { useI18N } from '../../locales/i18n_generated.js'

export function RouterDialog(props: InjectedDialogProps) {
    const t = useI18N()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const title = matchPath(RoutePaths.UploadFile, pathname) ? t.upload_file() : t.__display_name()

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) {
            props.onClose?.()
        }
    }, [pathname === RoutePaths.Exit, props.onClose])

    return (
        <InjectedDialog
            {...props}
            title={title}
            onClose={() => {
                if (pathname === RoutePaths.Terms) {
                    props.onClose?.()
                    return
                }
                navigate(-1)
            }}
        />
    )
}
