import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from 'boring-avatars'
const useStyles = makeStyles()((theme) => ({
    tabContext: {
        marginTop: '20px',
        background: '#000',
    },
    tabPanel: {
        height: '400px',
        overflow: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))
export default function FollowTab({ followingList, followerList }: { followingList: any; followerList: any }) {
    const { classes } = useStyles()
    const [tab, setTab] = useState('1')
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue)
    }

    return (
        <TabContext value={tab}>
            <Box sx={{ width: '100%', marginTop: '40px' }}>
                <TabList
                    sx={{
                        width: '100%',
                        background: '#000',
                        color: '#fff',
                        fontSize: '18px',
                        ' .MuiTabs-indicator': {
                            backgroundColor: '#fff',
                            height: '3px',
                        },
                    }}
                    onChange={handleChange}>
                    <Tab sx={{ width: '50%' }} label="Followers" value="1" />
                    <Tab sx={{ width: '50%' }} label="Followings" value="2" />
                </TabList>
            </Box>
            <TabPanel className={classes.tabPanel} value="1" sx={{ backgroundColor: '#000', color: '#fff' }}>
                {followingList.map((f: any) => {
                    return (
                        <div>
                            <Avatar />
                            {f.ens || f.address}
                        </div>
                    )
                })}
            </TabPanel>
            <TabPanel className={classes.tabPanel} value="2">
                {followerList.map((f: any) => {
                    return <div>{f.ens || f.address}</div>
                })}
            </TabPanel>
        </TabContext>
    )
}
