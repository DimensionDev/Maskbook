import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { Trans } from '@lingui/macro'

export function RouterDialog(props: InjectedDialogProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const title =
        matchPath(RoutePaths.UploadFile, pathname) ? <Trans>Upload File</Trans> : <Trans>Web3 File Service</Trans>

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
