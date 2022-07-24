import type { Wallet } from '@masknet/web3-shared-base'
import type { LegacyWalletRecord } from '../../../shared/definitions/wallet'

// TODO: this should be in the plugin infra.
export interface WalletBackupProvider {
    exportMnemonic(address: string): Promise<string>
    exportPrivateKey(address: string): Promise<string>
    getLegacyWallets(): Promise<LegacyWalletRecord[]>
    getWallets(): Promise<Wallet[]>
    getDerivableAccounts(
        mnemonic: string,
        page: number,
        pageSize?: number,
    ): Promise<
        {
            index: number
            address: string
            derivationPath: string
        }[]
    >
    recoverWalletFromMnemonic(
        name: string,
        mnemonic: string,
        derivationPath?: string,
        initialPassword?: string,
    ): Promise<string>
    recoverWalletFromPrivateKey(name: string, privateKey: string, initialPassword_?: string): Promise<string>
    INTERNAL_getPasswordRequired(): Promise<string>
}
export let provider: WalletBackupProvider
export function setWalletBackupProvider(p: WalletBackupProvider) {
    provider = p
}
