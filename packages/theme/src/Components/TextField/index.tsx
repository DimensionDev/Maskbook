import { memo } from 'react'
import { formHelperTextClasses, makeStyles, TextField, TextFieldProps } from '@material-ui/core'
import { getMaskColor, MaskColorVar } from '../../constants'

const useStyles = makeStyles((theme) => ({
    root: {
        color: MaskColorVar.textLight,
        pointerEvents: 'inherit',
    },
    label: {
        display: 'flex',
        marginBottom: theme.spacing(1),
        fontFamily: 'PingFang SC',
        color: getMaskColor(theme).textPrimary,
        fontSize: 12,
        lineHeight: '16px',
    },
    field: {
        [`& > .${formHelperTextClasses.root}`]: {
            paddingLeft: theme.spacing(0.5),
            borderLeft: 'solid 2px',
            borderRadius: '2px',
            fontSize: 12,
            lineHeight: '16px',
        },
    },
    input: {
        padding: theme.spacing(1),
        background: getMaskColor(theme).normalBackground,
        fontSize: 12,
        lineHeight: '16px',
    },
}))

type MaskTextFieldProps = Exclude<TextFieldProps, 'variant'>

export const MaskTextField = memo((props: MaskTextFieldProps) => {
    const { label, ...rest } = props
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <label className={classes.label}>{label}</label>
            <TextField
                {...rest}
                classes={{ root: classes.field }}
                variant="standard"
                InputProps={{ disableUnderline: true, className: classes.input }}
            />
        </div>
    )
})
