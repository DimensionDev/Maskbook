import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { GoogleDriveClient, type DriveFile } from '@masknet/web3-providers'
import { Box, Button, Typography } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { UserContext } from '../../../../../shared-ui/index.js'
import { GoogleDriveFileTable } from '../../../../components/GoogleDriveFileTable.js'
import { GoogleDriveLogin } from '../../../../components/GoogleDriveLogin.js'
import { OutletPortal } from '../../../../components/OutletPortal.js'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'
import { useGoogleDriveFiles } from '../../../../hooks/useGoogleDriveFiles.js'
import { MergeBackupModal, RestoreBackupModal } from '../../../../modals/modals.js'
import {
    clearGoogleDriveAccessToken,
    downloadBackup,
    getGoogleDriveAccessToken,
    progressDownload,
} from '../../../../utils/api.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    user: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    providerName: {
        fontWeight: 400,
        fontSize: 14,
        lineHeight: '18px',
        height: 18,
        color: theme.palette.maskColor.second,
    },
    userAccount: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        height: 18,
        color: theme.palette.maskColor.main,
    },
    folder: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    tableContainer: {
        height: 340,
        marginTop: theme.spacing(2),
    },
}))

export const Component = memo(function GoogleDriveRecovery() {
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const googleDriveClient = useMemo(
        () => new GoogleDriveClient(getGoogleDriveAccessToken, clearGoogleDriveAccessToken),
        [],
    )
    const { data: files = EMPTY_LIST, isLoading } = useGoogleDriveFiles(googleDriveClient)

    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)

    if (!user.googleAccount) {
        return <GoogleDriveLogin />
    }

    const downloadAndMerge = async (file: DriveFile) => {
        await MergeBackupModal.openAndWaitForClose({
            download: () => {
                return progressDownload(() => googleDriveClient.requestFile(file.id), file.size ? +file.size : 0)
            },
            fileName: file.name,
            account: user.googleAccount!,
            size: file.size || '0',
            uploadedAt: new Date(file.modifiedTime).getTime(),
        })
    }
    return (
        <Box className={classes.container}>
            <Box className={classes.header}>
                <Box className={classes.user}>
                    <Typography className={classes.providerName}>
                        <Trans>Google Drive</Trans>
                    </Typography>
                    <Typography className={classes.userAccount}>{user.googleAccount}</Typography>
                </Box>
                <Button
                    variant="roundedContained"
                    size="small"
                    onClick={() => {
                        updateUser({
                            googleAccount: '',
                            googleToken: '',
                        })
                    }}>
                    <Trans>Logout</Trans>
                </Button>
            </Box>
            <Box>
                <Typography className={classes.folder}>MaskBackup file</Typography>
                <GoogleDriveFileTable
                    className={classes.tableContainer}
                    files={files}
                    loading={isLoading}
                    selectable
                    selectedFileId={selectedFile?.id}
                    onSelect={setSelectedFile}
                    onDownload={downloadAndMerge}
                    onMerge={async (file) => {
                        const blob = await googleDriveClient.downloadFile(file.id)
                        const url = URL.createObjectURL(blob)
                        downloadBackup(url, file.name)
                        Promise.resolve().then(() => {
                            URL.revokeObjectURL(url)
                        })
                    }}
                />
            </Box>
            <OutletPortal>
                <PrimaryButton
                    variant="roundedContained"
                    startIcon={<Icons.Cloud size={18} />}
                    size="large"
                    color="primary"
                    disabled={!selectedFile}
                    onClick={async () => {
                        if (!user.googleAccount || !selectedFile?.id) return
                        await RestoreBackupModal.openAndWaitForClose({
                            download: () => {
                                return progressDownload(
                                    () => googleDriveClient.requestFile(selectedFile.id),
                                    selectedFile.size ? +selectedFile.size : 0,
                                )
                            },
                            fileName: selectedFile.name,
                            account: user.googleAccount,
                            size: selectedFile.size || '0',
                            uploadedAt: new Date(selectedFile.modifiedTime).getTime(),
                            restoreSuccessMessage: (
                                <Trans>
                                    You have successfully restored the backup from Google Drive to your browser.
                                </Trans>
                            ),
                            restoreErrorMessage: (
                                <Trans>
                                    Failed to restore the backup from Google Drive to your browser. Please try again.
                                </Trans>
                            ),
                        })
                        setSelectedFile(null)
                    }}>
                    <Trans>Recover</Trans>
                </PrimaryButton>
            </OutletPortal>
        </Box>
    )
})
