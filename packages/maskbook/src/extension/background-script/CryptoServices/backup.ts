import { createBackupFile } from '../WelcomeService'
import { encryptBackup } from '../CryptoService'

export const getEncryptBackupInfo = async (password: string, account: string) => {
    const backupFileInfoJson = await createBackupFile({ download: false, onlyBackupWhoAmI: false })
    return encryptBackup(password, account, JSON.stringify(backupFileInfoJson))
}
