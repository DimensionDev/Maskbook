import { makeStyles } from '@masknet/theme'

export const useStyles = makeStyles()((theme, props) => ({
    containerWrap: {
        padding: '0 15px',
        fontFamily: theme.typography.fontFamily,
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    titleImage: {
        height: '32px',
        margin: '0 10px 0 0',
    },
    inputLabel: {
        textAlign: 'right',
        fontSize: '12px',
        padding: '0 10px',
    },
    inputWrap: {
        position: 'relative',
        width: '100%',
        margin: '0 0 15px 0',
    },
    input: {
        background: 'transparent',
        border: 'none',
        width: '100%',
    },
    inputBalance: {
        position: 'absolute',
        right: '15px',
        top: '0',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    inputButton: {
        borderRadius: '5px',
        border: '1px solid ' + theme.palette.primary,
        margin: '0 10px 0 0',
    },
    inputCurrency: {
        display: 'flex',
        alignItems: 'center',
    },
    inputImage: {
        height: '24px',
        margin: '0 5px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 5px',
        fontWeight: 'bold',
    },
    infoRowLeft: {
        display: 'flex',
        alignItems: 'center',
    },
    infoRowRight: {},
    rowImage: {
        height: '24px',
    },
    button: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        borderRadius: 24,
        height: 'auto',
        marginTop: '0px !important',
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
}))
