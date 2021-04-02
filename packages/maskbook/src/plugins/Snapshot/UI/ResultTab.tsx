import { Card, createStyles, makeStyles, CardContent, CardHeader, Box } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'

export interface ResultTabProps {}

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            margin: '16px auto',
            width: '80%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
            height: 320,
        },
        content: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
        },
        header: {
            backgroundColor: theme.palette.mode === 'dark' ? '#24292e' : 'white',
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: '12px 16px',
        },
        title: {
            paddingLeft: theme.spacing(1),
            fontSize: 20,
        },
    })
})

export function ResultTab(props: ResultTabProps) {
    const classes = useStyles()
    const { t } = useI18N()
    return (
        <Card className={classes.root} elevation={0}>
            <CardHeader
                className={classes.header}
                title={<Box className={classes.title}>{t('plugin_snapshot_result_title')}</Box>}></CardHeader>
            <CardContent className={classes.content}>123</CardContent>
        </Card>
    )
}
