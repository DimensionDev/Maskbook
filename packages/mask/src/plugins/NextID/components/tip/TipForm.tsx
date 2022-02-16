import { useWeb3State } from '@masknet/plugin-infra'
import { SelectTokenDialogEvent, WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { EthereumTokenType, useFungibleTokenBalance } from '@masknet/web3-shared-evm'
import { Box, FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Select, Typography } from '@mui/material'
import { FC, memo, useCallback, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'
import { useTip } from '../../contexts'
import { TipType } from '../../types'
import { NFTSection } from './NFTSection'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
        },
        button: {
            marginTop: theme.spacing(1.5),
        },
    }
})

export const TipForm: FC = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const {
        recipient,
        recipients: recipientAddresses,
        tipType,
        setTipType,
        setRecipient,
        token,
        setToken,
        amount,
        setAmount,
        sendTip,
    } = useTip()
    const { Utils } = useWeb3State()
    const selectRef = useRef(null)
    const [id] = useState(uuid)
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken: false,
            FungibleTokenListProps: {
                selectedTokens: token ? [token.address] : [],
            },
        })
    }, [id, token?.address])
    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        token?.type || EthereumTokenType.Native,
        token?.address || '',
    )
    // #endregion

    return (
        <Box className={classes.root}>
            <Typography>To</Typography>

            <FormControl fullWidth>
                <Select
                    ref={selectRef}
                    value={recipient}
                    onChange={(e) => {
                        setRecipient(e.target.value)
                    }}
                    MenuProps={{
                        anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'center',
                        },
                        container: selectRef.current,
                        BackdropProps: {
                            invisible: true,
                        },
                    }}>
                    {recipientAddresses.map((address) => (
                        <MenuItem key={address} value={address}>
                            {Utils?.formatDomainName?.(address) || address}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl>
                <RadioGroup
                    row
                    value={tipType}
                    onChange={(e) => {
                        setTipType(e.target.value as TipType)
                    }}>
                    <FormControlLabel value={TipType.Token} control={<Radio />} label={t('plugin_tip_token')} />
                    <FormControlLabel value={TipType.NFT} control={<Radio />} label={t('plugin_tip_nft')} />
                </RadioGroup>
            </FormControl>
            {tipType === TipType.Token ? (
                <FormControl>
                    <TokenAmountPanel
                        label="Token"
                        token={token}
                        amount={amount}
                        onAmountChange={setAmount}
                        balance={tokenBalance}
                        SelectTokenChip={{
                            loading: loadingTokenBalance,
                            ChipProps: {
                                onClick: onSelectTokenChipClick,
                            },
                        }}
                    />
                </FormControl>
            ) : (
                <NFTSection />
            )}

            <EthereumWalletConnectedBoundary>
                <ActionButton
                    variant="contained"
                    size="large"
                    className={classes.button}
                    fullWidth
                    disabled={false}
                    onClick={sendTip}>
                    {t('plugin_tip_send')}
                </ActionButton>
            </EthereumWalletConnectedBoundary>
        </Box>
    )
})
