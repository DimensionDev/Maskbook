import { ValueRefWithReady } from '@masknet/shared-base'

export interface WalletBackupProvider {
    renameWallet(address: string, name: string): Promise<void>
}

export const WalletServiceRef = new ValueRefWithReady<WalletBackupProvider>()
