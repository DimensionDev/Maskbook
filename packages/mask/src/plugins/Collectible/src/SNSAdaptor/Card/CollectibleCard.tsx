import { Card, CardContent, CardProps } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            height: '100%',
            borderRadius: 0,
            overflow: 'auto',
        },
        overContent: {
            backgroundColor: theme.palette.maskColor.white,
        },
    }
})

export interface CollectibleCardProps extends withClasses<'root' | 'content'> {
    children: React.ReactNode
    CardProps?: Partial<CardProps>
}

export function CollectibleCard(props: CollectibleCardProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.root} elevation={0} {...props.CardProps}>
            <CardContent className={classes.overContent}>{props.children}</CardContent>
        </Card>
    )
}
