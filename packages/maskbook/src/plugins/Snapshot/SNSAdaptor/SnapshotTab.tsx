import { Card, CardContent } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
        },
        content: {
            padding: `${theme.spacing(2)} !important`,
        },
    }
})

export interface SnapshotTabProps {
    children: React.ReactNode
}

export function SnapshotTab(props: SnapshotTabProps) {
    const { classes } = useStyles()
    return (
        <Card className={classes.root} elevation={0}>
            <CardContent className={classes.content}>{props.children}</CardContent>
        </Card>
    )
}
