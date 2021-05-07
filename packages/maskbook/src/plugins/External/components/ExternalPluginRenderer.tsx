import type { ExternalPluginLoadDetails, Manifest } from '../types'
import { Card, CardHeader, CardContent, Typography, Link, Button } from '@material-ui/core'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { MaskExternalPluginPreviewRenderer, setHostConfig } from '@dimensiondev/external-plugin-previewer'
import { PermissionAwareRedirectOf } from '../../../extension/popups'

setHostConfig({
    permissionAwareOpen(url) {
        Services.Helper.openDialogPopup(PermissionAwareRedirectOf(url))
    },
})

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
    const parser = new DOMParser()
    const dom = parser.parseFromString(text, 'text/html').querySelector('template')?.innerHTML
    if (!dom) return null
    const template = parser.parseFromString(dom, 'text/html').querySelector('body')?.childNodes
    if (!template) return null
    console.log(htmlToTemplate(template))
    return htmlToTemplate(template)
}

const indentLevel = 2
function htmlToTemplate(top: NodeListOf<ChildNode>) {
    function* text(indent: number, text: Text) {
        for (const line of text.textContent?.split('\n') || '') {
            yield `${getIndent(indent)}. ${line}`
        }
    }
    function* html(indent: number, node: HTMLElement): Generator<string> {
        yield `${getIndent(indent)}>${node.tagName.toLowerCase()}`
        for (const attr of node.attributes) {
            yield `${getIndent(indent + indentLevel)}%${attr.name} = ${attr.value}`
        }
        yield* convertList(indent + indentLevel, node.childNodes)
    }
    function* convertList(indent: number, nodes: NodeListOf<ChildNode>): Generator<string> {
        for (const node of nodes) {
            if (isText(node)) yield* text(indent, node)
            else if (node instanceof HTMLElement) yield* html(indent, node)
        }
    }
    function getIndent(x: number) {
        return ' '.repeat(x)
    }
    function isText(node: ChildNode): node is Text {
        return node.nodeType === document.TEXT_NODE
    }
    return [...convertList(0, top)].join('\n')
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
