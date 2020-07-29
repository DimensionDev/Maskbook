import { Grid, makeStyles, Typography, Button } from '@material-ui/core'
import React from 'react'
import { useLocation, useHistory } from 'react-router'
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    info: {
        margin: 0,
    },
    back: {
        color: '#2CA4EF',
    },
})

export const Uploaded: React.FC = () => {
    const classes = useStyles()
    const history = useHistory()
    const { onInsert } = useExchange()
    const { state } = useLocation<FileInfo>()
    React.useEffect(() => {
        onInsert(state)
    }, [onInsert, state])
    const onBack = () => {
        onInsert(null)
        history.push('/upload')
    }
    const onPreview = (event: React.MouseEvent) => {
        // ! THIS METHOD IS ONLY IN THE DEBUGGER !
        // ! Trigger: [Shift Key] + [Click] !
        // see https://mdn.io/shiftKey
        if (!event.shiftKey) {
            return
        }
        const link = `https://arweave.net/${state.landingTxID}`
        open(state.key ? `${link}#${state.key}` : link)
    }
    return (
        <Grid container className={classes.container}>
            <Grid item>
                <img src="https://via.placeholder.com/96x120" onClick={onPreview} />
            </Grid>
            <Grid item>
                <FileName name={state.name} />
                <Typography className={classes.meta}>
                    <p className={classes.info}>
                        <span>{formatFileSize(state.size)}</span>
                        <span>&nbsp;&nbsp;</span>
                        <span>{formatDateTime(state.createdAt)}</span>
                    </p>
                    <Button className={classes.back} onClick={onBack}>
                        Change File
                    </Button>
                </Typography>
            </Grid>
        </Grid>
    )
}
