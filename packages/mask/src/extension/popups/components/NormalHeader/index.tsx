// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo, useContext } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageTitleContext } from '../../context.js'
import { PopupRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        background: theme.palette.maskColor.modalTitleBg,
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'grid',
        gridTemplateColumns: '24px auto 24px',
        alignItems: 'center',
    },
    back: {
        fontSize: 24,
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    close: {
        position: 'absolute',
        left: 16,
        top: 16,
        fontSize: 24,
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    title: {
        fontSize: 14,
        lineHeight: '22px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        minHeight: 22,
        textAlign: 'center',
    },
    logo: {
        width: 96,
        height: 30,
    },
}))

interface NormalHeaderProps {
    onlyTitle?: boolean
    onClose(): void
}

function canNavBack() {
    try {
        return history.length !== 1 || !!new URLSearchParams(location.search).get('goBack')
    } catch {}
    return false
}
export const NormalHeader = memo<NormalHeaderProps>(function NormalHeader({ onlyTitle, onClose }) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const location = useLocation()
    const { title, extension } = useContext(PageTitleContext)

    const goBack = new URLSearchParams(location.search).get('goBack')

    const showTitle = canNavBack() && title

    const showClose = location.pathname === PopupRoutes.ConnectWallet && !goBack

    if (onlyTitle)
        return (
            <Box className={classes.container} style={{ justifyContent: 'center' }}>
                <Typography className={classes.title}>{title}</Typography>
            </Box>
        )

    if (showClose) {
        return (
            <Box className={classes.container} style={{ justifyContent: 'center' }}>
                <Icons.PopupClose className={classes.close} onClick={onClose} />
                <Typography className={classes.title}>{title}</Typography>
                {extension}
            </Box>
        )
    }

    return (
        <Box className={classes.container}>
            {showTitle ? (
                <>
                    <Icons.Comeback className={classes.back} onClick={() => navigate(-1)} />
                    <Typography className={classes.title}>{title}</Typography>
                    {extension}
                </>
            ) : (
                <Icons.Mask className={classes.logo} />
            )}
        </Box>
    )
})
