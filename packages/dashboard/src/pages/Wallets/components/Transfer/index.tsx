import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { makeStyles, Box } from '@material-ui/core'
import { MaskColorVar, useTabs } from '@masknet/theme'

const useStyles = makeStyles((theme) => ({
    caption: {
        paddingRight: theme.spacing(2.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${MaskColorVar.lineLighter}`,
    },
}))

export const Transfer = memo(() => {
    const classes = useStyles()

    const tabs = useTabs(
        'Tokens',
        { token: 'Token' },
        {
            token: <></>,
        },
    )

    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <Box className={classes.caption}>{tabs}</Box>
        </ContentContainer>
    )
})
