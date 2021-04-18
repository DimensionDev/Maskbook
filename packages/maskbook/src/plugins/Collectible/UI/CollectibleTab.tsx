import { makeStyles, createStyles, Card, CardContent, CardProps } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            width: '100%',
            height: '100%',
            borderRadius: 0,
            borderStyle: 'none',
            borderBottomStyle: 'solid',
        },
        content: {},
    })
})

export interface CollectibleTabProps extends withClasses<'root' | 'content'> {
    children: React.ReactNode
    CardProps?: Partial<CardProps>
}

export function CollectibleTab(props: CollectibleTabProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.root} elevation={0} variant="outlined" {...props.CardProps}>
            <CardContent className={classes.content}>{props.children}</CardContent>
        </Card>
    )
}
