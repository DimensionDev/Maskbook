import { getMaskColor, makeStyles, useStylesExtends } from '@masknet/theme'
import { IconButton, InputBase, InputBaseProps, Paper, Typography } from '@mui/material'
import { useState, useEffect } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'block',
        width: '100%',
        border: `1px solid ${getMaskColor(theme).border}`,
        alignItems: 'center',
        padding: theme.spacing(1),
        boxSizing: 'border-box',
    },
    search: {
        marginBottom: 0,
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        width: '100%',
    },
    iconButton: {
        padding: theme.spacing(0.5),
    },
    label: {
        width: '100%',
        paddingLeft: theme.spacing(1),
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
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible((v) => !(!value || value.length === 0))
    }, [value])
    return (
        <Paper className={classes.root} elevation={0}>
            {visible ? (
                <Typography variant="body2" className={classes.label}>
                    {label}
                </Typography>
            ) : null}
            <Paper className={classes.search} elevation={0}>
                <IconButton size="large" className={classes.iconButton} aria-label="label">
                    {children}
                </IconButton>

                <InputBase
                    className={classes.input}
                    placeholder={label}
                    value={value}
                    onChange={(e) => {
                        setVisible(e.target.value.length !== 0)
                        onChange?.(e.target.value)
                    }}
                    {...props.inputBaseProps}
                />
            </Paper>
        </Paper>
    )
}
