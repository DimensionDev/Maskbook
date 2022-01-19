import type { Plugin } from '@masknet/plugin-infra'
import { forwardRef, useImperativeHandle } from 'react'
import { Ok, Err } from 'ts-results'

const metadataReader: Plugin.GeneralUI.MetadataRender.MetadataReader<unknown> = (meta) => {
    const raw = meta?.get('io.mask.example/v1')
    if (raw) return Ok(raw)
    return Err.EMPTY
}
const render: Plugin.GeneralUI.MetadataRender.StaticRenderComponent<unknown> = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({}), [])
    return <>Metadata render for key "io.mask.example/v1" {JSON.stringify(props.metadata)}</>
})

const contextFree: Plugin.GeneralUI.DefinitionDeferred = {
    metadataRender: new Map([[metadataReader, render]]),
}
export default contextFree
