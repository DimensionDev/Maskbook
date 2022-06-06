import { useAccount, useBalance, useBlockNumber, useWeb3Connection, useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import type { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { useTokenConstants } from '@masknet/web3-shared-evm'
import { Box, Button, List, ListItem, ListItemText, Table, TableCell, TableRow, Typography } from '@mui/material'
import { useCallback } from 'react'

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

    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const { Others } = useWeb3State()
    const account = useAccount()
    const { value: balance = '0' } = useBalance()
    const { value: blockNumber = 0 } = useBlockNumber()
    const connection = useWeb3Connection()
    const onTransferCallback = useCallback(() => {
        if (!NATIVE_TOKEN_ADDRESS) return
        return connection.transferFungibleToken(
            NATIVE_TOKEN_ADDRESS,
            '0x790116d0685eB197B886DAcAD9C247f785987A4a',
            '100',
        )
    }, [connection])

    const onPersonaSign = useCallback(async () => {
        const signed = await connection.signMessage('hello world', 'personalSign')
        window.alert(`Signed: ${signed}`)
    }, [connection])

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableRow>
                    <TableCell>
                        <Typography variant="body2">Balance of {Others?.formatAddress(account, 4)}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">{balance}</Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Typography variant="body2">Block Number</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">{blockNumber}</Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Typography variant="body2">Native Token Transfer</Typography>
                    </TableCell>
                    <TableCell>
                        <Button size="small" onClick={onTransferCallback}>
                            Transfer
                        </Button>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Typography variant="body2">Sign Message</Typography>
                    </TableCell>
                    <TableCell>
                        <Button size="small" onClick={onPersonaSign}>
                            Sign Message
                        </Button>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Typography variant="body2">Identity</Typography>
                    </TableCell>
                    <TableCell>{renderIdentity()}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <Typography variant="body2">Social Address List</Typography>
                    </TableCell>
                    <TableCell>{renderAddressNames()}</TableCell>
                </TableRow>
            </Table>
        </section>
    )
}
