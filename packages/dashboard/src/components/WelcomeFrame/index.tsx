import { memo } from 'react'
import { Grid } from '@mui/material'
import Spline from '@splinetool/react-spline'
import { Welcome } from '../../assets/index.js'

export const WelcomeFrame = memo(() => {
    return (
        <Grid container>
            <Grid item xs={4}>
                <Spline scene={Welcome.toString()} />
            </Grid>
        </Grid>
    )
})
