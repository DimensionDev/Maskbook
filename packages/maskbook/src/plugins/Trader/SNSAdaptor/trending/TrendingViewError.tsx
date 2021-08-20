import { Typography, CardContent, Box } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { AlertCircle } from 'react-feather'
import { TrendingCard, TrendingCardProps } from './TrendingCard'

const useStyles = makeStyles()((theme) => ({
    content: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    placeholder: {
        padding: theme.spacing(18, 4),
    },
    icon: {
        width: theme.spacing(8),
        height: theme.spacing(8),
        marginBottom: theme.spacing(2),
        color: theme.palette.text.secondary,
    },
    message: {
        fontSize: 16,
    },
}))
export interface TrendingViewErrorProps {
    reaction?: React.ReactNode
    message: React.ReactNode
    TrendingCardProps?: Partial<TrendingCardProps>
}

export function TrendingViewError(props: TrendingViewErrorProps) {
    const { message, reaction, TrendingCardProps } = props
    const { classes } = useStyles()
    return (
        <TrendingCard {...TrendingCardProps}>
            <CardContent className={classes.content}>
                <Box
                    className={classes.placeholder}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <AlertCircle className={classes.icon} />
                    <Typography className={classes.message} color="textSecondary">
                        {message}
                    </Typography>
                    {!!reaction && <Box>{reaction}</Box>}
                </Box>
            </CardContent>
        </TrendingCard>
    )
}
