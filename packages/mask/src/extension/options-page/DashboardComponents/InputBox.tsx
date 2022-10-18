import { makeStyles, useStylesExtends } from '@masknet/theme'
import { IconButton, InputBase, InputBaseProps } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    input: {
        width: '100%',
    },
    iconButton: {
        padding: theme.spacing(0.5),
    },
}))

export interface InputBoxProps extends withClasses<'root'> {
    label: string
    onChange?: (keyword: string) => void
    children?: React.ReactElement
    value?: string
    inputBaseProps?: Partial<InputBaseProps>
}
export function InputBox(props: InputBoxProps) {
    const { label, children, onChange, value } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <InputBase
            startAdornment={
                <IconButton size="large" className={classes.iconButton} aria-label="label">
                    {children}
                </IconButton>
            }
            className={classes.input}
            placeholder={label}
            value={value}
            onChange={(e) => {
                onChange?.(e.target.value)
            }}
            {...props.inputBaseProps}
        />
    )
}
