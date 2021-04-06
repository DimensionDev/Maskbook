import { makeStyles, createStyles, Card, CardContent } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            width: '100%',
            height: '100%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
        },
        content: {
            padding: `${theme.spacing(2)} !important`,
        },
    })
})

export interface CollectibleTabProps extends withClasses<'root' | 'content'> {
    children: React.ReactNode
}

export function CollectibleTab(props: CollectibleTabProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Card className={classes.root} elevation={0}>
            <CardContent className={classes.content}>{props.children}</CardContent>
        </Card>
    )
}
