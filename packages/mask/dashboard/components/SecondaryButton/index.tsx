import { ActionButton, makeStyles } from '@masknet/theme'
import { buttonClasses, type ButtonProps } from '@mui/material/Button'

interface ActionButtonProps extends ButtonProps {
    width?: number | string
    loading?: boolean
}

const useStyles = makeStyles()((theme) => ({
    // eslint-disable-next-line tss-unused-classes/unused-classes
    root: {
        backgroundColor: theme.palette.maskColor.thirdMain,
        color: theme.palette.maskColor.main,
        border: 'none!important',
        fontWeight: 700,
        ['&:hover']: {
            background: theme.palette.maskColor.bottom,
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
            border: 'none',
        },
        [`&.${buttonClasses.disabled}`]: {
            color: theme.palette.maskColor.main,
            background: theme.palette.maskColor.thirdMain,
            opacity: 0.4,
        },
    },
}))

export function SecondaryButton<T extends React.ComponentType<any> = React.ComponentType>(
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
