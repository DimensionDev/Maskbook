/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from '@masknet/theme'
import { alpha } from '@mui/material'

export const useStyles = makeStyles()((theme) => ({
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        padding: '12px 16px 0px 16px',
        height: 400,
        overflow: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    primaryItem: {
        margin: '16px 16px 0 16px',
        cursor: 'default',
        background: theme.palette.maskColor.primary,
    },
    primaryItemText: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.white,
    },
    primaryItemSecondeText: {
        fontSize: 10,
        fontWeight: 700,
        color: alpha(theme.palette.maskColor.white, 0.8),
    },
    item: {
        display: 'flex',
        padding: theme.spacing(1.5),
        marginBottom: 12,
        alignItems: 'center',
        cursor: 'pointer',
        justifyContent: 'space-between',
        background: theme.palette.maskColor.bottom,
        borderRadius: 16,
        boxShadow: `0px 0px 20px 0px ${alpha(theme.palette.maskColor.main, 0.05)}`,
    },
    itemText: {
        marginLeft: 6,
        fontSize: 14,
        color: theme.palette.maskColor.main,
    },
    walletInfo: {
        marginLeft: 12,
    },
    maskBlue: {
        border: `1px solid ${theme.palette.maskColor.white}`,
        borderRadius: 99,
    },
    primaryItemBox: {
        display: 'flex',
        alignItems: 'center',
        height: 36,
    },
    itemBox: {
        display: 'flex',
        alignItems: 'center',
        height: 24,
    },
}))
