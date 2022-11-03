import { makeStyles } from '@masknet/theme'
import type { SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'
import { useSocialAccountsAll } from '@masknet/web3-hooks-base'
import { List, ListItem, ListItemText, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'

export interface TabContentProps {
    identity?: SocialIdentity
    socialAccount?: SocialAccount
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function TabContent({ identity, socialAccount }: TabContentProps) {
    const { classes } = useStyles()
    const { value: socialAccounts, loading: loadingSocialAccounts } = useSocialAccountsAll(identity)

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

    const renderAddressName = () => {
        return (
            <List dense>
                {socialAccount &&
                    [socialAccount].map((x) => (
                        <ListItem key={`${x.pluginID}_${x.address}`}>
                            <ListItemText
                                primary={
                                    <Typography color="textPrimary">
                                        {x.pluginID} - {x.label}
                                    </Typography>
                                }
                                secondary={x.address}
                            />
                        </ListItem>
                    ))}
            </List>
        )
    }

    const renderAllAddressNames = () => {
        if (loadingSocialAccounts)
            return (
                <List dense>
                    <ListItem>
                        <ListItemText primary={<Typography color="textPrimary">Loading...</Typography>} />
                    </ListItem>
                </List>
            )
        return (
            <List dense>
                {socialAccounts?.map((x) => (
                    <ListItem key={`${x.pluginID}_${x.address}`}>
                        <ListItemText
                            primary={
                                <Typography color="textPrimary">
                                    {x.pluginID} - {x.label}
                                </Typography>
                            }
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
                                Address Name
                            </Typography>
                        </TableCell>
                        <TableCell>{renderAddressName()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                All Address Names
                            </Typography>
                        </TableCell>
                        <TableCell>{renderAllAddressNames()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    )
}
