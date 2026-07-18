import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EmptyStatus, formatFileSize } from '@masknet/shared'
import { makeStyles, RadioIndicator } from '@masknet/theme'
import type { DriveFile } from '@masknet/web3-providers'
import {
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    type TableContainerProps,
} from '@mui/material'
import { format } from 'date-fns'
import { range } from 'lodash-es'
import { memo } from 'react'
import { MoreMenu } from './MoreMenu/index.js'

const useStyles = makeStyles()((theme) => ({
    tableContainer: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: theme.palette.maskColor.bottom,
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
    fileName: {
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
    },
}))

interface GoogleDriveFileTableProps extends Omit<TableContainerProps, 'onSelect'> {
    files: DriveFile[]
    loading: boolean
    selectable?: boolean
    selectedFileId?: string
    onSelect?: (file: DriveFile) => void
    onMerge?: (file: DriveFile) => void
    onDownload?: (file: DriveFile) => void
}

export const GoogleDriveFileTable = memo<GoogleDriveFileTableProps>(function GoogleDriveFileTable({
    files,
    loading,
    selectable,
    selectedFileId,
    onSelect,
    onMerge,
    onDownload,
    className,
    ...rest
}) {
    const { classes, cx, theme } = useStyles()
    return (
        <TableContainer component={Paper} elevation={0} className={cx(classes.tableContainer, className)} {...rest}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.tableHeadCell}>
                            <strong>File name</strong>
                        </TableCell>
                        <TableCell width="12%" className={classes.tableHeadCell}>
                            <strong>Size</strong>
                        </TableCell>
                        <TableCell width="20%" className={classes.tableHeadCell} align="right">
                            <strong>Date & Time</strong>
                        </TableCell>
                        <TableCell width="10%" className={classes.tableHeadCell}>
                            <strong>Actions</strong>
                        </TableCell>
                    </TableRow>
                </TableHead>
                {loading ?
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
                                    <MoreMenu className={classes.actionButton} style={{ cursor: 'not-allowed' }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                : files.length ?
                    <TableBody>
                        {files.map((file, index) => (
                            <TableRow key={index}>
                                <TableCell className={classes.bodyCell}>
                                    <div className={classes.fileName}>
                                        {selectable ?
                                            <RadioIndicator
                                                size={20}
                                                checked={selectedFileId === file.id}
                                                onClick={() => onSelect?.(file)}
                                                uncheckedColor={theme.palette.maskColor.secondaryLine}
                                            />
                                        :   null}
                                        {file.name}
                                    </div>
                                </TableCell>
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
                                                        onMerge?.(file)
                                                    }}>
                                                    <Icons.Cloud size={16} />
                                                    <Typography className={classes.actionLabel}>
                                                        <Trans>Merge to Browser</Trans>
                                                    </Typography>
                                                </div>
                                                <div
                                                    className={classes.action}
                                                    onClick={() => {
                                                        close()
                                                        onDownload?.(file)
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
                :   <TableBody>
                        <TableRow>
                            <TableCell colSpan={4}>
                                <EmptyStatus sx={{ height: '300px' }}>
                                    <Trans>No backups found</Trans>
                                </EmptyStatus>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                }
            </Table>
        </TableContainer>
    )
})
