import { SchemaType } from '../types.js'

export function isNativeTokenSchemaType(schemaType?: SchemaType) {
    // there is no native token schema on solana network
    return false
}

export function isFungibleTokenSchemaType(schemaType?: SchemaType) {
    return schemaType === SchemaType.Fungible
}

export function isNonFungibleTokenSchemaType(schemaType?: SchemaType) {
    return schemaType === SchemaType.NonFungible
}
