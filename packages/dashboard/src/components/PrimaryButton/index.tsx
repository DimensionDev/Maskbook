import { ActionButton, makeStyles } from '@masknet/theme'
import { buttonClasses, type ButtonProps } from '@mui/material/Button'

export interface ActionButtonProps extends ButtonProps {
    width?: number | string
    loading?: boolean
}

const useStyles = makeStyles()((theme) => ({
    // eslint-disable-next-line tss-unused-classes/unused-classes
    root: {
        backgroundColor: theme.palette.maskColor.main,
        color: theme.palette.maskColor.bottom,
        fontWeight: 700,
        fontSize: 16,
        lineHeight: '20px',
        ['&:hover']: {
            backgroundColor: theme.palette.maskColor.main,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
        },
        [`&.${buttonClasses.disabled}`]: {
            background: theme.palette.maskColor.primaryMain,
            opacity: 0.6,
            color: theme.palette.background.paper,
        },
    },
}))

export function PrimaryButton<T extends React.ComponentType<any> = React.ComponentType>(
    props: ActionButtonProps & PropsOf<T>,
) {
    const { width, loading, children, className, style, ...rest } = props
    const { classes } = useStyles(undefined, { props: { classes: rest.classes } })
    return (
        <ActionButton {...props} classes={classes}>
            {children}
        </ActionButton>
    )
}
