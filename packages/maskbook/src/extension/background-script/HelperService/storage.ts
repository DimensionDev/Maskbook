import { merge } from 'lodash-es'
import { timeout } from '@masknet/shared-base'

/**
 * Make sure that the storage is used serially.
 */
class MutexStorage<T extends browser.storage.StorageValue> {
    private tasks: (() => void)[] = []
    private locked: boolean = false

    private lock() {
        this.locked = true
    }
    private unlock() {
        this.locked = false
    }
    private async continue() {
        if (!this.locked) this.tasks.shift()?.()
    }
    public async getStorage(key: string) {
        return new Promise<T | undefined>(async (resolve, reject) => {
            const callback = (e: Error | null, storage?: T) => {
                if (e) reject(e)
                else resolve(storage)
                this.unlock()
                this.continue()
            }
            const run = async () => {
                try {
                    this.lock()
                    const stored = await timeout(browser.storage.local.get(key), 3000, `Get ${key} timeout.`)
                    callback(null, (stored ?? {})[key] as T)
                } catch (error: any) {
                    callback(error)
                }
            }
            if (this.locked) this.tasks.push(run)
            else run()
        })
    }
    public async setStorage(key: string, value: T) {
        return new Promise<void>(async (resolve, reject) => {
            const callback = (e: Error | null) => {
                if (e) reject(e)
                else resolve()
                this.unlock()
                this.continue()
            }
            const run = async () => {
                try {
                    this.lock()
                    await timeout(browser.storage.local.set({ [key]: value }), 3000, `Set ${key} to ${value} timeout.`)
                    callback(null)
                } catch (error: any) {
                    callback(error)
                }
            }
            if (this.locked) this.tasks.push(run)
            else run()
        })
    }
}

const storage = new MutexStorage<browser.storage.StorageValue>()

export async function getStorage<T extends browser.storage.StorageValue>(key: string): Promise<T | undefined> {
    if (typeof browser === 'undefined' || !browser.storage) return
    const value = await storage.getStorage(key)
    return value as T
}

export async function setStorage<T extends browser.storage.StorageValue>(
    key: string,
    value: T,
    options: { howToUpdate: 'merge' | 'replace' } = { howToUpdate: 'replace' },
) {
    if (typeof browser === 'undefined' || !browser.storage) return
    if (options.howToUpdate === 'merge') value = merge((await storage.getStorage(key)) ?? {}, value)
    return storage.setStorage(key, value)
}
