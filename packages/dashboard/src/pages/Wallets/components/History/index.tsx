import { Box } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { HistoryTable } from '../HistoryTable'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
})

export const History = memo(() => {
    const { classes } = useStyles()
    return (
        <ContentContainer
            sx={{ marginTop: 3, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100% - 114px)' }}>
            <Box className={classes.container}>
                <HistoryTable />
            </Box>
        </ContentContainer>
    )
})
