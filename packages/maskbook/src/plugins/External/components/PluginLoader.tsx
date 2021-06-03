import { TextField, Button, LinearProgress, SnackbarContent, Card, CardContent, Typography } from '@material-ui/core'
import { useState } from 'react'
import { Result } from 'ts-results'
import { PermissionAwareRedirectOf } from '../../../extension/popups'
import Services from '../../../extension/service'
import { useExternalPluginManifest } from '../loader'
import { createThirdPartyPopupContext } from '../popup-context'

export function PluginLoader() {
    const [input, setInput] = useState(
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:4242/'
            : 'http://dimensiondev.github.io/Mask-Plugin-Example/',
    )
    const [url, setURL] = useState<null | string>(null)
    const invalidURL = Result.wrap(() => new URL(input)).err
    return (
        <>
            <TextField
                label="URL of the plugin"
                fullWidth
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                error={invalidURL}
                helperText={invalidURL ? 'URL seems invalid' : undefined}
            />
            <Button disabled={invalidURL} onClick={() => setURL(input)}>
                Load plugin
            </Button>
            {url ? <Loader url={url} /> : null}
        </>
    )
}

function Loader(props: { url: string }) {
    const load = useExternalPluginManifest(props.url)
    if (load.loading) return <LinearProgress variant="indeterminate" />
    if (load.error || !load.value) return <SnackbarContent message={'Failed to load the plugin from ' + props.url} />
    const contribution = load.value.contribution?.composition
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">External plugin: {load.value.name}</Typography>
                <Typography variant="body1">Description: {load.value.description}</Typography>
                <Typography variant="body1">Publisher: {load.value.publisher}</Typography>

                {contribution ? (
                    <Button
                        onClick={() => {
                            Services.ThirdPartyPlugin.openPluginPopup(
                                PermissionAwareRedirectOf(
                                    new URL(contribution.href, props.url).toString(),
                                    createThirdPartyPopupContext(),
                                ),
                            )
                        }}>
                        始まるよ～
                    </Button>
                ) : null}
            </CardContent>
        </Card>
    )
}
