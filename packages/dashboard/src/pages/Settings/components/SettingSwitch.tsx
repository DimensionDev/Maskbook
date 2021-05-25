import { Switch, experimentalStyled as styled, switchClasses } from '@material-ui/core'

export default styled(Switch)(() => ({
    [`&.${switchClasses.root}`]: {
        width: 72,
        height: 48,
    },
    [`& .${switchClasses.thumb}`]: {
        width: 24,
        height: 24,
    },
    [`& .${switchClasses.checked}`]: {
        [`&.${switchClasses.switchBase}`]: {
            transform: 'translateX(28px)',
        },
        [`&+.${switchClasses.track}`]: {
            opacity: '0.1 !important',
        },
    },
    [`& .${switchClasses.track}`]: {
        borderRadius: 12,
    },
    [`& .${switchClasses.switchBase}`]: {
        top: 3,
        transform: 'translateX(2px)',
    },
}))
