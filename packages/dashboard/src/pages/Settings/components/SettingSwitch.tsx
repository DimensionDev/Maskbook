import { Switch, styled, switchClasses } from '@material-ui/core'

export default styled<typeof Switch>(Switch)(({ size }) => {
    const isSmall = size === 'small'
    const base = isSmall ? 16 : 24
    return {
        [`&.${switchClasses.root}`]: {
            width: base * 3,
            height: base * 2,
            padding: isSmall ? 8 : 12,
        },
        [`& .${switchClasses.thumb}`]: {
            width: base,
            height: base,
        },
        [`& .${switchClasses.checked}`]: {
            [`&.${switchClasses.switchBase}`]: {
                transform: `translateX(${isSmall ? 20 : 28}px)`,
            },
            [`&+.${switchClasses.track}`]: {
                opacity: '0.1 !important',
            },
        },
        [`& .${switchClasses.track}`]: {
            borderRadius: base / 2,
        },
        [`& .${switchClasses.switchBase}`]: {
            top: isSmall ? 4 : 3,
            transform: `translateX(${isSmall ? 4 : 2}px)`,
        },
    }
})
