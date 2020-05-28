import { getStorage, setStorage } from '../../storage/storage'

test('get and set storage', async () => {
    const before = await getStorage('network_id')
    expect(before.forceDisplayWelcome).toBeUndefined()
    expect(before.userIgnoredWelcome).toBeUndefined()

    await setStorage('network_id', {
        forceDisplayWelcome: true,
        userIgnoredWelcome: true,
    })

    const after = await getStorage('network_id')
    expect(after.forceDisplayWelcome).toBeTruthy()
    expect(after.userIgnoredWelcome).toBeTruthy()
})
