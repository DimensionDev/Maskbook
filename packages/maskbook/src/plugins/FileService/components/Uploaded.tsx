import { formatFileSize } from '@dimensiondev/kit'
import { Button, Grid, makeStyles, Typography } from '@material-ui/core'
import { useEffect } from 'react'
import { File } from 'react-feather'
import { useHistory, useLocation } from 'react-router'
import { useI18N } from '../../../utils/i18n-next-ui'
import { FileRouter } from '../constants'
import { useExchange } from '../hooks/Exchange'
import type { FileInfo } from '../types'
import { formatDateTime } from '../../../utils/date'
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
})

export const Uploaded: React.FC = () => {
    const { t } = useI18N()
    const classes = useStyles()
    const history = useHistory()
    const { onInsert } = useExchange()
    const { state } = useLocation<FileInfo>()
    useEffect(() => {
        onInsert(state)
    }, [onInsert, state])
    const onBack = () => {
        onInsert(null)
        history.replace(FileRouter.upload)
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
            <Grid item onClick={onPreview}>
                <File width={96} height={120} />
            </Grid>
            <Grid item>
                <FileName name={state.name} />
                <Typography component="section" className={classes.meta}>
                    <p className={classes.info}>
                        <span>{formatFileSize(state.size)}</span>
                        <span>{'  '}</span>
                        <span>{formatDateTime(state.createdAt)}</span>
                    </p>
                    <Button onClick={onBack} variant="contained">
                        {t('plugin_file_service_on_change_file')}
                    </Button>
                </Typography>
            </Grid>
        </Grid>
    )
}
