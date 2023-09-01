import { memo } from 'react'
import { ButtonGroupTabList, makeStyles, useTabs } from '@masknet/theme'
import { Box, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { ContactsTable } from '../ContactsTable/index.js'
import { PostHistory } from '../PostHistory/index.js'
const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        height: '100%',
    },
    tab: {
        maxHeight: '100%',
        height: '100%',
        overflow: 'auto',
        padding: `${theme.spacing(3)} 0`,
    },
    tabs: {
        width: '288px',
    },
}))

export interface PersonaContentProps {
    network: string
}
export const PersonaContent = memo<PersonaContentProps>(({ network }) => {
    const { classes } = useStyles()
    const [currentTab, onChange, tabs] = useTabs('post', 'contacts')

    return (
        <Box className={classes.container}>
            <TabContext value={currentTab}>
                <ButtonGroupTabList
                    classes={{ root: classes.tabs }}
                    onChange={onChange}
                    aria-label="persona-post-contacts-button-group">
                    <Tab value={tabs.post} label="Posts" />
                    <Tab value={tabs.contacts} label="Contacts" />
                </ButtonGroupTabList>
                <TabPanel value={tabs.post} className={classes.tab}>
                    <PostHistory network={network} />
                </TabPanel>
                <TabPanel value={tabs.contacts} className={classes.tab}>
                    <ContactsTable network={network} />
                </TabPanel>
            </TabContext>
        </Box>
    )
})
