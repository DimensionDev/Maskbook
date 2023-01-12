import urlcat from 'urlcat'
import { CHAINBASE_API_URL } from '../constants.js'
import { fetchJSON } from '../../entry-helpers.js'

export async function fetchFromChainbase<T>(pathname: string) {
    const data = await fetchJSON<
        | {
              code: 0 | Omit<number, 0>
              message: 'ok' | Omit<string, 'ok'>
              data: T
          }
        | undefined
    >(urlcat(CHAINBASE_API_URL, pathname))
    return data?.code === 0 ? data.data : undefined
}
