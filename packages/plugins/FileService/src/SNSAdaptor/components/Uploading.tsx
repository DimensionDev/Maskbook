import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { File } from 'react-feather'
import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { timeout } from '@dimensiondev/kit'
import { useNavigate, useLocation } from 'react-router-dom'
import { useI18N } from '../../locales/i18n_generated'
import { FileRouter } from '../../constants'
import type { FileInfo, Provider } from '../../types'
import { PluginFileServiceRPC, PluginFileServiceRPCGenerator } from '../../Worker/rpc'
import { useExchange } from '../hooks/Exchange'
import { FileName } from './FileName'
import { ProgressBar } from './ProgressBar'

const useStyles = makeStyles()({
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
    },
})

interface RouteState {
    key: string | undefined
    name: string
    size: number
    type: string
    block: Uint8Array
    checksum: string
    useCDN: boolean
    provider: Provider
}

export const Uploading: React.FC = () => {
    const t = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { onUploading } = useExchange()
    const [startedAt] = useState(Date.now())
    const [preparing, setPreparing] = useState(true)
    const [sendSize, setSendSize] = useState(0)
    const state = useLocation().state as RouteState
    const { error } = useAsync(async () => {
        const currentProvider = state.provider as Provider
        const payloadTxID = await timeout(
            PluginFileServiceRPC.makeAttachment(currentProvider, {
                name: state.name,
                key: state.key,
                block: state.block,
                type: state.type,
            }),
            60000, // = 1 minute
        )
        setPreparing(false)
        for await (const pctComplete of PluginFileServiceRPCGenerator.upload(currentProvider, payloadTxID)) {
            setSendSize(state.size * (pctComplete / 100))
        }
        const landingTxID = await timeout(
            PluginFileServiceRPC.uploadLandingPage(currentProvider, {
                name: state.name,
                size: state.size,
                txId: payloadTxID,
                type: state.type,
                key: state.key,
                useCDN: state.useCDN,
            }),
            300000, // = 5 minutes
        )
        const item: FileInfo = {
            type: 'file',
            provider: currentProvider,
            id: state.checksum,
            name: state.name,
            size: state.size,
            createdAt: new Date(startedAt),
            key: state.key,
            payloadTxID,
            landingTxID,
        }
        await PluginFileServiceRPC.setFileInfo(item)
        navigate(FileRouter.Uploaded, { state: item })
    }, [])
    useEffect(() => {
        onUploading(!error)
        return () => onUploading(false)
    }, [error, onUploading])
    if (error) {
        return (
            <Grid container className={classes.container}>
                <Grid item>
                    <File width={96} height={120} />
                </Grid>
                <Grid item>
                    <Typography>{t.signing_failed()}</Typography>
                </Grid>
            </Grid>
        )
    }
    return (
        <Grid container className={classes.container}>
            <Grid item>
                <File width={96} height={120} />
            </Grid>
            <Grid item sx={{ width: '100%' }}>
                <FileName name={state.name} />
                <ProgressBar preparing={preparing} fileSize={state.size} sendSize={sendSize} startedAt={startedAt} />
            </Grid>
        </Grid>
    )
}
