import * as a from '../avatar'
// import { createAvatarDBAccess, AvatarDBSchema } from '../avatar'
// import { IDBPDatabase } from 'idb'
import { ProfileIdentifier } from '../type'

// let dbAccess: IDBPDatabase<AvatarDBSchema>
// beforeAll(async () => {
//     dbAccess = await createAvatarDBAccess()
// })

const testID = new ProfileIdentifier('localhost', 'test')
test('Store & Query avatar', async () => {
    await a.storeAvatarDB(testID, new ArrayBuffer(20))
    const result = await a.queryAvatarDB(testID)
    expect(result?.byteLength).toBe(20)
})
