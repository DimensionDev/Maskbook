import { useWeb3State } from '@masknet/plugin-infra'
import { SelectTokenDialogEvent, WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { EthereumTokenType, useFungibleTokenBalance } from '@masknet/web3-shared-evm'
import {
    Box,
    BoxProps,
    FormControl,
    FormControlLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Typography,
} from '@mui/material'
import classnames from 'classnames'
import { FC, memo, useCallback, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'
import { TargetChainIdContext, useTip, useTipValidate } from '../../contexts'
import { useI18N } from '../../locales'
import { TipType } from '../../types'
import { NFTSection } from './NFTSection'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
        },
        main: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
        },
        tipButton: {
            marginTop: theme.spacing(1.5),
            fontSize: 16,
        },
        button: {
            width: '100%',
            fontSize: 16,
            lineHeight: '22px',
            fontWeight: 600,
            padding: '10px 0',
            borderRadius: 24,
            height: 'auto',
            marginTop: theme.spacing(1.5),
        },
        disabledButton: {
            fontSize: 16,
            lineHeight: '22px',
            fontWeight: 600,
            padding: '10px 0',
            borderRadius: 24,
            height: 'auto',
        },
    }
})

interface Props extends BoxProps {}

export const TipForm: FC<Props> = memo((props) => {
    const t = useI18N()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
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
        isSending,
        sendTip,
    } = useTip()
    const [isValid, validateMessage] = useTipValidate()
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
    const buttonLabel = isSending ? t.sending_tip() : isValid || !validateMessage ? t.send_tip() : validateMessage

    return (
        <Box {...props} className={classnames(classes.root, props.className)}>
            <div className={classes.main}>
                <Typography>{t.tip_to()}</Typography>

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
                        <FormControlLabel value={TipType.Token} control={<Radio />} label={t.tip_type_token()} />
                        <FormControlLabel value={TipType.NFT} control={<Radio />} label={t.tip_type_nft()} />
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
            </div>

            <EthereumChainBoundary
                chainId={chainId}
                noSwitchNetworkTip
                disablePadding
                ActionButtonPromiseProps={{
                    fullWidth: true,
                    classes: { root: classes.button, disabled: classes.disabledButton },
                    color: 'primary',
                }}>
                <ActionButton
                    variant="contained"
                    size="large"
                    className={classes.tipButton}
                    fullWidth
                    disabled={!isValid || isSending}
                    onClick={sendTip}>
                    {buttonLabel}
                </ActionButton>
            </EthereumChainBoundary>
        </Box>
    )
})
