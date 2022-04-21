import classnames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { Typography, Card, ButtonBase, ButtonBaseProps, CardProps } from '@mui/material'

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
        backgroundColor: theme.palette.background.default,
    },
    icon: {
        width: 45,
        height: 45,
        marginBottom: theme.spacing(2),
    },
    name: {
        fontSize: 16,
        fontWeight: 'normal',
        whiteSpace: 'nowrap',
        marginBottom: theme.spacing(1),
    },
    description: {
        fontSize: 14,
        fontWeight: 300,
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
                <Typography className={classes.name} variant="h3">
                    {name}
                </Typography>
            </ButtonBase>
        </Card>
    )
}
