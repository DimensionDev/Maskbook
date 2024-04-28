import { makeStyles } from '@masknet/theme'
import { Typography, Card, ButtonBase, type ButtonBaseProps, type CardProps } from '@mui/material'

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
            background: theme.palette.maskColor.bg,
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
    },
}))

export interface ProviderIconProps extends CardProps {
    icon: string
    name: React.ReactNode
    iconFilterColor?: string
    ButtonBaseProps?: Partial<ButtonBaseProps>
}

export function ProviderIcon({ icon, name, iconFilterColor, className, ButtonBaseProps, ...rest }: ProviderIconProps) {
    const { classes, cx } = useStyles()
    return (
        <Card className={cx(classes.root, className)} elevation={0} {...rest}>
            <ButtonBase className={`${classes.content} dashboard-style`} {...ButtonBaseProps}>
                <img
                    src={icon}
                    className={classes.icon}
                    style={
                        iconFilterColor ?
                            { filter: `drop-shadow(0px 6px 12px ${iconFilterColor})`, backdropFilter: 'blur(16px)' }
                        :   {}
                    }
                />
                <Typography className={classes.name}>{name}</Typography>
            </ButtonBase>
        </Card>
    )
}
