import { Card, CardContent, type CardProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            height: '100%',
            borderRadius: 0,
            overflow: 'auto',
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        overContent: {
            backgroundColor: theme.palette.maskColor.white,
            boxSizing: 'border-box',
        },
    }
})

export interface CollectibleCardProps extends withClasses<'root' | 'content'> {
    children: React.ReactNode
    CardProps?: Partial<CardProps>
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { classes } = useStyles(undefined, { props })

    return (
        <Card className={classes.root} elevation={0} {...props.CardProps}>
            <CardContent className={classes.overContent}>{props.children}</CardContent>
        </Card>
    )
}
