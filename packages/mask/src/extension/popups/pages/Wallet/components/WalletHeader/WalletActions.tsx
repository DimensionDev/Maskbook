import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, type BoxProps } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../../utils/index.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 68,
        gap: theme.spacing(2),
    },
    button: {
        color: theme.palette.maskColor.second,
        width: 112,
        height: theme.spacing(4.5),
        boxSizing: 'border-box',
        backgroundColor: theme.palette.maskColor.bottom,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        border: 'none',
        boxShadow: '0px 4px 6px 0px rgba(102, 108, 135, 0.10)',
        cursor: 'pointer',
        transition: 'transform 0.1s ease',
        '&:hover': {
            transform: 'scale(1.05)',
        },
        '&:active': {
            transform: 'scale(0.95)',
        },
    },
    label: {
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1),
        fontFamily: 'Helvetica',
        fontWeight: 700,
        fontSize: 14,
    },
}))

export const WalletActions = memo(function WalletActions(props: BoxProps) {
    const { classes, cx, theme } = useStyles()
    const { t } = useI18N()
    const navigate = useNavigate()

    return (
        <Box {...props} className={cx(classes.container, props.className)}>
            <button type="button" className={classes.button}>
                <Icons.Send size={20} color={theme.palette.maskColor.main} />
                <Typography className={classes.label}>{t('wallet_send')}</Typography>
            </button>
            <button type="button" className={classes.button} onClick={() => navigate(PopupRoutes.Receive)}>
                <Icons.ArrowDownward size={20} color={theme.palette.maskColor.main} />
                <Typography className={classes.label}>{t('wallet_receive')}</Typography>
            </button>
            <button type="button" className={classes.button}>
                <Icons.Send size={20} color={theme.palette.maskColor.main} />
                <Typography className={classes.label}>{t('wallet_swap')}</Typography>
            </button>
        </Box>
    )
})
