import type { ExternalPluginLoadDetails, Manifest } from '../types'
import { Card, CardHeader, CardContent, Typography, CardActions, Link } from '@material-ui/core'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
export function ExternalPluginRenderer(props: ExternalPluginLoadDetails) {
    const manifest = useExternalPluginManifest(props.url)
    if (!manifest) return null
    return (
        <Card sx={{ border: '1px solid red' }}>
            <CardHeader
                title={`Mask plugin (3rd party): ${manifest.name}`}
                subheader={
                    <>
                        <Typography variant="caption">
                            Publisher: {manifest.publisher} (⚠ Unverified)
                            <br />
                            Plugin URL: <Link href={props.url}>{props.url}</Link>
                        </Typography>
                    </>
                }
            />
            <CardContent style={{ background: 'red', height: 200 }}>Plugin render area</CardContent>
            <CardActions disableSpacing></CardActions>
        </Card>
    )
}

// TODO: support suspense
function useExternalPluginManifest(url: string): Manifest | undefined {
    const { value } = useAsync(() => fetchManifest(url), [url])
    return value
}

async function fetchManifest(addr: string) {
    const blob = await Services.Helper.fetch(addr + 'mask-manifest.json')
    const json = await blob.text().then(JSONC)
    // TODO: verify manifest
    return JSON.parse(json)
}

function JSONC(x: string) {
    return x
        .split('\n')
        .filter((x) => !x.match(/^ +\/\//))
        .join('\n')
}
