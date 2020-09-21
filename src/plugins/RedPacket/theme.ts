import { unstable_createMuiStrictModeTheme } from '@material-ui/core'
import { getUrl } from '../../utils/utils'

export const PluginRedPacketTheme = unstable_createMuiStrictModeTheme({
    overrides: {
        MuiDialog: {
            paper: {
                backgroundColor: 'rgb(219,6,50) !important',
                color: 'white !important',
                position: 'relative',
                '&::after': {
                    position: 'absolute',
                    backgroundImage: `url(${getUrl('wallet/present-default.png')})`,
                    top: 250,
                    width: 60,
                    height: 60,
                    right: 8,
                    opacity: 0.8,
                    backgroundAttachment: 'local',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    content: '""',
                },
            },
        },
        MuiDialogTitle: {
            root: {
                borderBottom: '1px solid rgba(199,26,57) !important',
            },
        },
        MuiChip: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgb(240,60,60) !important',
                },
                backgroundColor: 'rgb(192,20,56) !important',
                color: 'white !important',
            },
            deleteIcon: {
                color: 'rgba(255, 255, 255, 0.46) !important',
                '&:hover': {
                    color: 'rgba(255, 255, 255, 0.8) !important',
                },
            },
            avatar: {
                color: 'rgba(255, 255, 255, 0.8) !important',
            },
        },
        MuiIconButton: {
            label: {
                color: 'white !important',
            },
        },
        MuiSwitch: {
            thumb: {
                color: 'white !important',
            },
            track: {
                '$checked$checked + &': {
                    backgroundColor: 'white !important',
                },
            },
        },
        MuiInputBase: {
            input: {
                '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7) !important',
                },
            },
        },
        MuiButton: {
            containedPrimary: {
                backgroundColor: 'white !important',
                color: 'rgb(219,6,50) !important',
            },
        },
    },
})
