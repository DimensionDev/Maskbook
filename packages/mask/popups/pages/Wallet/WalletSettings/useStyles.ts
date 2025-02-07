/* eslint-disable tss-unused-classes/unused-classes */
import { makeStyles } from '@masknet/theme'
import { alpha } from '@mui/material'

export const useStyles = makeStyles()((theme) => ({
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    list: {
        padding: '0px 16px 0px 16px',
        overflow: 'auto',
        flexGrow: 1,
    },
    primaryItem: {
        margin: '16px 16px 12px 16px',
        background: theme.palette.maskColor.primary,
    },
    primaryItemText: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.white,
    },
    primaryItemSecondText: {
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
        borderRadius: '8px',
        boxShadow: `0px 0px 20px 0px ${alpha(theme.palette.maskColor.main, 0.05)}`,
    },
    itemText: {
        marginLeft: 6,
        marginRight: 2,
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
    bottomAction: {
        paddingTop: 16,
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
    },
    ellipsis: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        maxWidth: 150,
    },
    removeWalletButton: {
        marginBottom: 16,
    },
    bold: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    confirmMessage: {
        fontSize: 14,
        lineHeight: '18px',
        wordBreak: 'break-word',
        maxHeight: '60vh',
        overflow: 'auto',
    },
}))
