import type { NormalizedBackup } from '@masknet/backup-format'

// Well, this is a bit of a hack, because we have not move those two parts into this project yet.
let restorePlugins: (backup: NormalizedBackup.Data['plugins']) => Promise<void>
let restoreWallets: (backup: NormalizedBackup.WalletBackup[]) => Promise<void>
export function delegateWalletRestore(f: typeof restoreWallets) {
    restoreWallets = f
}
export function delegatePluginRestore(f: typeof restorePlugins) {
    restorePlugins = f
}
