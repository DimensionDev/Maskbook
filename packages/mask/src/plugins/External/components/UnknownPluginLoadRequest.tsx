import {
    SnackbarContent,
    Button,
    List,
    Checkbox,
    ListSubheader,
    ListItemText,
    ListItemIcon,
    Card,
    CardContent,
    CardActions,
} from '@mui/material'
import ListItemButton from '@mui/material/ListItemButton'
import { useMap } from 'react-use'
import { useI18N } from '../../../utils'
import type { ExternalPluginLoadDetails } from '../types'

export function UnknownPluginLoadRequestUI({ plugins, onConfirm }: UnknownPluginLoadRequestProps) {
    const [_selected, { get, set }] = useMap({} as Record<string, boolean>)

    const confirmAll = () => onConfirm(plugins)
    const selected = plugins.filter((x) => _selected[x.url])
    const confirmSelected = () => onConfirm(selected)

    const { t } = useI18N()

    if (plugins.length === 0) return null
    if (plugins.length === 1)
        return (
            <SnackbarContent
                message={`Do you want to load an external plugin from ${plugins[0].url}?`}
                action={<Button onClick={confirmAll}>Load</Button>}
            />
        )
    return (
        <Card variant="outlined">
            <CardContent sx={{ paddingBottom: 0 }}>
                <List dense subheader={<ListSubheader>{t('plugin_external_unknown_plugin')}</ListSubheader>}>
                    {plugins.map((x) => (
                        <ListItemButton dense onClick={() => set(x.url, !get(x.url))} key={x.url}>
                            <ListItemIcon>
                                <Checkbox disableRipple edge="start" tabIndex={-1} checked={!!get(x.url)} />
                            </ListItemIcon>
                            <ListItemText primary={x.url} />
                        </ListItemButton>
                    ))}
                </List>
            </CardContent>
            <CardActions disableSpacing sx={{ flexDirection: 'row-reverse' }}>
                <Button disabled={selected.length === 0} onClick={confirmSelected}>
                    {t('load')}
                </Button>
                <Button onClick={confirmAll}>{t('load_all')}</Button>
            </CardActions>
        </Card>
    )
}

export interface UnknownPluginLoadRequestProps {
    plugins: ExternalPluginLoadDetails[]
    onConfirm(list: ExternalPluginLoadDetails[]): void
}
