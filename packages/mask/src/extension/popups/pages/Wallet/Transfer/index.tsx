import { NetworkPluginID } from '@masknet/shared-base'
import { MaskTextField, makeStyles } from '@masknet/theme'
import {
    useAccount,
    useBalance,
    useChainContext,
    useFungibleTokenBalance,
    useNativeTokenAddress,
    useWallets,
} from '@masknet/web3-hooks-base'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Box, Typography, useTheme } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    root: {
        overflowX: 'hidden',
        height: '100%',
    },
    page: {
        position: 'relative',
        height: '100%',
        overflow: 'auto',
    },
    to: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 700,
        marginRight: 16,
    },
    receiverPanel: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '16px',
    },
    input: {
        flex: 1,
    },
    save: {
        color: theme.palette.maskColor.primary,
        marginRight: 4,
    },
    endAdornment: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
}))

const Transfer = memo(function Transfer() {
    const location = useLocation()
    const { t } = useI18N()
    const { classes } = useStyles()
    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM)
    const address = useParams().address || nativeTokenAddress
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isNativeToken = !address || isNativeTokenAddress(address)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const [receiver, setReceiver] = useState('')
    const theme = useTheme()

    const { data: nativeTokenBalance = '0' } = useBalance(NetworkPluginID.PLUGIN_EVM)
    const { data: erc20Balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address)
    const balance = isNativeToken ? nativeTokenBalance : erc20Balance

    const otherWallets = useMemo(
        () => wallets.map((wallet) => ({ name: wallet.name ?? '', address: wallet.address })),
        [wallets],
    )

    useTitle(t('popups_send'))

    return (
        <div className={classes.root}>
            <Box className={classes.page}>
                <Box padding={2} className={classes.receiverPanel}>
                    <Typography className={classes.to}>{t('popups_wallet_transfer_to')}</Typography>
                    <MaskTextField
                        placeholder={t('wallet_transfer_placeholder')}
                        value={receiver}
                        onChange={(ev) => setReceiver(ev.target.value)}
                        wrapperProps={{ className: classes.input }}
                        InputProps={{
                            endAdornment: (
                                <div className={classes.endAdornment}>
                                    <Typography className={classes.save}>{t('save')}</Typography>
                                    <Icons.AddUser size={18} color={theme.palette.maskColor.second} />
                                </div>
                            ),
                        }}
                    />
                </Box>
            </Box>
        </div>
    )
})

export default Transfer
