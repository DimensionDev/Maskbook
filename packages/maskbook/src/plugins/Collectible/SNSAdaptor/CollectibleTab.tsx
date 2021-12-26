import { Card, CardContent, CardProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()({
    root: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        overflow: 'auto',
    },
})

export interface CollectibleTabProps extends withClasses<'root' | 'content'> {
    children: React.ReactNode
    CardProps?: Partial<CardProps>
}

export function CollectibleTab(props: CollectibleTabProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.root} elevation={0} {...props.CardProps}>
            <CardContent className={classes.content}>{props.children}</CardContent>
        </Card>
    )
}
