import { timeout } from '@masknet/kit'
import { None, type Option, Some } from 'ts-results-es'

/**
 * Make sure that the storage is used serially.
 */
class MutexStorage<T> {
    private tasks: Array<() => void> = []
    private locked = false

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
        return new Promise<T | undefined>((resolve, reject) => {
            const callback = (e: unknown, storage?: T) => {
                if (e) reject(e)
                else resolve(storage)
                this.unlock()
                this.continue()
            }
            const run = async () => {
                try {
                    this.lock()
                    const stored = await timeout(
                        browser.storage.local.get(key),
                        5000,
                        `Get ${key} timeout in mutex storage.`,
                    )
                    callback(null, stored?.[key] as T)
                } catch (error) {
                    callback(error)
                }
            }
            if (this.locked) this.tasks.push(run)
            else run()
        })
    }
    public async setStorage(key: string, value: T) {
        return new Promise<void>((resolve, reject) => {
            const callback = (e: unknown) => {
                if (e) reject(e)
                else resolve()
                this.unlock()
                this.continue()
            }
            const run = async () => {
                try {
                    this.lock()
                    await timeout(
                        browser.storage.local.set({ [key]: value }),
                        5000,
                        `Set ${key} to ${value} timeout in mutex storage.`,
                    )
                    callback(null)
                } catch (error) {
                    callback(error)
                }
            }
            if (this.locked) this.tasks.push(run)
            else run()
        })
    }
}

const storage = new MutexStorage()

/**
 * Avoid using this.
 * @deprecated
 * @internal
 */
export async function __deprecated__getStorage<T>(key: string): Promise<Option<T>> {
    if (typeof browser === 'undefined') return None
    if (!browser.storage) return None
    const value = await storage.getStorage(key)
    if (value === undefined) return None
    return Some(value as any)
}

/**
 * Avoid using this.
 * @deprecated
 * @internal
 */
export async function __deprecated__setStorage<T>(key: string, value: T): Promise<void> {
    if (typeof browser === 'undefined') return
    if (!browser.storage) return
    return storage.setStorage(key, value)
}
