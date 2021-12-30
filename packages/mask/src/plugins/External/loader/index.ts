import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import type { Manifest } from '../types'

// TODO: support suspense
export function useExternalPluginManifest(url: string) {
    return useAsyncRetry(() => Services.ThirdPartyPlugin.fetchManifest(url), [url])
}

export function useExternalPluginTemplate(url: string, manifest: Manifest | undefined, metaKey: string) {
    const target = manifest?.metadata?.[metaKey]
    // TODO: the final URL must inside/same directory of the manifest
    const u = target ? new URL(target.preview, url).toString() : null
    return useAsyncRetry(() => fetchTemplate(u), [u])
}

// TODO: support suspense, cache
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
