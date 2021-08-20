import { makeStyles } from '@masknet/theme'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import { Card } from '@material-ui/core'
import { Flags, useI18N } from '../../../utils'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardPluginDetailDialog } from '../DashboardDialogs/Plugin'

export interface PluginCardProps {
    id: string
    name: string
    icon: React.ReactNode
    description?: string
    enabled: boolean
    onSwitch(): void
    canDisable: boolean
}

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(2, 3),
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
        marginTop: theme.spacing(2),
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
}))

export default function PluginCard({ id, name, icon, description, enabled, onSwitch, canDisable }: PluginCardProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [pluginDetail, openPluginDetail] = useModal(DashboardPluginDetailDialog, {
        id,
        name,
        icon,
        description,
    })

    return (
        <Card className={classes.card} elevation={2}>
            <div className={classes.info}>
                <div className={classes.logoWraper}>
                    <span className={classes.logo}>{icon}</span>
                </div>
                <dl className={classes.metas}>
                    <dt className={classes.meta}>
                        <Typography className={classes.title} variant="h5" component="h3" color="textPrimary">
                            {name}
                        </Typography>
                    </dt>
                    <dd className={classes.meta}>
                        <Typography color="textSecondary" variant="body2">
                            {description}
                        </Typography>
                    </dd>
                    <dd className={classes.meta}>
                        <Typography color="textSecondary" variant="body2">
                            ID: {id}
                        </Typography>
                    </dd>
                </dl>
            </div>
            <div className={classes.actions}>
                <Button variant="outlined" size="small" onClick={openPluginDetail}>
                    {t('details')}
                </Button>
                {Flags.plugin_switch_enabled && canDisable ? (
                    <Switch
                        className={classes.switch}
                        color="primary"
                        size="small"
                        inputProps={{ 'aria-label': t('enable_or_disable_plugin') }}
                        checked={enabled}
                        onChange={() => onSwitch()}
                    />
                ) : null}
            </div>
            {pluginDetail}
        </Card>
    )
}
