import { ForwardedRef, forwardRef } from 'react'
import { Box, formHelperTextClasses, makeStyles, TextField, TextFieldProps, Typography } from '@material-ui/core'
import { getMaskColor } from '../../constants'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        marginBottom: theme.spacing(4),
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 'bolder',
    },
    field: {
        width: '100%',
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
        background:
            theme.palette.mode === 'dark' ? getMaskColor(theme).lightBackground : getMaskColor(theme).normalBackground,
        fontSize: 12,
        lineHeight: '16px',
    },
}))

type MaskTextFieldProps = Exclude<TextFieldProps, 'variant'>

export const MaskTextField = forwardRef((props: MaskTextFieldProps, ref: ForwardedRef<any>) => {
    const { label, ...rest } = props
    const classes = useStyles()

    return (
        <Box sx={{ mb: 4 }}>
            {label && typeof label === 'string' && (
                <Typography sx={{ mb: 1 }} variant="body2" className={classes.label}>
                    {label}
                </Typography>
            )}
            {label && typeof label !== 'string' && label}
            <TextField
                ref={ref}
                {...rest}
                classes={{ root: classes.field }}
                variant="standard"
                InputProps={{ disableUnderline: true, className: classes.input }}
            />
        </Box>
    )
})
