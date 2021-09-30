import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { HistoryTable } from '../HistoryTable'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '24px',
    },
})

export const History = memo(() => {
    const { classes } = useStyles()
    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <HistoryTable />
        </ContentContainer>
    )
})
