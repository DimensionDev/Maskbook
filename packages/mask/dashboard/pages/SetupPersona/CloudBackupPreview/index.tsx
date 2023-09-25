import { memo, useCallback, useEffect, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import formatDateTime from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import { ActionButton, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { DashboardRoutes } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { formatFileSize } from '@masknet/kit'
import { EmptyStatus } from '@masknet/shared'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { BackupPreviewModal, ConfirmDialog, MergeBackupModal } from '../../../modals/modals.js'
import type { AccountType } from '../../../type.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    description: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        marginTop: theme.spacing(1.5),
    },
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

export const CloudBackupPreview = memo(function CloudBackupPreview() {
    const t = useDashboardTrans()

    const { classes, theme, cx } = useStyles()

    const [params] = useSearchParams()
    const location = useLocation()

    const code = location.state?.code as string

    const navigate = useNavigate()

    const previewInfo = useMemo(() => {
        return {
            account: params.get('account'),
            downloadLink: params.get('downloadURL'),
            abstract: params.get('abstract'),
            uploadedAt: params.get('uploadedAt'),
            size: params.get('size'),
            type: params.get('type'),
        }
    }, [])

    const [{ loading: mergeLoading }, handleMergeClick] = useAsyncFn(async () => {
        if (
            !previewInfo.downloadLink ||
            !previewInfo.account ||
            !previewInfo.size ||
            !previewInfo.uploadedAt ||
            !previewInfo.type
        )
            return
        await MergeBackupModal.openAndWaitForClose({
            downloadLink: previewInfo.downloadLink,
            account: previewInfo.account,
            size: previewInfo.size,
            uploadedAt: previewInfo.uploadedAt,
            code,
            abstract: previewInfo.abstract ? previewInfo.abstract : undefined,
            type: previewInfo.type as AccountType,
        })
    }, [t, previewInfo, code])

    const handleBackupClick = useCallback(() => {
        if (!previewInfo.type || !previewInfo.account) return
        BackupPreviewModal.open({
            isOverwrite: false,
            code,
            abstract: previewInfo.abstract ? previewInfo.abstract : undefined,
            type: previewInfo.type as AccountType,
            account: previewInfo.account,
        })
    }, [t, previewInfo])

    const [{ loading: overwriteLoading }, handleOverwriteClick] = useAsyncFn(async () => {
        await ConfirmDialog.openAndWaitForClose({
            title: t.cloud_backup_overwrite_current_backup(),
            message: t.cloud_backup_overwrite_current_backup_tips(),
            confirmLabel: t.confirm(),
            cancelLabel: t.cancel(),
            confirmButtonProps: {
                color: 'error',
            },
            onConfirm: () => {
                ConfirmDialog.close(false)
                if (!previewInfo.type || !previewInfo.account) return

                BackupPreviewModal.open({
                    isOverwrite: true,
                    code,
                    abstract: previewInfo.abstract ? previewInfo.abstract : undefined,
                    type: previewInfo.type as AccountType,
                    account: previewInfo.account,
                })
            },
        })
    }, [t, previewInfo])

    useEffect(() => {
        if (!code) navigate(DashboardRoutes.CloudBackup, { replace: true })
    }, [code, navigate])

    return (
        <>
            <Box>
                <Typography className={classes.title}>{t.cloud_backup_preview_title()}</Typography>
                <Typography className={classes.description}>{t.cloud_backup_preview_description()}</Typography>
                {previewInfo.downloadLink ? (
                    <>
                        <Box py={0.5} px={2} mt={3} display="flex" justifyContent="space-between">
                            <Typography className={classes.text}>{previewInfo.account}</Typography>
                            <Typography
                                sx={{ cursor: 'pointer' }}
                                className={classes.text}
                                onClick={() => navigate(DashboardRoutes.CloudBackup, { replace: true })}>
                                {t.cloud_backup_preview_switch_other_account()}
                            </Typography>
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
                                        {formatFileSize(Number(previewInfo.size), false)}
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
                                    {t.cloud_backup_merge_local_data()}
                                </ActionButton>
                                <ActionButton
                                    loading={overwriteLoading}
                                    onClick={handleOverwriteClick}
                                    startIcon={<Icons.CloudBackup2 size={18} />}
                                    color="error"
                                    className={cx(classes.button)}>
                                    {t.cloud_backup_overwrite_backup()}
                                </ActionButton>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box className={classes.container}>
                        <Box py={0.5} px={2} mt={3} display="flex" justifyContent="space-between">
                            <Typography className={classes.text}>{previewInfo.account}</Typography>
                            <Typography
                                sx={{ cursor: 'pointer' }}
                                className={classes.text}
                                onClick={() => navigate(DashboardRoutes.CloudBackup, { replace: true })}>
                                {t.cloud_backup_preview_switch_other_account()}
                            </Typography>
                        </Box>
                        <EmptyStatus sx={{ minHeight: 182 }}>{t.data_backup_no_backups_found()}</EmptyStatus>
                    </Box>
                )}
            </Box>
            {!previewInfo.downloadLink ? (
                <SetupFrameController>
                    <ActionButton onClick={handleBackupClick} startIcon={<Icons.CloudBackup2 size={20} />}>
                        {t.backup()}
                    </ActionButton>
                </SetupFrameController>
            ) : null}
        </>
    )
})
