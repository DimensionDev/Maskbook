import { makeStyles } from '@masknet/theme'
import { IconButton, InputBase, type InputBaseProps } from '@mui/material'
import type { PropsWithChildren } from 'react'

const useStyles = makeStyles()((theme) => ({
    input: {
        width: '100%',
    },
    iconButton: {
        padding: theme.spacing(0.5),
    },
}))

export interface InputBoxProps extends withClasses<'root'>, PropsWithChildren<{}> {
    label: string
    onChange?: (keyword: string) => void
    value?: string
    inputBaseProps?: Partial<InputBaseProps>
}
export function InputBox(props: InputBoxProps) {
    const { label, children, onChange, value } = props
    const { classes } = useStyles(undefined, { props })

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
