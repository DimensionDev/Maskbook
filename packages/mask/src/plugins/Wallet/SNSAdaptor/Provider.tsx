import { Typography, Card, ButtonBase, ButtonBaseProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { getMaskColor } from '@masknet/theme'

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
        backgroundColor: getMaskColor(theme).twitterBackground,
    },
    logo: {
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

export interface ProviderProps
    extends withClasses<never | 'root' | 'dialog' | 'backdrop' | 'container' | 'paper' | 'content'> {
    logo: React.ReactNode
    name: React.ReactNode
    description?: React.ReactNode
    onClick?: () => void
    ButtonBaseProps?: Partial<ButtonBaseProps>
}

export function Provider(props: ProviderProps) {
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Card className={classes.root} elevation={0} onClick={props.onClick}>
            <ButtonBase className={`${classes.content} dashboard-style`} {...props.ButtonBaseProps}>
                <div className={classes.logo}>{props.logo}</div>
                <Typography className={classes.name} variant="h3">
                    {props.name}
                </Typography>
                {props.description && (
                    <Typography className={classes.description} color="textSecondary" variant="body2">
                        {props.description}
                    </Typography>
                )}
            </ButtonBase>
        </Card>
    )
}
