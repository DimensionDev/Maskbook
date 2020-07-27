import { Grid, makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import { useLocation } from 'react-router'
import { useExchange } from '../hooks/Exchange'
import type { FileInfo } from '../types'
import { formatDateTime, formatFileSize } from '../utils'
import { FileName } from './FileName'

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
    name: {
        fontSize: 16,
        lineHeight: 1.75,
        color: '#3B3B3B',
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: 400,
        whiteSpace: 'nowrap',
    },
    meta: {
        fontSize: 14,
        lineHeight: 1.71,
        color: '#5D6F88',
        textAlign: 'center',
    },
})

export const Uploaded: React.FC = () => {
    const classes = useStyles()
    const { onInsert } = useExchange()
    const { state } = useLocation<FileInfo>()
    React.useEffect(() => {
        onInsert(state)
    }, [onInsert, state])
    return (
        <Grid container className={classes.container}>
            <Grid item>
                <img src="https://via.placeholder.com/96x120" />
            </Grid>
            <Grid item>
                <FileName name={state.name} />
                <Typography className={classes.meta}>
                    <span>{formatFileSize(state.size)}</span>
                    <span>&nbsp;&nbsp;</span>
                    <span>{formatDateTime(state.createdAt)}</span>
                </Typography>
            </Grid>
        </Grid>
    )
}
