import { Card, createStyles, makeStyles, CardContent, CardHeader, Paper, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            margin: '16px auto',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
            minHeight: 320,
            '&:last-child': {
                marginBottom: 0,
            },
        },
        header: {
            backgroundColor: theme.palette.mode === 'dark' ? '#24292e' : 'white',
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: '12px 16px',
        },
        content: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
        },
        title: {
            paddingLeft: theme.spacing(1),
            fontSize: 20,
        },
    })
})

export interface SnapshotCardProps {
    title: (JSX.Element & React.ReactNode) | string
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
