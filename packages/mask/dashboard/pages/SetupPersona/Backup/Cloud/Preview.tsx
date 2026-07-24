import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EmptyStatus, formatFileSize } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { ActionButton, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { format as formatDateTime, fromUnixTime } from 'date-fns'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { OutletPortal } from '../../../../components/OutletPortal.js'
import { BackupPreviewModal, RestoreBackupModal } from '../../../../modals/modals.js'
import { createBackupName, downloadBackup, getFileName, progressDownload } from '../../../../utils/api.js'

const useStyles = makeStyles()((theme) => ({
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
    text: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    content: {
        borderRadius: 8,
        border: `1px solid ${theme.vars.palette.maskColor.line}`,
        padding: theme.spacing(2),
        marginTop: theme.spacing(3),
        display: 'flex',
        columnGap: 8,
        alignItems: 'center',
    },
    container: {
        padding: theme.spacing(2),
        borderRadius: 8,
        border: `1px solid ${theme.vars.palette.maskColor.line}`,
        marginTop: theme.spacing(3),
    },
    button: {
        whiteSpace: 'nowrap',
    },
}))

export const Component = memo(function CloudBackupPreview() {
    const { classes, theme } = useStyles()
    const [params] = useSearchParams()

    const navigate = useNavigate()

    const previewInfo = useMemo(() => {
        return {
            account: params.get('account'),
            downloadLink: params.get('downloadURL'),
            abstract: params.get('abstract'),
            uploadedAt: params.get('uploadedAt'),
            size: params.get('size'),
            type: params.get('type'),
            code: params.get('code'),
        }
    }, [params])

    const [{ loading: mergeLoading }, handleMergeClick] = useAsyncFn(async () => {
        if (!previewInfo.downloadLink || !previewInfo.account || !previewInfo.size || !previewInfo.uploadedAt) return
        await RestoreBackupModal.openAndWaitForClose({
            decryptWithAccount: true,
            strategy: 'merge',
            download: () => progressDownload(previewInfo.downloadLink),
            fileName: getFileName(previewInfo.downloadLink) || createBackupName(),
            account: previewInfo.account,
            size: previewInfo.size,
            uploadedAt: previewInfo.uploadedAt,
        })
    }, [previewInfo])

    const handleBackupClick = useCallback(() => {
        if (!previewInfo.type || !previewInfo.account || !previewInfo.code) return
        BackupPreviewModal.open({
            encryptWithAccount: true,
            isUpload: false,
            account: previewInfo.account,
        })
    }, [previewInfo])

    return (
        <>
            <Box>
                {previewInfo.downloadLink ?
                    <>
                        <Box className={classes.header}>
                            <Box className={classes.user}>
                                <Typography className={classes.providerName}>
                                    <Trans>Mask Network Cloud</Trans>
                                </Typography>
                                <Typography className={classes.userAccount}>{previewInfo.account}</Typography>
                            </Box>
                            <Button variant="roundedContained" size="small" onClick={() => navigate(-1)}>
                                <Trans>Logout</Trans>
                            </Button>
                        </Box>
                        <Box className={classes.content}>
                            <Icons.Message size={48} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: 0 }}>
                                <TextOverflowTooltip title={previewInfo.abstract} arrow placement="top">
                                    <Typography
                                        className={classes.text}
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        }}>
                                        {previewInfo.abstract}
                                    </Typography>
                                </TextOverflowTooltip>

                                <Typography sx={{ display: 'flex', columnGap: '4px' }}>
                                    <Typography
                                        component="span"
                                        sx={{ fontSize: 12, fontWeight: 700, lineHeight: '16px' }}>
                                        {formatFileSize(Number(previewInfo.size))}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        sx={{
                                            color: theme.vars.palette.maskColor.third,
                                            fontSize: 12,
                                            lineHeight: '16px',
                                        }}>
                                        {formatDateTime(
                                            fromUnixTime(Number(previewInfo.uploadedAt)),
                                            'yyyy-MM-dd HH:mm',
                                        )}
                                    </Typography>
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1, columnGap: 1 }}>
                                <ActionButton
                                    className={classes.button}
                                    startIcon={<Icons.Cloud size={18} />}
                                    color="primary"
                                    loading={mergeLoading}
                                    onClick={handleMergeClick}>
                                    <Trans>Merge data to local database</Trans>
                                </ActionButton>
                                <ActionButton
                                    className={classes.button}
                                    onClick={() => {
                                        downloadBackup(previewInfo.downloadLink!)
                                    }}
                                    startIcon={<Icons.Cloud size={18} />}
                                    color="primary">
                                    <Trans>Download</Trans>
                                </ActionButton>
                            </Box>
                        </Box>
                    </>
                :   <Box className={classes.container}>
                        <Box sx={{ py: 0.5, px: 2, mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography className={classes.text}>{previewInfo.account}</Typography>
                            <Typography
                                sx={{ cursor: 'pointer' }}
                                className={classes.text}
                                onClick={() => navigate(DashboardRoutes.BackupCloud, { replace: true })}>
                                <Trans>Switch other account</Trans>
                            </Typography>
                        </Box>
                        <EmptyStatus sx={{ minHeight: 182 }}>
                            <Trans>No backups found</Trans>
                        </EmptyStatus>
                    </Box>
                }
            </Box>
            {previewInfo.downloadLink ? null : (
                <OutletPortal>
                    <ActionButton onClick={handleBackupClick}>
                        <Trans>Back</Trans>
                    </ActionButton>
                </OutletPortal>
            )}
        </>
    )
})
