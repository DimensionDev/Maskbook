import { memo, useContext } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { MaskNotSquareIcon, SquareBack, PopupCloseIcon } from '@masknet/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageTitleContext } from '../../context'
import { PopupRoutes } from '@masknet/shared-base'
import Services from '../../../service'

const useStyles = makeStyles()(() => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: 16,
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
    },
    back: {
        fill: 'none',
        position: 'absolute',
        left: 16,
        top: 16,
        fontSize: 30,
        cursor: 'pointer',
    },
    close: {
        position: 'absolute',
        left: 16,
        top: 16,
        fontSize: 30,
        cursor: 'pointer',
    },
    title: {
        fontSize: 14,
        lineHeight: '30px',
        color: '#15181B',
        fontWeight: 700,
        minHeight: 30,
    },
    logo: {
        width: 96,
        height: 30,
    },
}))

interface NormalHeaderProps {
    onlyTitle?: boolean
}

export const NormalHeader = memo<NormalHeaderProps>(({ onlyTitle }) => {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const location = useLocation()
    const { title } = useContext(PageTitleContext)

    const goBack = new URLSearchParams(location.search).get('goBack')

    const showTitle = (history.length !== 1 && title) || !!goBack

    const showClose = location.pathname === PopupRoutes.ConnectWallet

    if (onlyTitle)
        return (
            <Box className={classes.container} style={{ justifyContent: 'center' }}>
                <Typography className={classes.title}>{title}</Typography>
            </Box>
        )

    if (showClose) {
        return (
            <Box className={classes.container} style={{ justifyContent: 'center' }}>
                <PopupCloseIcon className={classes.close} onClick={() => Services.Helper.removePopupWindow()} />
                <Typography className={classes.title}>{title}</Typography>
            </Box>
        )
    }

    return (
        <Box className={classes.container} style={{ justifyContent: showTitle ? 'center' : 'flex-start' }}>
            {showTitle ? (
                <>
                    <SquareBack className={classes.back} onClick={() => navigate(-1)} />
                    <Typography className={classes.title}>{title}</Typography>
                </>
            ) : (
                <MaskNotSquareIcon className={classes.logo} />
            )}
        </Box>
    )
})
