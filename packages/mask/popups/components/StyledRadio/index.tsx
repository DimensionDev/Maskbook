import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Radio, radioClasses, type RadioProps } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        '&:hover': {
            backgroundColor: 'transparent',
        },
        color: theme.palette.maskColor.secondaryLine,
        [`&.${radioClasses.checked} svg`]: {
            filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        },
        [`&.${radioClasses.disabled} svg`]: {
            color: theme.palette.maskColor.secondaryLine,
            '& circle': {
                fill: `${theme.palette.maskColor.bg} !important`,
            },
        },
    },
}))

export const StyledRadio = memo((props: RadioProps) => {
    const { classes } = useStyles()
    return (
        <Radio
            {...props}
            classes={{ root: classes.root }}
            checkedIcon={<Icons.RadioButtonChecked size={20} />}
            icon={<Icons.RadioButtonUnChecked size={20} />}
            disableRipple
        />
    )
})
