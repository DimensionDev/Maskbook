import type { TypedMessage } from '@masknet/typed-message'
import { type Result, Ok, Err, Some, type Option, None } from 'ts-results-es'
import type { ReactNode } from 'react'
import z_schema from 'z-schema'
import { produce, enableMapSet, type Draft } from 'immer'

const metadataSchemaStore = new Map<string, object>()
export function getKnownMetadataKeys() {
    return [...metadataSchemaStore.keys()]
}

export function getMetadataSchema(key: string): Option<object> {
    return metadataSchemaStore.has(key) ? Some(metadataSchemaStore.get(key)!) : None
}

/**
 * Register your metadata with a JSON Schema so we can validate the schema for you.
 * @param key Metadata key
 * @param jsonSchema JSON Schema to validate the metadata
 */
export function registerMetadataSchema(key: string, jsonSchema: object) {
    metadataSchemaStore.set(key, jsonSchema)
}

/**
 * Create a TypedMessage metadata reader for your plugin
 * @param key Metadata key
 * @param jsonSchema JSON Schema to validate the metadata
 * @example
 * export const getFilePluginMetadata = createTypedMessageMetadataReader('plugin.meta.key', schema)
 * getFilePluginMetadata(meta)
 */
export function createTypedMessageMetadataReader<T>(key: string, jsonSchema?: object) {
    if (jsonSchema) registerMetadataSchema(key, jsonSchema)
    return (meta: TypedMessage['meta']) => readTypedMessageMetadataUntyped<T>(meta, key)
}

/**
 * The raw parser of metadata reader
 * @param meta Metadata object
 * @param key Metadata key
 * @param jsonSchema JSON Schema to validate the metadata
 */
export function readTypedMessageMetadataUntyped<T>(
    meta: TypedMessage['meta'],
    key: string,
    jsonSchema?: object,
): Result<T, void> {
    if (!meta) return Err.EMPTY
    if (!meta.has(key)) return Err.EMPTY
    if (metadataSchemaStore.has(key) && !jsonSchema) jsonSchema = metadataSchemaStore.get(key)!
    const data = meta.get(key)! as T
    if (!jsonSchema) console.warn('You should add a JSON Schema to verify the metadata in the TypedMessage')
    else {
        const match = isDataMatchJSONSchema(data, jsonSchema)
        if (match.isErr()) {
            console.warn('The problematic metadata is dropped', data, 'errors:', match.error)
            return Err.EMPTY
        }
    }
    return Ok(data)
}

export function isDataMatchJSONSchema(data: any, jsonSchema: object) {
    const validator = new z_schema({})
    if (!validator.validate(data, jsonSchema)) return Err(validator.getLastErrors())
    return Ok.EMPTY
}

/**
 * Create a render of Metadata.
 * @param metadataReader A metadata reader (can be return value of createTypedMessageMetadataReader)
 */
export function createRenderWithMetadata<T>(metadataReader: (meta: TypedMessage['meta']) => Result<T, void>) {
    return (metadata: TypedMessage['meta'], render: (data: T) => ReactNode | null): ReactNode | null => {
        const message = metadataReader(metadata)
        if (message.isOk()) return render(message.value)
        return null
    }
}

let immer_setup = false
export function editTypedMessageMeta<T extends TypedMessage>(
    typedMessage: T,
    edit: (meta: NonNullable<Draft<TypedMessage['meta']>>) => void,
): T {
    if (!immer_setup) {
        enableMapSet()
        immer_setup = true
    }
    return produce(typedMessage, (e) => {
        if (!e.meta) e.meta = new Map()
        edit(e.meta)
        if (e.meta.size === 0) e.meta = undefined
    })
}

/**
 * Render with metadata
 * @param metadata Metadata
 * @param key Metadata key
 * @param render The render
 * @param jsonSchema JSON Schema to validate the metadata
 */
export function renderWithMetadataUntyped(
    metadata: TypedMessage['meta'],
    key: string,
    render: (data: unknown) => ReactNode,
    jsonSchema?: object,
): ReactNode | null {
    const message = readTypedMessageMetadataUntyped(metadata, key, jsonSchema)
    if (message.isOk()) return render(message.value)
    return null
}
