import uuid from 'uuid/v4'
import { memoizePromise } from '../memoize'

test('memorize promise with default resolver', async () => {
    const getUUID = async () => uuid()
    const getUUIDCached = memoizePromise(getUUID, undefined)
    expect(await getUUIDCached()).toEqual(await getUUIDCached())
})

test('memorize promise with customized resolver', async () => {
    const getUUID = async (key1: string, key2?: string) => uuid()
    const getUUIDCached = memoizePromise(getUUID, (key1: string, key2?: string) => key1 + key2)
    expect(await getUUIDCached('key1')).toEqual(await getUUIDCached('key1'))
    expect(await getUUIDCached('key1')).not.toEqual(await getUUIDCached('key1', 'key2'))
})
