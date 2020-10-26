import { Result, Ok, Err } from 'ts-results'
import type { TypedMessage } from './types'
import z_schema from 'z-schema'

const metadataSchemaStore = new Map<string, object>()
/**
 * Register your metadata with a JSON Schema so Maskbook can validate the schema for you.
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
        const validator = new z_schema({})
        if (!validator.validate(data, jsonSchema)) {
            console.warn('The problematic metadata is dropped', data, 'errors:', validator.getLastErrors())
            return Err.EMPTY
        }
    }
    return Ok(data)
}

/**
 * Create a render of Metadata.
 * @param metadataReader A metadata reader (can be return value of createTypedMessageMetadataReader)
 */
export function createRenderWithMetadata<T>(metadataReader: (meta: TypedMessage['meta']) => Result<T, void>) {
    return (metadata: TypedMessage['meta'], render: (data: T) => React.ReactNode): React.ReactNode | null => {
        const message = metadataReader(metadata)
        if (message.ok) return render(message.val)
        return null
    }
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
    render: (data: unknown) => React.ReactNode,
    jsonSchema?: object,
): React.ReactNode | null {
    const message = readTypedMessageMetadataUntyped(metadata, key, jsonSchema)
    if (message.ok) return render(message.val)
    return null
}
