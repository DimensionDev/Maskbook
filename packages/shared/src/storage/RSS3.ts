import type { Storage, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { RSS3 } from '@masknet/web3-providers'

export class RSS3Storage extends Storage {
    constructor(
        private address: string,
        private getConnection?: () => Promise<Web3Helper.Web3Connection<NetworkPluginID>>,
    ) {
        super()
    }

    private async getRSS3<T>() {
        const connection = await this.getConnection?.()
        return RSS3.createRSS3(
            this.address,
            connection ? (message: string) => connection.signMessage(message, 'personaSign') : undefined,
        )
    }

    async get<T>(key: string): Promise<T | undefined> {
        const rss3 = await this.getRSS3<T>()
        return RSS3.getFileData(rss3, this.address, key)
    }

    async set<T>(key: string, value: T): Promise<void> {
        const rss3 = await this.getRSS3<T>()
        await RSS3.setFileData(rss3, this.address, key, value)
        return
    }
}
