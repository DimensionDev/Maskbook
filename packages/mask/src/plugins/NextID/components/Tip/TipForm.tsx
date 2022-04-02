import { useWeb3State } from '@masknet/plugin-infra'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { ChainId, useAccount, useChainId } from '@masknet/web3-shared-evm'
import {
    Box,
    BoxProps,
    Button,
    FormControl,
    FormControlLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Typography,
} from '@mui/material'
import classnames from 'classnames'
import { FC, memo, useRef } from 'react'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { TargetChainIdContext, useTip, useTipValidate } from '../../contexts'
import { useI18N } from '../../locales'
import { TipType } from '../../types'
import { NFTSection } from './NFTSection'
import { TokenSection } from './TokenSection'

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
        actionButton: {
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
        controls: {
            marginTop: theme.spacing(1),
            display: 'flex',
            flexDirection: 'row',
        },
        addButton: {
            marginLeft: 'auto',
        },
        tokenField: {
            marginTop: theme.spacing(2),
        },
    }
})

interface Props extends BoxProps {
    onAddToken?(): void
}

export const TipForm: FC<Props> = memo(({ className, onAddToken, ...rest }) => {
    const t = useI18N()
    const currentChainId = useChainId()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { classes } = useStyles()
    const {
        recipient,
        recipients: recipientAddresses,
        setRecipient,
        isSending,
        sendTip,
        tipType,
        setTipType,
    } = useTip()
    const [isValid, validateMessage] = useTipValidate()
    const { Utils } = useWeb3State()
    const selectRef = useRef(null)
    const account = useAccount()
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const buttonLabel = isSending ? t.sending_tip() : isValid || !validateMessage ? t.send_tip() : validateMessage
    const enabledNft =
        !isSending &&
        chainId === currentChainId &&
        [ChainId.Mainnet, ChainId.BSC, ChainId.Matic].includes(currentChainId)

    return (
        <Box className={classnames(classes.root, className)} {...rest}>
            <div className={classes.main}>
                <Typography>{t.tip_to()}</Typography>

                <FormControl fullWidth>
                    <Select
                        ref={selectRef}
                        value={recipient}
                        disabled={isSending}
                        onChange={(e) => {
                            setRecipient(e.target.value)
                        }}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'center',
                            },
                            container: selectRef.current,
                            anchorEl: selectRef.current,
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
                <FormControl className={classes.controls}>
                    <RadioGroup row value={tipType} onChange={(e) => setTipType(e.target.value as TipType)}>
                        <FormControlLabel
                            disabled={isSending}
                            value={TipType.Token}
                            control={<Radio />}
                            label={t.tip_type_token()}
                        />
                        <FormControlLabel
                            disabled={!enabledNft}
                            value={TipType.NFT}
                            control={<Radio />}
                            label={t.tip_type_nft()}
                        />
                    </RadioGroup>
                    {tipType === TipType.NFT ? (
                        <Button variant="text" className={classes.addButton} onClick={onAddToken}>
                            {t.tip_add_collectibles()}
                        </Button>
                    ) : null}
                </FormControl>
                {tipType === TipType.Token ? (
                    <FormControl className={classes.tokenField}>
                        <TokenSection />
                    </FormControl>
                ) : (
                    <NFTSection />
                )}
            </div>
            {account ? (
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
                        className={classes.actionButton}
                        fullWidth
                        disabled={!isValid || isSending}
                        onClick={sendTip}>
                        {buttonLabel}
                    </ActionButton>
                </EthereumChainBoundary>
            ) : (
                <ActionButton
                    variant="contained"
                    size="large"
                    className={classes.actionButton}
                    fullWidth
                    onClick={openSelectProviderDialog}>
                    {t.tip_connect_wallet()}
                </ActionButton>
            )}
        </Box>
    )
})
