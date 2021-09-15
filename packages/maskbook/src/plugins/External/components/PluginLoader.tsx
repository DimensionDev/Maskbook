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

export function PluginLoader() {
    const [input, setInput] = useState(
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:4242/'
            : 'https://dimensiondev.github.io/Mask-Plugin-Example/',
    )
    const [url, setURL] = useState<null | string>(null)
    const invalidURL = Result.wrap(() => new URL(input)).err
    return (
        <Stack sx={{ minHeight: 400 }} spacing={2}>
            <Alert severity="warning">
                <AlertTitle>External plugin: an experimental Mask Network feature!</AlertTitle>
                <Typography variant="body1">
                    Mask External plugin is an early stage feature of Mask Network that allows anyone to develop an
                    external Mask plugin.
                </Typography>
                <Typography variant="body1">
                    An official plugin example can be found at{' '}
                    <Link target="_blank" href="https://github.com/DimensionDev/Mask-Plugin-Example">
                        GitHub
                    </Link>
                    .
                </Typography>
                <Typography variant="body1">IT WILL CHANGE. DO NOT BUILD OFFICIAL PRODUCT ON IT.</Typography>
            </Alert>
            <article>
                <Typography variant="h6">Load an external plugin</Typography>
                <Typography variant="body1">Every external plugin has to hosted on an URL.</Typography>
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
                    Search for plugin
                </Button>
            </Box>
            {url ? <Loader url={url} /> : null}
        </Stack>
    )
}

function Loader(props: { url: string }) {
    const { loading, retry, error, value } = useExternalPluginManifest(props.url)
    if (error) return <SnackbarContent message={'Failed to load the plugin from ' + props.url} />
    const contribution = value?.contribution?.composition
    const skeleton = <Skeleton variant="text" sx={{ display: 'inline-block' }} width={150} />
    const manifestURL = `${props.url}mask-manifest.json`
    return (
        <Box>
            <Typography variant="h6">
                {loading ? <CircularProgress sx={{ marginRight: 1 }} size={16} /> : null}External plugin:{' '}
                {loading ? skeleton : value?.name ?? 'Unknown name'}
            </Typography>
            <List dense>
                <ListItem secondaryAction={<Button onClick={retry}>Reload</Button>}>
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
                        Let's get started
                    </Button>
                ) : null}
            </Box>
        </Box>
    )
}
