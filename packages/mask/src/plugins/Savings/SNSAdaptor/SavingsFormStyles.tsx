import { makeStyles } from '@masknet/theme'

export const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        padding: 0,
        fontFamily: theme.typography.fontFamily,
    },
    inputWrap: {
        position: 'relative',
        width: '100%',
        margin: '0 0 10px 0',
    },
    inputTextField: {
        padding: '15px 10px 0 10px',
        fontSize: '18px',
    },
    maxChip: {
        height: '20px',
        borderRadius: '3px',
        margin: '0 5px 10px 0',
    },
    selectTokenChip: {
        margin: '0 0 10px 0',
    },
    tokenValueUSD: {
        padding: '0 0 10px 0',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0 15px 0',
    },
    infoRowLeft: {
        display: 'flex',
        alignItems: 'center',
    },
    infoRowRight: {
        fontWeight: 'bold',
    },
    rowImage: {
        width: '24px',
        height: '24px',
        margin: '0 5px 0 0',
    },
    button: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        borderRadius: 24,
        height: 'auto',
        marginTop: '0 !important',
    },
    disabledButton: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        borderRadius: 24,
        height: 'auto',
    },
    connectWallet: {
        marginTop: 0,
    },
    tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
        color: theme.palette.mode === 'dark' ? '#7B8192' : '#ffffff',
        borderRadius: 8,
        padding: 16,
        textAlign: 'left',
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
    },
    tooltipArrow: {
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    },
    gasFee: {
        padding: '0 0 0 5px',
        fontSize: 11,
        opacity: 0.5,
    },
}))
