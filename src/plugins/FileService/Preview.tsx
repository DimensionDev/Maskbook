import { makeStyles, Typography, Theme, Paper } from '@material-ui/core'
import React from 'react'
import { CopyableCode } from './components/Copyable'
import type { FileInfo } from './types'
import { formatFileSize } from './utils'
import { Image } from '../../components/shared/Image'
import { getUrl } from '../../utils/utils'

interface Props {
    info: FileInfo
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: 345,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider,
        boxSizing: 'border-box',
        borderRadius: 12,
        padding: 16,
        cursor: 'default',
        userSelect: 'none',
        '& p': { margin: 0 },
    },
    meta: {
        flex: 1,
        minWidth: '1%',
        marginLeft: 18,
        marginRight: 18,
    },
    name: {
        fontSize: 16,
        lineHeight: 1.85,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    size: {
        fontSize: 14,
        lineHeight: 1.85,
    },
    unencrypted: {
        fontSize: 14,
        lineHeight: 1.85,
    },
    encrypted: {
        fontSize: 14,
        lineHeight: 1.85,
    },
    code: {
        lineHeight: 1,
        userSelect: 'auto',
    },
    download: {
        display: 'block',
        cursor: 'pointer',
    },
}))

export const Preview: React.FC<Props> = ({ info }) => {
    const classes = useStyles()
    const fileKey = info.key ? (
        <Typography component="p" color="textPrimary" className={classes.encrypted}>
            File Key: <CopyableCode className={classes.code}>{info.key}</CopyableCode>
        </Typography>
    ) : (
        <Typography component="p" color="textSecondary" className={classes.unencrypted}>
            This file is not encrypted
        </Typography>
    )
    const link = `https://arweave.net/${info.landingTxID}`
    const onClick = (event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        if (info.key) {
            open(`${link}#${info.key}`)
        } else {
            open(link)
        }
    }
    return (
        <Paper elevation={0} className={classes.root}>
            <Image
                className={classes.download}
                src={getUrl('/plugin/file-service/preview-file.svg')}
                width={44}
                height={44}
                onClick={onClick}
            />
            <section className={classes.meta}>
                <Typography color="textPrimary" className={classes.name} component="p" title={info.name}>
                    {info.name}
                </Typography>
                <Typography color="textSecondary" className={classes.size} component="p">
                    {formatFileSize(info.size)}
                </Typography>
                {fileKey}
            </section>
            <Image
                className={classes.download}
                src={getUrl('/plugin/file-service/download.svg')}
                width={24}
                height={24}
                onClick={onClick}
            />
        </Paper>
    )
}
