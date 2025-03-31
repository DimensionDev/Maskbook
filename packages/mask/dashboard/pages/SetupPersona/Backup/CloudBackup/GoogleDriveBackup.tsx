import { t } from '@lingui/core/macro'
import { formatFileSize } from '@masknet/shared'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { BackupAccountType, EMPTY_LIST } from '@masknet/shared-base'
import { format } from 'date-fns'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { GoogleDriveClient, type DriveFile } from '@masknet/web3-providers'
import {
    Box,
    Button,
    Paper,
    Portal,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    Tooltip,
    TableRow,
    Typography,
    Skeleton,
} from '@mui/material'
import { compact, range, uniqBy } from 'lodash-es'
import { memo, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { UserContext } from '../../../../../shared-ui/index.js'
import { PrimaryButton } from '../../../../components/PrimaryButton/index.js'
import { useGoogleDriveFiles } from '../../../../hooks/useGoogleDriveFiles.js'
import type { PortalContainerProps } from '../types.js'
import { BackupPreviewModal, MergeBackupModal } from '../../../../modals/modals.js'
import { createBackupName, downloadBackup, getGoogleDriveAccessToken, progressDownload } from '../helpers.js'
import { MoreMenu } from '../../../../components/MoreMenu/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        paddingBottom: theme.spacing(6),
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
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
    },
    folder: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    tableContainer: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        overflow: 'hidden',
        height: 340,
        marginTop: theme.spacing(2),
    },
    table: {
        borderRadius: 8,
        borderCollapse: 'collapse',
        borderSpacing: 0,
    },
    tableHeadCell: {
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        padding: theme.spacing(1.5),
        height: 18,
    },
    bodyCell: {
        padding: theme.spacing(0, 1.5),
        fontSize: 14,
        height: 42,
        lineHeight: '18px',
        fontWeight: 400,
        color: theme.palette.maskColor.main,
        verticalAlign: 'middle',
    },
    cellText: {
        fontSize: 14,
    },
    actionButton: {
        color: theme.palette.maskColor.second,
        '&:hover': {
            color: theme.palette.maskColor.main,
        },
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    action: {
        padding: 6,
        height: 30,
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: 8,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
}))

export const Component = memo(function GoogleDriveBackup() {
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const { showSnackbar } = useCustomSnackbar()
    const { portalContainerRef } = useOutletContext<PortalContainerProps>()
    const { data: files = EMPTY_LIST, refetch, isLoading } = useGoogleDriveFiles()
    const googleDriveClient = useMemo(() => new GoogleDriveClient(getGoogleDriveAccessToken), [])

    const login = async () => {
        try {
            const userInfo = await googleDriveClient.getUserInfo()
            updateUser({
                googleAccount: userInfo.email || '',
            })
        } catch (err) {
            showSnackbar(t`Failed to login: ${(err as Error).message}`, { variant: 'error' })
        }
    }

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
        [googleDriveClient],
    )

    const mergedFiles = useMemo(() => uniqBy(compact([...files, uploadedFile]), (x) => x.id), [files, uploadedFile])

    if (!user.googleAccount) {
        return (
            <Box className={classes.container}>
                <Typography className={classes.title}>
                    <Trans>Add google Drive</Trans>
                </Typography>
                <Typography className={classes.subtitle}>
                    <Trans>
                        when you click Add Google Drive button，you will be forwarded to Google authorization pages.
                    </Trans>
                </Typography>
                <Box display="flex" justifyContent="center" mt="48px">
                    <Button variant="contained" onClick={login}>
                        Add Google Drive
                    </Button>
                </Box>
            </Box>
        )
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
                <TableContainer component={Paper} elevation={0} className={classes.tableContainer}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.tableHeadCell}>
                                    <strong>File name</strong>
                                </TableCell>
                                <TableCell className={classes.tableHeadCell}>
                                    <strong>Size</strong>
                                </TableCell>
                                <TableCell className={classes.tableHeadCell} align="right">
                                    <strong>Date & Time</strong>
                                </TableCell>
                                <TableCell className={classes.tableHeadCell}>
                                    <strong>Actions</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        {isLoading ?
                            <TableBody>
                                {range(3).map((index) => (
                                    <TableRow key={index}>
                                        <TableCell className={classes.bodyCell}>
                                            <Skeleton variant="text" width={350} />
                                        </TableCell>
                                        <TableCell className={classes.bodyCell}>
                                            <Skeleton variant="text" />
                                        </TableCell>
                                        <TableCell className={classes.bodyCell} align="right">
                                            <Skeleton variant="text" />
                                        </TableCell>
                                        <TableCell align="right" className={classes.bodyCell}>
                                            <MoreMenu
                                                className={classes.actionButton}
                                                style={{ cursor: 'not-allowed' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        :   <TableBody>
                                {mergedFiles.map((file, index) => (
                                    <TableRow key={index}>
                                        <TableCell className={classes.bodyCell}>{file.name}</TableCell>
                                        <TableCell className={classes.bodyCell}>
                                            {file.size ? formatFileSize(+file.size) : '--'}
                                        </TableCell>
                                        <TableCell className={classes.bodyCell} align="right">
                                            <Tooltip title={file.modifiedTime} placement="top">
                                                <Typography component="span" className={classes.cellText}>
                                                    {format(file.modifiedTime, 'LLL d, yyyy')}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right" className={classes.bodyCell}>
                                            <MoreMenu className={classes.actionButton}>
                                                {({ close }) => (
                                                    <div className={classes.actions}>
                                                        <div
                                                            className={classes.action}
                                                            onClick={() => {
                                                                close()
                                                                downloadAndMerge(file)
                                                            }}>
                                                            <Icons.Cloud size={16} />
                                                            <Typography className={classes.actionLabel}>
                                                                <Trans>Merge to Browser</Trans>
                                                            </Typography>
                                                        </div>
                                                        <div
                                                            className={classes.action}
                                                            onClick={async () => {
                                                                const blob = await googleDriveClient.downloadFile(
                                                                    file.id,
                                                                )
                                                                const url = URL.createObjectURL(blob)
                                                                downloadBackup(url, file.name)
                                                                Promise.resolve().then(() => {
                                                                    URL.revokeObjectURL(url)
                                                                })
                                                                close()
                                                            }}>
                                                            <Icons.Cloud size={16} />
                                                            <Typography className={classes.actionLabel}>
                                                                <Trans>Download</Trans>
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                )}
                                            </MoreMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        }
                    </Table>
                </TableContainer>
            </Box>
            <Portal container={() => portalContainerRef.current}>
                <PrimaryButton
                    variant="roundedContained"
                    startIcon={<Icons.CloudBackup2 size={18} />}
                    size="large"
                    color="primary"
                    loading={loading}
                    disabled={loading}
                    onClick={() => {
                        if (!user.googleAccount) return
                        BackupPreviewModal.open({
                            code: 'google-drive',
                            type: BackupAccountType.Email,
                            account: user.googleAccount!,
                            isUpload: true,
                            onUpload: uploadFile,
                            uploadButtonLabel: <Trans>Back Up to Google Drive</Trans>,
                        })
                    }}>
                    <Trans>Back Up to Google Drive</Trans>
                </PrimaryButton>
            </Portal>
        </Box>
    )
})
