import { SchemaType } from '../types/index.js'

export function isNativeTokenSchemaType(schemaType: SchemaType) {
    return schemaType === SchemaType.Native
}
