/// <reference types="./global.d.ts" />
import { create } from 'ef.js'
import { useContext, useEffect, useState } from 'react'
import './DOMImpl.js'
import { RenderContext } from './RenderContext.js'

export * from './RenderContext.js'

export function MaskExternalPluginPreviewRenderer({ pluginBase, payload, script, template, onError }: RenderData) {
    const [dom, setDOM] = useState<HTMLDivElement | null>(null)
    const context = useContext(RenderContext)

    useEffect(() => {
        if (!dom) return
        Reflect.set(dom, '__mask__context__', context)
    }, [dom, context])

    useEffect(() => {
        if (!dom) return
        dom.dataset.plugin = pluginBase
        // This is safe. ef template does not allow any form of dynamic code execute in the template.
        try {
            const RemoteContent = create(template)
            const instance = new RemoteContent({ $data: { payload } })
            instance.$mount({ target: dom })
            return () => instance.$destroy()
        } catch (error) {
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
    onError?(e: unknown): void
}
