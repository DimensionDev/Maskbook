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
        fontSize: '24px',
        margin: '0 0 15px 0',
    },
    titleImage: {
        height: '32px',
        margin: '0 15px 0 0',
    },
    inputWrap: {
        position: 'relative',
        width: '100%',
        margin: '0 0 15px 0',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 5px 15px 5px',
    },
    infoRowLeft: {
        display: 'flex',
        alignItems: 'center',
    },
    infoRowRight: {
        fontWeight: 'bold',
    },
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
