import { makeStyles } from '@masknet/theme'
import { Typography, Card, ButtonBase, ButtonBaseProps, CardProps } from '@mui/material'
import classnames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    root: {
        textAlign: 'center',
    },
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(1),
        '&:hover': {
            background: theme.palette.background.default,
            '& p': {
                fontWeight: 700,
                color: theme.palette.text.primary,
            },
        },
    },
    icon: {
        width: 36,
        height: 36,
        marginBottom: 4,
    },
    name: {
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        marginBottom: theme.spacing(1),
        color: theme.palette.text.secondary,
    },
}))

export interface ProviderIconProps extends CardProps {
    icon: URL
    name: React.ReactNode
    ButtonBaseProps?: Partial<ButtonBaseProps>
}

export function ProviderIcon({ icon, name, onClick, className, ButtonBaseProps }: ProviderIconProps) {
    const { classes } = useStyles()
    return (
        <Card className={classnames(classes.root, className)} elevation={0} onClick={onClick}>
            <ButtonBase className={`${classes.content} dashboard-style`} {...ButtonBaseProps}>
                <img src={icon.toString()} className={classes.icon} />
                <Typography className={classes.name}>{name}</Typography>
            </ButtonBase>
        </Card>
    )
}
