import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect, useRef } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useAvatarTrans } from '../locales/index.js'
import { AvatarRoutes, RoutePaths } from './Routes.js'
import { Icons } from '@masknet/icons'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { NFTListDialogRef } from './NFTListDialog.js'

const useStyles = makeStyles()({
    root: {
        margin: 0,
        minHeight: 564,
        padding: '0px !important',
        display: 'flex',
        flexDirection: 'column',
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
})

export function RouterDialog(props: InjectedDialogProps) {
    const { classes } = useStyles()
    const nftListRef = useRef<NFTListDialogRef>()
    const t = useAvatarTrans()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) props.onClose?.()
    }, [pathname, props.onClose])

    const title =
        matchPath(RoutePaths.Upload, pathname) ?
            t.application_edit_profile_dialog_title()
        :   t.application_dialog_title()
    const titleTail =
        matchPath(RoutePaths.NFTPicker, pathname) ?
            <Icons.Plus
                onClick={() => {
                    nftListRef.current?.handleAddCollectibles()
                }}
            />
        :   undefined

    const isOnBack = pathname !== RoutePaths.Personas

    return (
        <InjectedDialog
            {...props}
            title={title}
            isOnBack={isOnBack}
            titleTail={titleTail}
            onClose={() => {
                if (!isOnBack) {
                    props.onClose?.()
                    return
                }
                navigate(-1)
            }}>
            <DialogContent className={classes.root}>
                <AvatarRoutes ref={nftListRef} />
            </DialogContent>
        </InjectedDialog>
    )
}
