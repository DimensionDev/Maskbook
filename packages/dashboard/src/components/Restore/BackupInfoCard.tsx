import { memo } from 'react'
import { Typography } from '@mui/material'
import formatDateTime from 'date-fns/format'
import type { BackupFileInfo } from '../../pages/Settings/type.js'
import { formatFileSize } from '@masknet/kit'
import { FileFrame } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    file: {
        border: `1px solid ${theme.palette.maskColor.highlight}`,
    },
    desc: {
        fontSize: 12,
        fontFamily: 'Helvetica',
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
            operations={<Typography className={classes.desc}>{formatFileSize(info.size, true)}</Typography>}>
            {Number.isNaN(info.uploadedAt) ? null : (
                <Typography fontSize={12} color="second">
                    {formatDateTime(info.uploadedAt, 'yyyy-MM-dd hh:mm')}
                </Typography>
            )}
        </FileFrame>
    )
})
