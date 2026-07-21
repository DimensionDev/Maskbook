import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography, Card, ButtonBase, type ButtonBaseProps, type CardProps } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    card: {
        textAlign: 'center',
        border: `solid 1px ${theme.vars.palette.maskColor.line}`,
        borderRadius: 8,
    },
    button: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        color: theme.vars.palette.text.secondary,
        padding: theme.spacing(1.5),
        transition: 'all ease 0.3s',
        '&:hover': {
            background: theme.vars.palette.maskColor.bg,
            color: theme.vars.palette.text.primary,
        },
    },
    icon: {
        width: 36,
        height: 36,
    },
    name: {
        flexGrow: 1,
        fontSize: 14,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        textAlign: 'left',
        margin: theme.spacing(0, 'auto', 0, 1),
    },
}))

export interface ProviderIconProps extends CardProps {
    icon: string
    name: React.ReactNode
    iconFilterColor?: string
    ButtonBaseProps?: Partial<ButtonBaseProps>
}

export function ProviderItem({ icon, name, iconFilterColor, className, ButtonBaseProps, ...rest }: ProviderIconProps) {
    const { classes, cx, theme } = useStyles()
    const style =
        iconFilterColor ? { filter: `drop-shadow(0px 6px 12px ${iconFilterColor})`, backdropFilter: 'blur(16px)' } : {}
    return (
        <Card className={cx(classes.card, className)} elevation={0} {...rest}>
            <ButtonBase className={`${classes.button} dashboard-style`} {...ButtonBaseProps}>
                <img src={icon} className={classes.icon} style={style} />
                <Typography className={classes.name}>{name}</Typography>
                <Icons.RightArrow size={20} color={theme.vars.palette.maskColor.second} />
            </ButtonBase>
        </Card>
    )
}
