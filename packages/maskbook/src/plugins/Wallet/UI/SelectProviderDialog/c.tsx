import { memo } from 'react'
import { Box, Typography, List, ListItem, makeStyles, createStyles } from '@material-ui/core'
import { PolkaDotIcon, WalletConnectIcon, MetaMaskIcon } from '@dimensiondev/icons'
import { ConnectActionList, ConnectActionListItem } from '../ConnectActionList'
import { Image } from '../../../../maskbook/src/components/shared/Image'
import { useDashboardI18N } from '../../locales'
export enum ConnectWalletTargets {
    MetaMask,
    Connect,
    PolkaDot,
}
export interface ConnectWalletListProps {
    onConnect(target: ConnectWalletTargets): void
}

const useStyles = makeStyles((theme) =>
    createStyles({
        stepTitle: {
            fontSize: 16,
        },
        network: {
            position: 'relative',
        },
    }),
)
export const ConnectWalletList = memo(({ onConnect }: ConnectWalletListProps) => {
    const classes = useStyles()
    const t = useDashboardI18N()

    return (
        <Box>
            <Box>
                <Typography className={classes.stepTitle} variant="h2" component="h2">
                    1.Choose Network
                </Typography>
                <List>
                    <ListItem className={classes.network}>
                        <Image src={new URL('./ethereum.png', import.meta.url).toString()}></Image>
                    </ListItem>
                    <ListItem className={classes.network}>
                        <Image src={new URL('./binance.png', import.meta.url).toString()}></Image>
                    </ListItem>
                </List>
            </Box>
            <Box>
                <Typography className={classes.stepTitle} variant="h2" component="h2">
                    2.Choose Wallet
                </Typography>

                <ConnectActionList>
                    <ConnectActionListItem
                        title={t.wallets_connect_wallet_metamask()}
                        icon={<MetaMaskIcon fontSize="inherit" />}
                        onClick={() => onConnect(ConnectWalletTargets.MetaMask)}
                    />
                    <ConnectActionListItem
                        title={t.wallets_connect_wallet_connect()}
                        icon={<WalletConnectIcon fontSize="inherit" />}
                        onClick={() => onConnect(ConnectWalletTargets.Connect)}
                    />
                    <ConnectActionListItem
                        title={t.wallets_connect_wallet_polka()}
                        icon={<PolkaDotIcon fontSize="inherit" />}
                        onClick={() => onConnect(ConnectWalletTargets.PolkaDot)}
                    />
                </ConnectActionList>
            </Box>
        </Box>
    )
})
