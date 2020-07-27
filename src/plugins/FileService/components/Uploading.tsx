import { Grid, makeStyles } from '@material-ui/core'
import React from 'react'
import { useHistory, useLocation } from 'react-router'
import { useAsync, useBeforeUnload } from 'react-use'
import Services, { ServicesWithProgress } from '../../../extension/service'
import { pluginId } from '../constants'
import type { FileInfo } from '../types'
import { FileName } from './FileName'
import { ProgressBar } from './ProgressBar'

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
        textAlign: 'center',
        color: '#3B3B3B',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: 400,
    },
})

interface RouteState {
    key: string | undefined
    name: string
    size: number
    type: string
    block: Uint8Array
    checksum: string
}

export const Uploading: React.FC = () => {
    const history = useHistory()
    const [startedAt] = React.useState(Date.now())
    const [preparing, setPreparing] = React.useState(true)
    const [sendSize, setSendSize] = React.useState(0)
    const classes = useStyles()
    const { state } = useLocation<RouteState>()
    useBeforeUnload(true, 'uploading')
    useAsync(async () => {
        const payloadTxID = await Services.Plugin.invokePlugin(pluginId, 'makeAttachment', {
            key: state.key,
            block: state.block,
            type: state.type,
        })
        setPreparing(false)
        for await (const pctComplete of ServicesWithProgress.pluginArweaveUpload(payloadTxID)) {
            setSendSize(state.size * (pctComplete / 100))
        }
        const landingTxID = await Services.Plugin.invokePlugin(pluginId, 'uploadLandingPage', {
            name: state.name,
            size: state.size,
            txId: payloadTxID,
            type: state.type,
            key: state.key,
        })
        const item: FileInfo = {
            type: 'arweave',
            id: state.checksum,

            name: state.name,
            size: state.size,
            createdAt: new Date(startedAt),
            key: state.key,
            payloadTxID: payloadTxID,
            landingTxID: landingTxID,
        }
        await Services.Plugin.invokePlugin(pluginId, 'setFileInfo', item)
        history.push('/uploaded', item)
    }, [])
    return (
        <Grid container className={classes.container}>
            <Grid item>
                <img src="https://via.placeholder.com/96x120" />
            </Grid>
            <Grid item>
                <FileName name={state.name} />
                <ProgressBar preparing={preparing} fileSize={state.size} sendSize={sendSize} startedAt={startedAt} />
            </Grid>
        </Grid>
    )
}
