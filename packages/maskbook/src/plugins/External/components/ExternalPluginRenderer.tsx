import type { ExternalPluginLoadDetails, Manifest } from '../types'
import { Card, CardHeader, CardContent, Typography, Link, Button } from '@material-ui/core'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { MaskExternalPluginPreviewRenderer } from '@dimensiondev/external-plugin-previewer'

export function ExternalPluginRenderer(props: ExternalPluginLoadDetails) {
    const manifest = useExternalPluginManifest(props.url)
    const template = useExternalPluginTemplate(props.url, manifest.value, props.metaKey)
    const retry = (
        <Button
            onClick={() => {
                manifest.retry()
                template.retry()
            }}
            children="Retry"
        />
    )
    if (!manifest.value || !template.value) return retry
    console.log(props.meta, template.value)
    return (
        <Card sx={{ border: '1px solid red' }}>
            <CardHeader
                title={`Mask plugin (3rd party): ${manifest.value.name}`}
                subheader={
                    <>
                        <Typography variant="caption">
                            Publisher: {manifest.value.publisher} (⚠ Unverified)
                            <br />
                            Plugin URL: <Link href={props.url}>{props.url}</Link>
                            {retry}
                        </Typography>
                    </>
                }
            />
            <CardContent style={{ background: 'red', height: 200 }}>
                <MaskExternalPluginPreviewRenderer
                    onError={console.warn}
                    script=""
                    payload={props.meta}
                    template={template.value}
                />
            </CardContent>
        </Card>
    )
}

// TODO: support suspense
function useExternalPluginManifest(url: string) {
    return useAsyncRetry(() => fetchManifest(url), [url])
}

function useExternalPluginTemplate(url: string, manifest: Manifest | undefined, metaKey: string) {
    const target = manifest?.metadata[metaKey]
    // TODO: the final URL must inside/same directory of the manifest
    const u = target ? new URL(target.preview, url).toString() : null
    return useAsyncRetry(() => fetchTemplate(u), [u])
}

// TODO: support suspense
// TODO: cache
async function fetchTemplate(url: string | null) {
    if (!url) return
    const blob = await Services.Helper.fetch(url)
    const text = await blob.text()
    const dom = new DOMParser().parseFromString(text, 'text/html')
    const template = dom.querySelector('template')
    if (!template) return null
    // @ts-ignore Property 'replaceAll' does not exist on type 'string'. Do you need to change your target library? Try changing the `lib` compiler option to 'es2021' or later.ts(2550)
    return template.innerHTML.replaceAll('&gt;', '>')
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
