import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from 'boring-avatars'
import { shortenAddress } from '../utils/helper'
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
    followRow: { display: 'flex', alignItems: 'center', height: '60px', paddingLeft: '20px' },
    avatarWrapper: { svg: { borderRadius: '100%' } },
    user: { marginLeft: '20px' },
    userName: { fontSize: '16px' },
    namespace: { opacity: 0.6, fontSize: '12px' },
}))
export default function FollowTab({ followingList, followerList }: { followingList: any; followerList: any }) {
    const { classes } = useStyles()
    const [tab, setTab] = useState('1')
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue)
    }
    const FollowRow = ({ identity }: { identity: any }) => {
        return (
            <div className={classes.followRow}>
                <div className={classes.avatarWrapper}>
                    <Avatar square={false} name={identity.ens || identity.address} size={40} />
                </div>
                <div className={classes.user}>
                    <div className={classes.userName}>{identity.ens || shortenAddress(identity.address, 16)}</div>
                    <div className={classes.namespace}>From {identity.namespace}</div>
                </div>
            </div>
        )
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
                        ' .Mui-selected': {
                            color: '#fff !important',
                            opacity: 1,
                        },
                        ' .MuiTab-textColorPrimary': {
                            color: '#fff',
                            fontSize: '18px',
                            paddingLeft: '50px',
                            alignItems: 'flex-start',
                            fontWeight: 'normal',
                        },
                    }}
                    onChange={handleChange}>
                    <Tab sx={{ width: '50%', height: '60px' }} label="Followings" value="1" />
                    <Tab sx={{ width: '50%', height: '60px' }} label="Followers" value="2" />
                </TabList>
            </Box>
            <TabPanel
                className={classes.tabPanel}
                value="1"
                sx={{ backgroundColor: '#000', color: '#fff', width: '100%' }}>
                {followingList.map((f: any) => {
                    return <FollowRow key={f.address} identity={f} />
                })}
            </TabPanel>
            <TabPanel
                className={classes.tabPanel}
                value="2"
                sx={{ backgroundColor: '#000', color: '#fff', width: '100%' }}>
                {followerList.map((f: any) => {
                    return <FollowRow key={f.address} identity={f} />
                })}
            </TabPanel>
        </TabContext>
    )
}
