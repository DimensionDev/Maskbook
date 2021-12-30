import { Card } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

export interface TrendingCardProps extends withClasses<'root'> {
    children?: React.ReactNode
}

export function TrendingCard(props: TrendingCardProps) {
    const { children } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Card className={classes.root} elevation={0} component="article">
            {children}
        </Card>
    )
}
