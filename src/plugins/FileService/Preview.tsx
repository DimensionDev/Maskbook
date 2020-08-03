import { makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import { CopyableCode } from './components/Copyable'
import type { FileInfo } from './types'
import { formatFileSize } from './utils'
import { Image } from '../../components/shared/Image'
import { getUrl } from '../../utils/utils'

interface Props {
    info: FileInfo
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: 345,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#E6ECF0',
        boxSizing: 'border-box',
        borderRadius: 12,
        padding: 16,
        background: '#fff',
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
        color: '#14171A',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    size: {
        fontSize: 14,
        lineHeight: 1.85,
        color: '#979797',
    },
    unencrypted: {
        fontSize: 14,
        lineHeight: 1.85,
        color: '#C4C4C4',
    },
    encrypted: {
        fontSize: 14,
        lineHeight: 1.85,
        color: '#444',
    },
    code: {
        lineHeight: 1,
        userSelect: 'auto',
    },
    download: {
        display: 'block',
        cursor: 'pointer',
    },
})

export const Preview: React.FC<Props> = ({ info }) => {
    const classes = useStyles()
    const fileKey = info.key ? (
        <p className={classes.encrypted}>
            File Key: <CopyableCode className={classes.code}>{info.key}</CopyableCode>
        </p>
    ) : (
        <p className={classes.unencrypted}>This file is not encrypted</p>
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
        <Typography className={classes.root}>
            <Image
                className={classes.download}
                src={getUrl('/plugin/file-service/preview-file.svg')}
                width={44}
                height={44}
                onClick={onClick}
            />
            <section className={classes.meta}>
                <p className={classes.name} title={info.name} children={info.name} />
                <p className={classes.size}>{formatFileSize(info.size)}</p>
                {fileKey}
            </section>
            <Image
                className={classes.download}
                src={getUrl('/plugin/file-service/download.svg')}
                width={24}
                height={24}
                onClick={onClick}
            />
        </Typography>
    )
}
