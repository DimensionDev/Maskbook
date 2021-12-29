import { makeStyles } from '@masknet/theme'
import { Typography, Card, ButtonBase, ButtonBaseProps } from '@mui/material'

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
        padding: theme.spacing(4, 1),
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

export interface ProviderIconProps {
    icon: URL
    name: React.ReactNode
    onClick?: () => void
    ButtonBaseProps?: Partial<ButtonBaseProps>
}

export function ProviderIcon({ icon, name, onClick, ButtonBaseProps }: ProviderIconProps) {
    const { classes } = useStyles()
    return (
        <Card className={classes.root} elevation={0} onClick={onClick}>
            <ButtonBase className={`${classes.content} dashboard-style`} {...ButtonBaseProps}>
                <img src={icon.toString()} className={classes.icon} />
                <Typography className={classes.name} variant="h3">
                    {name}
                </Typography>
            </ButtonBase>
        </Card>
    )
}
