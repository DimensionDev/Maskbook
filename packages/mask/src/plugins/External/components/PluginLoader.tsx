import {
    TextField,
    Button,
    SnackbarContent,
    Typography,
    Autocomplete,
    Box,
    Link,
    Skeleton,
    Alert,
    AlertTitle,
    CircularProgress,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    Stack,
    ListItemText,
} from '@mui/material'
import { useState } from 'react'
import { Result } from 'ts-results'
import { PermissionAwareRedirectOf } from '../../../extension/popups'
import Services from '../../../extension/service'
import { useExternalPluginManifest } from '../loader'
import { createThirdPartyPopupContext } from '../sns-context'
import { Link as LinkIcon, Person as PublisherIcon, Description as DescriptionIcon } from '@mui/icons-material'
import { useI18N } from '../../../utils'
import { Trans } from 'react-i18next'

export function PluginLoader() {
    const [input, setInput] = useState(
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:4242/'
            : 'https://dimensiondev.github.io/Mask-Plugin-Example/',
    )
    const [url, setURL] = useState<null | string>(null)
    const invalidURL = Result.wrap(() => new URL(input)).err
    const { t } = useI18N()

    return (
        <Stack sx={{ minHeight: 400 }} spacing={2}>
            <Alert severity="warning">
                <AlertTitle>{t('plugin_external_loader_alert_title')}</AlertTitle>
                <Typography variant="body1">{t('plugin_external_loader_intro')}</Typography>
                <Typography variant="body1">
                    <Trans
                        i18nKey="plugin_external_loader_example_github"
                        components={{
                            terms: <Link target="_blank" href="https://github.com/DimensionDev/Mask-Plugin-Example" />,
                        }}
                    />
                </Typography>
                <Typography variant="body1">{t('plugin_external_loader_alert')}</Typography>
            </Alert>
            {url ? <Loader url={url} /> : null}
            <article>
                <Typography variant="h6">{t('plugin_external_loader_search_holder')}</Typography>
                <Typography variant="body1">{t('plugin_external_loader_search_sub_title')}</Typography>
            </article>
            <Autocomplete
                disablePortal
                options={['http://localhost:4242/', 'https://dimensiondev.github.io/Mask-Plugin-Example/']}
                freeSolo
                value={input}
                inputValue={input}
                onInputChange={(_, val) => setInput(val)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        fullWidth
                        label="Plugin URL"
                        variant="standard"
                        error={invalidURL}
                        helperText={invalidURL ? 'URL seems invalid' : undefined}
                    />
                )}
            />
            <Box sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                <Button variant="contained" disabled={invalidURL} onClick={() => setURL(input)}>
                    {t('plugin_external_loader_search_button')}
                </Button>
            </Box>
        </Stack>
    )
}

function Loader(props: { url: string }) {
    const { t } = useI18N()
    const { loading, retry, error, value } = useExternalPluginManifest(props.url)
    if (error) return <SnackbarContent message={'Failed to load the plugin from ' + props.url} />
    const contribution = value?.contribution?.composition
    const skeleton = <Skeleton variant="text" sx={{ display: 'inline-block' }} width={150} />
    const manifestURL = `${props.url}mask-manifest.json`

    return (
        <Box>
            <Typography variant="h6">
                {loading ? <CircularProgress sx={{ marginRight: 1 }} size={16} /> : null}
                {t('plugin_external_name')}: {loading ? skeleton : value?.name ?? 'Unknown name'}
            </Typography>
            <List dense>
                <ListItem secondaryAction={<Button onClick={retry}>{t('reload')}</Button>}>
                    <ListItemAvatar>
                        <Avatar>
                            <LinkIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary="Plugin Manifest"
                        secondary={
                            <Link target="_blank" href={manifestURL}>
                                {manifestURL}
                            </Link>
                        }
                    />
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>
                            <PublisherIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Publisher" secondary={loading ? skeleton : value?.publisher ?? ''} />
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>
                            <DescriptionIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Description" secondary={loading ? skeleton : value?.description ?? ''} />
                </ListItem>
            </List>
            <Box sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                {contribution ? (
                    <Button
                        variant="contained"
                        onClick={() => {
                            Services.ThirdPartyPlugin.openPluginPopup(
                                PermissionAwareRedirectOf(
                                    new URL(contribution.href, props.url).toString(),
                                    createThirdPartyPopupContext(),
                                ),
                            )
                        }}>
                        {t('plugin_external_get_started')}
                    </Button>
                ) : null}
            </Box>
        </Box>
    )
}
