import {
    SnackbarContent,
    Button,
    List,
    Checkbox,
    ListSubheader,
    ListItem,
    ListItemText,
    ListItemIcon,
    Card,
    CardContent,
    CardActions,
} from '@material-ui/core'
import { useMap } from 'react-use'
import type { ExternalPluginLoadDetails } from '../types'

export function UnknownPluginLoadRequestUI({ plugins, onConfirm }: UnknownPluginLoadRequestProps) {
    const [_selected, { get, set }] = useMap({} as Record<string, boolean>)

    const confirmAll = () => onConfirm(plugins)
    const selected = plugins.filter((x) => _selected[x.url])
    const confirmSelected = () => onConfirm(selected)

    if (plugins.length === 0) return null
    if (plugins.length === 1)
        return (
            <SnackbarContent
                message={`Do you want to load a new plugin from ${plugins[0].url}?`}
                action={<Button onClick={confirmAll}>Load</Button>}
            />
        )
    return (
        <Card variant="outlined">
            <CardContent sx={{ paddingBottom: 0 }}>
                <List
                    dense
                    subheader={
                        <ListSubheader>New unknown Mask plugins found. Do you want to load them?</ListSubheader>
                    }>
                    {plugins.map((x) => (
                        <ListItem dense button onClick={() => set(x.url, !get(x.url))} key={x.url}>
                            <ListItemIcon>
                                <Checkbox disableRipple edge="start" tabIndex={-1} checked={!!get(x.url)} />
                            </ListItemIcon>
                            <ListItemText primary={x.url} />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
            <CardActions disableSpacing sx={{ flexDirection: 'row-reverse' }}>
                <Button disabled={selected.length === 0} onClick={confirmSelected}>
                    Load
                </Button>
                <Button onClick={confirmAll}>Load All</Button>
            </CardActions>
        </Card>
    )
}

export interface UnknownPluginLoadRequestProps {
    plugins: ExternalPluginLoadDetails[]
    onConfirm(list: ExternalPluginLoadDetails[]): void
}
