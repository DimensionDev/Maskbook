import { Card } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            overflow: 'auto',
            backgroundColor: 'transparent',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            marginBottom: theme.spacing(1.5),
        },
    }
})

export interface TrendingCardProps extends withClasses<'root'> {
    children?: React.ReactNode
}

export function TrendingCard(props: TrendingCardProps) {
    const { children } = props
    const { classes } = useStyles(undefined, { props })
    return (
        <Card className={classes.root} elevation={0} component="article">
            {children}
        </Card>
    )
}
