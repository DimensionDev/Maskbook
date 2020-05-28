type MutexStorageTask<T extends browser.storage.StorageValue> =
    | { type: 'set'; key: string; value: T; callback: (e: Error | null) => void }
    | { type: 'get'; key: string; callback: (e: Error | null, storage: T) => void }

export class MutexStorage<T extends browser.storage.StorageValue> {
    #tasks: MutexStorageTask<T>[] = []
    #storageKey = 'ls_mutex_key'

    private get locked() {
        return localStorage.getItem(this.#storageKey) === '1'
    }
    private lock() {
        localStorage.setItem(this.#storageKey, '1')
    }
    private unlock() {
        localStorage.setItem(this.#storageKey, '0')
    }
    private continue() {
        if (this.locked || this.#tasks.length === 0) return
        const item = this.#tasks.shift()!
        if (item.type === 'get') this.getStorage(item.key)
        else this.setStorage(item.key, item.value)
    }
    async getStorage(key: string) {
        return new Promise<T>(async (resolve, reject) => {
            const callback = (error: Error | null, storage: T) => {
                if (error) reject(error)
                else resolve(storage)
            }
            if (this.locked) {
                this.#tasks.push({ type: 'get', key, callback })
            } else {
                try {
                    this.lock()
                    const stored = await browser.storage.local.get(key)
                    callback(null, ((stored ?? {})[key] ?? {}) as T)
                } catch (e) {
                    callback(e, {} as T)
                } finally {
                    this.unlock()
                    this.continue()
                }
            }
        })
    }
    async setStorage(key: string, value: T) {
        return new Promise<T>(async (resolve, reject) => {
            const callback = (error: Error | null) => {
                if (error) reject(error)
                else resolve()
            }
            if (this.locked) {
                this.#tasks.push({ type: 'set', key, value, callback })
            } else {
                try {
                    this.lock()
                    await browser.storage.local.set({ [key]: value })
                    callback(null)
                } catch (e) {
                    callback(e)
                } finally {
                    this.unlock()
                    this.continue()
                }
            }
        })
    }
}
