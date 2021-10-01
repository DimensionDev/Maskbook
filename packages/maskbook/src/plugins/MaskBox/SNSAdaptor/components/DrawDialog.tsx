import { useState } from 'react'
import { Box, DialogContent, Typography } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import { makeStyles } from '@masknet/theme'
import type { BoxInfo } from '../../type'
import { FormattedAddress, ProviderIcon } from '@masknet/shared'
import { formatEthereumAddress, useAccount, useProviderType } from '@masknet/web3-shared'

const useStyles = makeStyles()((theme) => ({
    main: {
        padding: theme.spacing(4),
    },
    caption: {
        textAlign: 'center',
    },
    body: {},
    value: {
        fontSize: 32,
        lineHeight: '40px',
        fontWeight: 'bold',
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    section: {
        padding: theme.spacing(2, 0),
        justifyContent: 'space-between',
    },
    title: {
        width: '50%',
    },
    content: {},
}))

export interface DrawDialogProps {
    open: boolean
    onClose: () => void
    boxInfo: BoxInfo
}

export function DrawDialog(props: DrawDialogProps) {
    const { classes } = useStyles()
    const { open, onClose, boxInfo } = props

    const account = useAccount()
    const providerType = useProviderType()
    const [count, setCount] = useState(0)

    return (
        <InjectedDialog title="Draw" open={open} onClose={onClose}>
            <DialogContent>
                <Box className={classes.main}>
                    <Box className={classes.caption}>
                        <Typography color="textPrimary">
                            <span className={classes.value}>0.12</span>
                            <span>ETH</span>
                        </Typography>
                        <Typography color="textPrimary">
                            <span>≈</span>
                            <span>$31.77</span>
                        </Typography>
                    </Box>
                    <Box className={classes.body}>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Mystery Boxes:
                            </Typography>
                            <span className={classes.content}></span>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Quantity Limit:
                            </Typography>
                            <Typography className={classes.content} color="textPrimary">
                                {boxInfo.personalLimit}
                            </Typography>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Current Wallet:
                            </Typography>
                            <Box className={classes.content} display="flex" alignItems="center">
                                <ProviderIcon size={16} providerType={providerType} />
                                <Typography color="textPrimary" sx={{ marginLeft: 1 }}>
                                    <FormattedAddress address={account} size={6} />
                                </Typography>
                            </Box>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Available:
                            </Typography>
                            <span className={classes.content}></span>
                        </Box>
                        <Box className={classes.section} display="flex" alignItems="center">
                            <Typography className={classes.title} color="textPrimary">
                                Gas Fee:
                            </Typography>
                            <Box className={classes.content}></Box>
                        </Box>
                    </Box>
                </Box>

                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary amount="0">
                        <ActionButton size="medium" fullWidth variant="contained">
                            Draw
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </DialogContent>
        </InjectedDialog>
    )
}
