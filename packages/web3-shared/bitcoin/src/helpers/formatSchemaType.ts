import { createLookupTableResolver } from '@masknet/shared-base'
import { SchemaType } from '../types/index.js'

export const formatSchemaType = createLookupTableResolver<SchemaType, string>(
    {
        [SchemaType.Native]: 'Native',
        [SchemaType.BRC20]: 'BRC20',
    },
    '',
)
