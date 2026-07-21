import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { GoogleDriveClient, type DriveFile } from '@masknet/web3-providers'
import { Box, Typography } from '@mui/material'
import { compact, uniqBy } from 'lodash-es'
import { memo, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { UserContext } from '../../../../../shared-ui/index.js'
import { GoogleDriveFileTable } from '../../../../components/GoogleDriveFileTable.js'
import { GoogleDriveLogin } from '../../../../components/GoogleDriveLogin.js'
import { OutletPortal } from '../../../../components/OutletPortal.js'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'
import { useGoogleDriveFiles } from '../../../../hooks/useGoogleDriveFiles.js'
import { BackupPreviewModal, RestoreBackupModal } from '../../../../modals/modals.js'
import {
    clearGoogleDriveAccessToken,
    createBackupName,
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
        color: theme.vars.palette.maskColor.second,
    },
    userAccount: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        height: 18,
        color: theme.vars.palette.maskColor.main,
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

export const Component = memo(function GoogleDriveBackup() {
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const googleDriveClient = useMemo(
        () => new GoogleDriveClient(getGoogleDriveAccessToken, clearGoogleDriveAccessToken),
        [],
    )
    const { data: files = EMPTY_LIST, refetch, isLoading } = useGoogleDriveFiles(googleDriveClient)

    const [uploadedFile, setUploadedFile] = useState<DriveFile | null>(null)

    const [{ loading }, uploadFile] = useAsyncFn(
        async (content: ArrayBuffer) => {
            const name = createBackupName()
            const file = new File([content], name, { type: 'application/octet-stream' })
            const result = await googleDriveClient.uploadFile(file)
            const date = new Date()
            setUploadedFile({
                ...result,
                name,
                size: file.size.toString(),
                createdTime: date.toISOString(),
                modifiedTime: date.toISOString(),
            })
            refetch()
        },
        [googleDriveClient, refetch],
    )

    const [{ loading: logoutLoading }, logout] = useAsyncFn(async () => {
        await googleDriveClient.logout()
        updateUser({
            googleAccount: '',
            googleToken: '',
        })
    }, [googleDriveClient, updateUser])

    const mergedFiles = useMemo(() => uniqBy(compact([...files, uploadedFile]), (x) => x.id), [files, uploadedFile])

    if (!user.googleAccount) {
        return <GoogleDriveLogin />
    }

    const downloadAndMerge = async (file: DriveFile) => {
        await RestoreBackupModal.openAndWaitForClose({
            decryptWithAccount: false,
            strategy: 'merge',
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
                <ActionButton
                    variant="roundedContained"
                    size="small"
                    loading={logoutLoading}
                    disabled={logoutLoading}
                    onClick={logout}>
                    <Trans>Logout</Trans>
                </ActionButton>
            </Box>
            <Box>
                <Typography className={classes.folder}>MaskBackup file</Typography>
                <GoogleDriveFileTable
                    className={classes.tableContainer}
                    files={mergedFiles}
                    loading={isLoading}
                    onMerge={downloadAndMerge}
                    onDownload={async (file) => {
                        const blob = await googleDriveClient.downloadFile(file.id)
                        const url = URL.createObjectURL(blob)
                        downloadBackup(url, file.name)
                        URL.revokeObjectURL(url)
                    }}
                />
            </Box>
            <OutletPortal>
                <PrimaryButton
                    startIcon={<Icons.CloudBackup2 size={18} />}
                    size="large"
                    color="primary"
                    loading={loading}
                    disabled={loading}
                    onClick={() => {
                        if (!user.googleAccount) return
                        BackupPreviewModal.open({
                            encryptWithAccount: false,
                            account: user.googleAccount!,
                            isUpload: true,
                            title: <Trans>Backup to Google Drive</Trans>,
                            uploadButtonLabel: <Trans>Backup</Trans>,
                            onUpload: uploadFile,
                        })
                    }}>
                    <Trans>Backup to Google Drive</Trans>
                </PrimaryButton>
            </OutletPortal>
        </Box>
    )
})
