import { FileFrame, formatFileSize } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { format as formatDateTime, fromUnixTime } from 'date-fns'
import { memo } from 'react'
import type { BackupFileInfo } from '../../utils/type.js'

const useStyles = makeStyles()((theme) => ({
    file: {
        border: `1px solid ${theme.palette.maskColor.highlight}`,
    },
    desc: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
}))

interface BackupInfoProps {
    info: BackupFileInfo
}

const getFileName = (rawUrl: string) => {
    const url = new URL(rawUrl)
    return url.pathname.split('/').pop()
}

export const BackupInfoCard = memo(function BackupInfoCard({ info }: BackupInfoProps) {
    const { classes } = useStyles()
    return (
        <FileFrame
            fileName={getFileName(info.downloadURL)}
            className={classes.file}
            operations={<Typography className={classes.desc}>{formatFileSize(info.size)}</Typography>}>
            {Number.isNaN(info.uploadedAt) ? null : (
                <Typography fontSize={12} color="second">
                    {formatDateTime(fromUnixTime(info.uploadedAt), 'yyyy-MM-dd HH:mm')}
                </Typography>
            )}
        </FileFrame>
    )
})
