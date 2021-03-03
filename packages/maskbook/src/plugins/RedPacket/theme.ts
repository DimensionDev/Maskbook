import { unstable_createMuiStrictModeTheme } from '@material-ui/core'

export const PluginRedPacketTheme = unstable_createMuiStrictModeTheme({
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgb(219,6,50) !important',
                    color: 'white !important',
                    position: 'relative',
                    '&::after': {
                        position: 'absolute',
                        backgroundImage: `url(${new URL('./UI/present-default.png', import.meta.url)})`,
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
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(199,26,57) !important',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
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
        },
        MuiIconButton: {
            styleOverrides: {
                label: {
                    color: 'white !important',
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                thumb: {
                    color: 'white !important',
                },
                track: {
                    '$checked$checked + &': {
                        backgroundColor: 'white !important',
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    color: 'white !important',
                    '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7) !important',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    backgroundColor: 'white !important',
                    color: 'rgb(219,6,50) !important',
                },
            },
        },
    },
})
