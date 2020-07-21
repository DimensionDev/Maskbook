import React from 'react'
import { formatFileSize } from '../utils'
import { makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles({
    container: {
        height: 250,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
        paddingTop: 18,
        paddingBottom: 18,
    },
    progress: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        width: 400,
    },
    meta: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        margin: 0,
        color: '#939393',
        fontSize: 12,
        lineHeight: 1.75,
    },
    bar: {
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        height: 5,
        borderRadius: 6.5,
        backgroundColor: '#f5f5f5',
        fontSize: 12,
        lineHeight: 0,
    },
    insideBar: {
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'width 100ms linear',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        color: '#fff',
        borderRadius: 6.5,
        backgroundColor: '#2ca4ef',
    },
})

interface Props {
    preparing: boolean

    startedAt: number
    fileSize: number
    sendSize: number
}

export const ProgressBar: React.FC<Props> = (props) => {
    const classes = useStyles()
    const { startedAt, fileSize, sendSize } = props
    const width = (sendSize / fileSize) * 100
    const elapsed = (Date.now() - startedAt) / 1000
    const remaining = (fileSize - sendSize) / (elapsed ? sendSize / elapsed : 0)
    let completion = 'Preparing'
    if (!props.preparing) {
        completion = `${formatFileSize(sendSize)} of ${formatFileSize(fileSize)}`
    }
    return (
        <section className={classes.progress}>
            <Typography className={classes.meta}>
                <span>{formatDuration(remaining)}</span>
                <span>{completion}</span>
            </Typography>
            <p className={classes.bar}>
                <span className={classes.insideBar} style={{ width: `${width}%` }} />
            </p>
        </section>
    )
}

const formatDuration = (value: number) => {
    if (!Number.isFinite(value)) {
        return 'Estimating time...'
    } else if (value < 60) {
        return `${value.toFixed(0)}s remaining`
    }
    return `${Math.trunc(value / 60)}m ${(value % 60).toFixed(0)}s remaining`
}
