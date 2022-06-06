import { useBalance, useBlockNumber } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import type { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material'

export interface TabContentProps {
    identity?: SocialIdentity
    socialAddressList?: Array<SocialAddress<NetworkPluginID>>
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function TabContent({ identity, socialAddressList }: TabContentProps) {
    const { classes } = useStyles()

    const renderIdentity = () => {
        return (
            <List>
                <ListItem>
                    <ListItemText
                        primary={<Typography color="textPrimary">Nickname</Typography>}
                        secondary={identity?.nickname}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography color="textPrimary">Bio</Typography>}
                        secondary={identity?.bio}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={<Typography color="textPrimary">Home Page</Typography>}
                        secondary={identity?.homepage}
                    />
                </ListItem>
                <ListItem sx={{ display: 'block' }}>
                    <ListItemText
                        primary={<Typography color="textPrimary">Avatar</Typography>}
                        secondary={identity?.avatar}
                    />
                    <Box sx={{ mt: 1 }}>
                        <img src={identity?.avatar} />
                    </Box>
                </ListItem>
            </List>
        )
    }

    const renderAddressNames = () => {
        return (
            <List>
                {socialAddressList?.map((x) => (
                    <ListItem key={x.type}>
                        <ListItemText
                            primary={
                                <Typography color="textPrimary">
                                    {x.type}: {x.label}
                                </Typography>
                            }
                            secondary={x.address}
                        />
                    </ListItem>
                ))}
            </List>
        )
    }

    const { value: balance = '0' } = useBalance()
    const { value: blockNumber = 0 } = useBlockNumber()

    return (
        <section className={classes.container}>
            <Typography color="textPrimary" variant="h6">
                Balance {balance} <br />
                BlockNumber {blockNumber} <br />
            </Typography>

            <Typography color="textPrimary" variant="h6">
                Identity
            </Typography>
            {renderIdentity()}

            <Typography color="textPrimary" variant="h6">
                Social Address List
            </Typography>
            {renderAddressNames()}
        </section>
    )
}
