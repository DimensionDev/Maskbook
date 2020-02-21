import * as a from '../avatar'
import { ProfileIdentifier } from '../type'

const testID = new ProfileIdentifier('localhost', 'test')
test('Store & Query avatar', async () => {
    await a.storeAvatarDB(testID, new ArrayBuffer(20))
    const result = await a.queryAvatarDB(testID)
    expect(result?.byteLength).toBe(20)
})
