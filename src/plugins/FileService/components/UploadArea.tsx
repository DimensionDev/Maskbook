import React from 'react'
import { Grid } from '@material-ui/core'
import { UploadDropArea } from './UploadDropArea'
import { MAX_FILE_SIZE } from '../constants'
import { RecentFiles } from './RecentFiles'

export const UploadArea: React.FC = () => {
    const onFile = (file: File) => {
        console.log(file)
    }
    return (
        <Grid container>
            <Grid item xs={8}>
                <UploadDropArea maxFileSize={MAX_FILE_SIZE} onFile={onFile} />
            </Grid>
            <Grid item xs={4}>
                <RecentFiles />
            </Grid>
        </Grid>
    )
}
