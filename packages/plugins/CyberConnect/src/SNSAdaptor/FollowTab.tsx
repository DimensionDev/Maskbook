import { useState } from 'react'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from 'boring-avatars'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import type { IFollowIdentity } from '../Worker/apis'

const useStyles = makeStyles()((theme) => ({
    tabContext: {
        marginTop: '20px',
    },
    tabPanel: {
        height: '400px',
        overflow: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    followRow: { display: 'flex', alignItems: 'center', height: '60px', overflow: 'hidden', textOverflow: 'ellipsis' },
    avatarWrapper: { svg: { borderRadius: '100%' } },
    user: { marginLeft: '20px' },
    userName: { fontSize: '16px' },
    namespace: { opacity: 0.6, fontSize: '12px' },
}))
export default function FollowTab({
    followingList,
    followerList,
}: {
    followingList: IFollowIdentity[]
    followerList: IFollowIdentity[]
}) {
    const { classes } = useStyles()
    const [tab, setTab] = useState('1')
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue)
    }
    const FollowRow = ({ identity }: { identity: IFollowIdentity }) => {
        return (
            <div className={classes.followRow}>
                <div className={classes.avatarWrapper}>
                    <Avatar square={false} name={identity.ens || identity.address} size={40} />
                </div>
                <div className={classes.user}>
                    <Typography className={classes.userName} component="div">
                        {identity.ens || formatEthereumAddress(identity.address, 16)}
                    </Typography>
                    <Typography className={classes.namespace} component="div">
                        From {identity.namespace}
                    </Typography>
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
                        color: 'black',
                        fontSize: '18px',
                        ' .MuiTabs-indicator': {
                            backgroundColor: 'black',
                            height: '3px',
                        },
                        ' .Mui-selected': {
                            color: 'black !important',
                            opacity: 1,
                        },
                        ' .MuiTab-textColorPrimary': {
                            color: 'black !important',
                            fontSize: '18px',
                            textAlign: 'center',
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
                sx={{
                    color: 'black',
                    width: '100%',
                    boxSizing: 'border-box',
                }}>
                {followingList.map((f: IFollowIdentity) => {
                    return <FollowRow key={f.address} identity={f} />
                })}
            </TabPanel>
            <TabPanel
                className={classes.tabPanel}
                value="2"
                sx={{
                    color: 'black',
                    width: '100%',
                    boxSizing: 'border-box',
                }}>
                {followerList.map((f: IFollowIdentity) => {
                    return <FollowRow key={f.address} identity={f} />
                })}
            </TabPanel>
        </TabContext>
    )
}
