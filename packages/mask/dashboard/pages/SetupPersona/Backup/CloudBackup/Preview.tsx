import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { ConfirmDialog, EmptyStatus, formatFileSize } from '@masknet/shared'
import type { BackupAccountType } from '@masknet/shared-base'
import { DashboardRoutes } from '@masknet/shared-base'
import { ActionButton, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { Box, Portal, Typography } from '@mui/material'
import { format as formatDateTime, fromUnixTime } from 'date-fns'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { MergeBackupModal, BackupPreviewModal } from '../../../../modals/modals.js'
import type { PortalContainerProps } from '../types.js'

const useStyles = makeStyles()((theme) => ({
    text: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    content: {
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(2),
        marginTop: theme.spacing(3),
        display: 'flex',
        columnGap: 8,
        alignItems: 'center',
    },
    button: {
        height: 40,
        borderRadius: 20,
    },
    container: {
        padding: theme.spacing(2),
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(3),
    },
}))

export const Component = memo(function CloudBackupPreview() {
    const { classes, theme, cx } = useStyles()
    const [params] = useSearchParams()
    const { portalContainerRef } = useOutletContext<PortalContainerProps>()

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
        if (
            !previewInfo.downloadLink ||
            !previewInfo.account ||
            !previewInfo.size ||
            !previewInfo.uploadedAt ||
            !previewInfo.type ||
            !previewInfo.code
        )
            return
        await MergeBackupModal.openAndWaitForClose({
            downloadLink: previewInfo.downloadLink,
            account: previewInfo.account,
            size: previewInfo.size,
            uploadedAt: previewInfo.uploadedAt,
            code: previewInfo.code,
            abstract: previewInfo.abstract ? previewInfo.abstract : undefined,
            type: previewInfo.type as BackupAccountType,
        })
    }, [previewInfo])

    const handleBackupClick = useCallback(() => {
        if (!previewInfo.type || !previewInfo.account || !previewInfo.code) return
        BackupPreviewModal.open({
            isOverwrite: false,
            code: previewInfo.code,
            abstract: previewInfo.abstract ? previewInfo.abstract : undefined,
            type: previewInfo.type as BackupAccountType,
            account: previewInfo.account,
        })
    }, [previewInfo])

    const [{ loading: overwriteLoading }, handleOverwriteClick] = useAsyncFn(async () => {
        await ConfirmDialog.openAndWaitForClose({
            title: <Trans>Overwrite current backup</Trans>,
            message: <Trans>Are you sure to overwrite the backups stored on Mask Cloud Service?</Trans>,
            confirmLabel: <Trans>Confirm</Trans>,
            cancelLabel: <Trans>Cancel</Trans>,
            confirmVariant: 'error',
            onConfirm: () => {
                ConfirmDialog.close(false)
                if (!previewInfo.type || !previewInfo.account || !previewInfo.code) return

                BackupPreviewModal.open({
                    isOverwrite: true,
                    code: previewInfo.code,
                    abstract: previewInfo.abstract ? previewInfo.abstract : undefined,
                    type: previewInfo.type as BackupAccountType,
                    account: previewInfo.account,
                })
            },
        })
    }, [previewInfo])

    return (
        <>
            <Box>
                {previewInfo.downloadLink ?
                    <>
                        <Box py={0.5} px={2} mt={3} display="flex" justifyContent="space-between">
                            <Typography className={classes.text}>{previewInfo.account}</Typography>
                            <ActionButton
                                loading={overwriteLoading}
                                startIcon={<Icons.Cloud size={18} />}
                                color="primary"
                                className={cx(classes.button)}
                                onClick={() => {
                                    navigate(-1)
                                }}>
                                <Trans>Logout</Trans>
                            </ActionButton>
                        </Box>
                        <Box className={classes.content}>
                            <Icons.Message size={48} />
                            <Box width="clamp(188px, 27%, 35%)" flex={1}>
                                <TextOverflowTooltip title={previewInfo.abstract} arrow placement="top">
                                    <Typography
                                        className={classes.text}
                                        whiteSpace="nowrap"
                                        textOverflow="ellipsis"
                                        overflow="hidden">
                                        {previewInfo.abstract}
                                    </Typography>
                                </TextOverflowTooltip>

                                <Typography display="flex" columnGap="4px">
                                    <Typography component="span" fontSize={12} fontWeight={700} lineHeight="16px">
                                        {formatFileSize(Number(previewInfo.size))}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        fontSize={12}
                                        lineHeight="16px"
                                        color={theme.palette.maskColor.third}>
                                        {formatDateTime(
                                            fromUnixTime(Number(previewInfo.uploadedAt)),
                                            'yyyy-MM-dd HH:mm',
                                        )}
                                    </Typography>
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="flex-end" flex={1} columnGap={1} minWidth={436}>
                                <ActionButton
                                    startIcon={<Icons.Cloud size={18} />}
                                    color="primary"
                                    className={classes.button}
                                    loading={mergeLoading}
                                    onClick={handleMergeClick}>
                                    <Trans>Merge data to local database</Trans>
                                </ActionButton>
                                <ActionButton
                                    loading={overwriteLoading}
                                    onClick={handleOverwriteClick}
                                    startIcon={<Icons.Cloud size={18} />}
                                    color="primary"
                                    className={cx(classes.button)}>
                                    <Trans>Download</Trans>
                                </ActionButton>
                            </Box>
                        </Box>
                    </>
                :   <Box className={classes.container}>
                        <Box py={0.5} px={2} mt={3} display="flex" justifyContent="space-between">
                            <Typography className={classes.text}>{previewInfo.account}</Typography>
                            <Typography
                                sx={{ cursor: 'pointer' }}
                                className={classes.text}
                                onClick={() => navigate(DashboardRoutes.CloudBackup, { replace: true })}>
                                <Trans>Switch other account</Trans>
                            </Typography>
                        </Box>
                        <EmptyStatus sx={{ minHeight: 182 }}>
                            <Trans>No backups found</Trans>
                        </EmptyStatus>
                    </Box>
                }
            </Box>
            {!previewInfo.downloadLink ?
                <Portal container={() => portalContainerRef.current}>
                    <ActionButton onClick={handleBackupClick}>
                        <Trans>Back</Trans>
                    </ActionButton>
                </Portal>
            :   null}
        </>
    )
})
