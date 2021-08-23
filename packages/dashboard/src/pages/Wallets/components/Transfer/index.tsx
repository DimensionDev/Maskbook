import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { Box, Tab } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar, useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'

const useStyles = makeStyles()((theme) => ({
    caption: {
        paddingRight: theme.spacing(2.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${MaskColorVar.lineLighter}`,
    },
}))

export const Transfer = memo(() => {
    const { classes } = useStyles()
    const [currentTab, onChange, tabs] = useTabs('tokens')

    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <Box className={classes.caption}>
                <TabContext value={currentTab}>
                    <TabList onChange={onChange}>
                        <Tab label="Token" value={tabs.tokens} />
                    </TabList>
                    <TabPanel value={tabs.tokens}>TBD</TabPanel>
                </TabContext>
            </Box>
        </ContentContainer>
    )
})
