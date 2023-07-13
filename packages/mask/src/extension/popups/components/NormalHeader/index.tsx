// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo, useCallback, useContext } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useNavigate } from 'react-router-dom'
import { PageTitleContext } from '../../context.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        background: theme.palette.maskColor.modalTitleBg,
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'grid',
        gridTemplateColumns: '24px auto 24px',
        alignItems: 'center',
        flexShrink: 0,
    },
    back: {
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
}

function canNavBack() {
    try {
        return history.length !== 1 || !!new URLSearchParams(location.search).get('goBack')
    } catch {}
    return false
}
export const NormalHeader = memo<NormalHeaderProps>(function NormalHeader({ onlyTitle }) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { title, extension, customBackHandler } = useContext(PageTitleContext)

    const showTitle = canNavBack() && title

    const handleBack = useCallback(() => navigate(-1), [])
    if (onlyTitle)
        return (
            <Box className={classes.container} style={{ justifyContent: 'center' }}>
                <Typography className={classes.title}>{title}</Typography>
            </Box>
        )

    return (
        <Box className={classes.container}>
            {showTitle ? (
                <>
                    <Icons.Comeback className={classes.back} onClick={customBackHandler ?? handleBack} />
                    <Typography className={classes.title}>{title}</Typography>
                    {extension}
                </>
            ) : (
                <Icons.Mask className={classes.logo} />
            )}
        </Box>
    )
})
