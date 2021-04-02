import { Card, createStyles, makeStyles, CardContent, CardHeader, Paper, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            marginBottom: theme.spacing(2),
            '&:last-child': {
                marginBottom: 0,
            },
        },
        header: {
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        content: {},
        title: {},
    })
})

export interface SnapshotCardProps {
    title: string
    children?: React.ReactNode
}

export function SnapshotCard(props: SnapshotCardProps) {
    const { title, children } = props

    const { t } = useI18N()
    const classes = useStyles()

    return (
        <Card className={classes.root} variant="outlined">
            <CardHeader
                className={classes.header}
                title={<Typography className={classes.title}>{title}</Typography>}></CardHeader>
            <CardContent className={classes.content}>{children}</CardContent>
        </Card>
    )
}
