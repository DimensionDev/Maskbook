import type { Storage } from '@masknet/web3-shared-base'
import { Web3StateSettings } from '../../settings'
import { RSS3 } from '@masknet/web3-providers'

export class RSS3Storage extends Storage {
    constructor(private address: string) {
        super()
    }

    private async getRSS3<T>() {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.()
        return RSS3.createRSS3(
            this.address,
            connection ? (message: string) => connection.signMessage(message, 'personalSign') : undefined,
        )
    }

    async get<T>(key: string): Promise<T | undefined> {
        const rss3 = await this.getRSS3()
        return RSS3.getFileData(rss3, this.address, key)
    }

    async set<T>(key: string, value: T): Promise<void> {
        const rss3 = await this.getRSS3()
        await RSS3.setFileData(rss3, this.address, key, value)
        return
    }
}
