// TODO: This is a hack. We cannot access "settings" API in this TS project. This should be an temporally workaround.
/**
 * @internal
 * @deprecated
 */
export enum InternalStorageKeys {
    currentPersona = 'settings+currentPersonaIdentifier',
    language = 'settings+language',
}
/**
 * @internal
 * @deprecated
 */
export async function getBrowserStorageUnchecked(
    arg: InternalStorageKeys,
): Promise<browser.storage.StorageValue | undefined>
export async function getBrowserStorageUnchecked<T extends InternalStorageKeys>(
    ...args: T[]
): Promise<Record<T, undefined | browser.storage.StorageValue>>
export async function getBrowserStorageUnchecked<T extends InternalStorageKeys>(
    ...args: T[]
): Promise<Record<T, undefined | browser.storage.StorageValue>> {
    const raw_result = await browser.storage.local.get(args)
    const result: Record<T, undefined | browser.storage.StorageValue> = {} as any

    if (args.length === 1) return Reflect.get(raw_result, args[0])
    for (const [key, value] of Object.entries(raw_result)) {
        Reflect.set(result, Reflect.get(InternalStorageKeys, key), value)
    }
    return result
}

/**
 * @internal
 * @deprecated
 */
export async function setBrowserStorageUnchecked(key: InternalStorageKeys, value: string) {
    await browser.storage.local.set({ [key]: value })
}
