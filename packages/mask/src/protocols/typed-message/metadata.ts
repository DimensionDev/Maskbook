import { Result, Ok, Err } from 'ts-results'
import type { TypedMessage } from '@masknet/shared-base'
import z_schema from 'z-schema'
import produce, { enableMapSet, Draft } from 'immer'
enableMapSet()

const metadataSchemaStore = new Map<string, object>()
export const metadataSchemaStoreReadonly = metadataSchemaStore as ReadonlyMap<string, object>
/**
 * Register your metadata with a JSON Schema so Mask can validate the schema for you.
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
        if (match.err) {
            console.warn('The problematic metadata is dropped', data, 'errors:', match.val)
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
    return (
        metadata: TypedMessage['meta'],
        render: (data: T) => React.ReactElement | null,
    ): React.ReactElement | null => {
        const message = metadataReader(metadata)
        if (message.ok) return render(message.val)
        return null
    }
}

export function editMetadata(
    metadata: TypedMessage['meta'],
    edit: (meta: NonNullable<Draft<TypedMessage['meta']>>) => void,
): NonNullable<TypedMessage['meta']> {
    return produce(metadata || new Map(), (e) => void edit(e))
}
export function editTypedMessageMeta<T extends TypedMessage>(
    typedMessage: T,
    edit: (meta: NonNullable<Draft<TypedMessage['meta']>>) => void,
): T {
    const meta = editMetadata(typedMessage.meta, edit)
    return { ...typedMessage, meta: meta.size === 0 ? undefined : meta }
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
