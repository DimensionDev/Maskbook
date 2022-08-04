import { Switch, styled, switchClasses } from '@mui/material'

export const SettingSwitch = styled<typeof Switch>(Switch)(({ size }) => {
    const isSmall = size === 'small'
    const base = isSmall ? 16 : 24
    return {
        [`&.${switchClasses.root}`]: {
            width: base * 3,
            height: base * 2,
            padding: '5px 3px',
        },
        [`& .${switchClasses.thumb}`]: {
            width: base,
            height: base,
        },
        [`& .${switchClasses.checked}`]: {
            color: 'white',
            [`&.${switchClasses.switchBase}`]: {
                transform: `translateX(${isSmall ? 20 : 28}px)`,
            },
            [`&+.${switchClasses.track}`]: {
                opacity: '1 !important',
                backgroundColor: '#3DC233',
            },
        },
        [`& .${switchClasses.track}`]: {
            borderRadius: 12,
        },
        [`& .${switchClasses.switchBase}`]: {
            top: isSmall ? 4 : 3,
            transform: `translateX(${isSmall ? 4 : 2}px)`,
        },
    }
}) as any as typeof Switch
