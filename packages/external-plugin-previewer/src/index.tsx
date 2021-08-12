export { setHostConfig } from './host'
export type { HostConfig } from './host'
/// <reference path="./global.d.ts" />
import { useEffect, useState } from 'react'
import { create } from 'ef.js'
import './DOMImpl'
export function MaskExternalPluginPreviewRenderer({ pluginBase, payload, script, template, onError }: RenderData) {
    const [dom, setDOM] = useState<HTMLDivElement | null>(null)
    useEffect(() => {
        if (!dom) return
        dom.dataset.plugin = pluginBase
        // This is safe. ef template does not allow any form of dynamic code execute in the template.
        try {
            const RemoteContent = create(template)
            const instance = new RemoteContent({ $data: { payload } })
            instance.$mount({ target: dom })
            return () => instance.$destroy()
        } catch (error: any) {
            onError?.(error)
        }
        return
    }, [dom, onError, payload, template, pluginBase])
    return <div ref={(ref) => setDOM(ref)} />
}
export interface RenderData {
    pluginBase: string
    template: string
    /** Currently not supported */
    script: string
    payload: unknown
    onError?(e: Error): void
}
