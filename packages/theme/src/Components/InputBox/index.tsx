import { IconButton, InputBase, InputBaseProps, Paper, PaperProps, Typography } from '@material-ui/core'
import classnames from 'classnames'
import { useState, useEffect } from 'react'
import { getMaskColor } from '../../constants'
import { makeStyles } from '../../makeStyles'

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

export interface InputBoxProps extends Omit<PaperProps, 'onChange'> {
    label: string
    onChange?: (keyword: string) => void
    children?: React.ReactElement
    value?: string
    inputBaseProps?: Partial<InputBaseProps>
}
export function InputBox(props: InputBoxProps) {
    const { label, children, onChange, value, inputBaseProps, className, ...rest } = props
    const { classes } = useStyles()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible((v) => !(!value || value.length === 0))
    }, [value])
    return (
        <Paper className={classnames(classes.root, className)} elevation={0} {...rest}>
            {visible ? (
                <Typography variant="body2" className={classes.label}>
                    {label}
                </Typography>
            ) : null}
            <Paper component="form" className={classes.search} elevation={0}>
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
                    {...inputBaseProps}
                />
            </Paper>
        </Paper>
    )
}
