import { makeStyles } from '@masknet/theme'
import type { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { List, ListItem, ListItemText, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'

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
            <List dense>
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
                        secondary={<img src={identity?.avatar} style={{ maxWidth: 100 }} />}
                    />
                </ListItem>
            </List>
        )
    }

    const renderAddressNames = () => {
        return (
            <List dense>
                {socialAddressList?.map((x) => (
                    <ListItem key={`${x.type}_${x.address}`}>
                        <ListItemText
                            primary={<Typography color="textPrimary">{x.type}</Typography>}
                            secondary={x.address}
                        />
                    </ListItem>
                ))}
            </List>
        )
    }

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Profile Data
                            </Typography>
                        </TableCell>
                        <TableCell>{renderIdentity()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Found Address Names
                            </Typography>
                        </TableCell>
                        <TableCell>{renderAddressNames()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    )
}
