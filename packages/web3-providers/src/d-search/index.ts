import type { DSearchBaseAPI } from '../types/DSearch.js'

export class DSearch<ChainId, SchemaType> implements DSearchBaseAPI.Provider<ChainId, SchemaType> {
    search(
        keyword: string,
        source?: DSearchBaseAPI.Source | undefined,
    ): Promise<DSearchBaseAPI.SearchResult<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
}
