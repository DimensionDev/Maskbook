import { makeStyles, createStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import { Card } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { PluginMetaData, PluginScope } from '../../../plugins/types'

interface Props {
    plugin: PluginMetaData
}

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(3, 3, 3, 3),
            boxShadow:
                theme.palette.mode === 'dark'
                    ? 'none'
                    : '0px 2px 4px rgba(96, 97, 112, 0.16), 0px 0px 1px rgba(40, 41, 61, 0.04)',

            [theme.breakpoints.down('sm')]: {
                width: '100%',
                marginRight: 0,
                marginBottom: theme.spacing(1),
            },
        },
        info: {
            flexGrow: 1,
            display: 'flex',
        },
        actions: {
            display: 'flex',
            marginTop: theme.spacing(1),
        },
        logoWraper: {
            alignSelf: 'flex-start',
            flexShrink: 0,
        },
        logo: {
            width: 36,
            height: 36,
            fontSize: 30,
        },
        metas: {
            marginTop: 0,
            marginBottom: 0,
            marginLeft: theme.spacing(3),
        },
        meta: {
            margin: 0,
            marginBottom: theme.spacing(1),
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing(3),
        },
        title: {
            flex: '1 1 auto',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all',
            whiteSpace: 'nowrap',
            fontWeight: 500,
        },
        switch: {
            marginLeft: 'auto',
        },
    }),
)

export default function PluginCard({ plugin }: Props) {
    const { t } = useI18N()
    const classes = useStyles()

    return (
        <Card className={classes.card} elevation={2}>
            <div className={classes.info}>
                <div className={classes.logoWraper}>
                    <span className={classes.logo}>{plugin.logo}</span>
                </div>
                <dl className={classes.metas}>
                    <dt className={classes.meta}>
                        <Typography className={classes.title} variant="h5" component="h3" color="textPrimary">
                            {plugin.pluginName}
                        </Typography>
                    </dt>
                    <dd className={classes.meta}>
                        <Typography color="textSecondary">ID: {plugin.ID}</Typography>
                    </dd>
                    <dd className={classes.meta}>
                        <Typography color="textSecondary">{plugin.description}</Typography>
                    </dd>
                    <dd className={classes.meta}>
                        <Typography color="textSecondary">version: {plugin.version}</Typography>
                    </dd>
                    <dd className={classes.meta}>
                        <Typography color="textSecondary">
                            scope: {plugin.scope === PluginScope.Public ? t('public') : t('internal')}
                        </Typography>
                    </dd>
                </dl>
            </div>
            <div className={classes.actions}>
                <Button variant="outlined" onClick={openPluginDetail}>
                    {t('details')}
                </Button>
                <Switch
                    className={classes.switch}
                    color="primary"
                    inputProps={{ 'aria-label': t('eanble_or_disable_plugin') }}
                />
            </div>
        </Card>
    )
}
