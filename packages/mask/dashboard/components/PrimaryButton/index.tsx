import { ActionButton, makeStyles } from '@masknet/theme'
import { buttonClasses, type ButtonProps } from '@mui/material/Button'
import { memo } from 'react'

interface ActionButtonProps extends ButtonProps {
    width?: number | string
    loading?: boolean
}

const useStyles = makeStyles()((theme) => ({
    // eslint-disable-next-line tss-unused-classes/unused-classes
    root: {
        backgroundColor: theme.vars.palette.maskColor.main,
        color: theme.vars.palette.maskColor.bottom,
        fontWeight: 700,
        fontSize: 16,
        lineHeight: '20px',
        ['&:hover']: {
            backgroundColor: theme.vars.palette.maskColor.main,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
        },
        [`&.${buttonClasses.disabled}`]: {
            background: theme.vars.palette.maskColor.primaryMain,
            opacity: 0.6,
            color: theme.vars.palette.maskColor.bottom,
        },
    },
}))

export const PrimaryButton = memo<ActionButtonProps>(function PrimaryButton(props) {
    const { width, loading, children, className, style, ...rest } = props
    const { classes } = useStyles(undefined, { props: { classes: rest.classes } })
    return (
        <ActionButton {...props} disabled={props.disabled || loading} classes={classes}>
            {children}
        </ActionButton>
    )
})
