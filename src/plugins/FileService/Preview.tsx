import { makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import type { FileInfo } from './hooks/Exchange'
import { formatFileSize } from './utils'
import { CopyableCode } from './components/Copyable'

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
        '& p': { margin: 0 },
    },
    meta: {
        flex: 1,
        minWidth: '1%',
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
    },
    icon: {
        display: 'block',
        width: 35,
        height: 45,
        background: '#ccc',
        marginRight: 18,
        cursor: 'pointer',
    },
    download: {
        display: 'block',
        width: 24,
        height: 24,
        background: '#ccc',
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
    const link = `https://arweave.net/${info.landingTxID}#${info.key}`
    const onOpen = () => {
        open(link)
    }
    return (
        <Typography className={classes.root}>
            <i onClick={onOpen} className={classes.icon} />
            <section className={classes.meta}>
                <p className={classes.name} title={info.name}>
                    {info.name}
                </p>
                <p className={classes.size}>{formatFileSize(info.size)}</p>
                {fileKey}
            </section>
            <a className={classes.download} target="_blank" href={link} />
        </Typography>
    )
}
