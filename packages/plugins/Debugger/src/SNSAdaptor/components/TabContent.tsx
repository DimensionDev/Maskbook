import type { Plugin } from '@masknet/plugin-infra'
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material'

export interface TabContentProps {
    identity?: Plugin.SNSAdaptor.ProfileIdentity
    addressNames?: Plugin.SNSAdaptor.ProfileAddress[]
}

export function TabContent({ identity, addressNames }: TabContentProps) {
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
                <ListItem>
                    <ListItemText
                        primary={<Typography color="textPrimary">Avatar</Typography>}
                        secondary={
                            <Box>
                                <Typography color="textSecondary" variant="body2">
                                    {identity?.avatar}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    <img src={identity?.avatar} />
                                </Box>
                            </Box>
                        }
                    />
                </ListItem>
            </List>
        )
    }

    const renderAddressNames = () => {
        return (
            <List>
                {addressNames?.map((x) => (
                    <ListItem key={x.type}>
                        <ListItemText
                            primary={
                                <Typography color="textPrimary">
                                    {x.type}: {x.label}
                                </Typography>
                            }
                            secondary={x.resolvedAddress}
                        />
                    </ListItem>
                ))}
            </List>
        )
    }

    return (
        <>
            <Typography color="textPrimary" variant="h6">
                Identity
            </Typography>
            {renderIdentity()}

            <Typography color="textPrimary" variant="h6">
                Address Names
            </Typography>
            {renderAddressNames()}
        </>
    )
}
