import React from 'react'
import { makeStyles, Grid, FormControlLabel, Checkbox, Typography } from '@material-ui/core'
import { UploadDropArea } from './UploadDropArea'
import { MAX_FILE_SIZE } from '../constants'
import { RecentFiles } from './RecentFiles'

const LEGAL_TERMS = (
    <a target="_blank" href="https://legal.maskbook.com/arweave/file-service/plugin-terms.html">
        terms
    </a>
)
const LEGAL_POLICY = (
    <a target="_blank" href="https://legal.maskbook.com/arweave/file-service/privacy-policy-uploader.html">
        privacy policy
    </a>
)

const useStyles = makeStyles({
    encrypted: {
        userSelect: 'none',
        '& span': {
            fontSize: 12,
            lineHeight: 1.75,
            color: '#3B3B3B',
        },
    },
    legal: {
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        '& p': {
            fontSize: 12,
            lineHeight: 1.75,
            color: '#3B3B3B',
        },
        '& a': {
            color: '#2CA4EF',
            textDecoration: 'none',
        },
    },
})

export const UploadArea: React.FC = () => {
    const classes = useStyles()
    const [encrypted, setEncrypted] = React.useState(true)
    const onFile = (file: File) => {
        console.log(file)
    }
    return (
        <Grid container>
            <Grid item xs={8}>
                <UploadDropArea maxFileSize={MAX_FILE_SIZE} onFile={onFile} />
            </Grid>
            <Grid item xs={4}>
                <RecentFiles files={[{ id: '11', name: 'sample.txt', createdAt: new Date() }]} />
            </Grid>
            <Grid item xs={4}>
                <FormControlLabel
                    control={<Checkbox checked={encrypted} onChange={(event, checked) => setEncrypted(checked)} />}
                    className={classes.encrypted}
                    label="Make it encrypted"
                />
            </Grid>
            <Grid item className={classes.legal}>
                <Typography>
                    By using this plugin, you agree to the {LEGAL_TERMS} and the {LEGAL_POLICY}.
                </Typography>
            </Grid>
        </Grid>
    )
}
