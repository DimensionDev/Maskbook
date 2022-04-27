import { useState, useCallback, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import {
    ChainId,
    ERC721ContractDetailed,
    EthereumTokenType,
    isSameAddress,
    SocketState,
    useAccount,
    useCollections,
    useERC721ContractBalance,
} from '@masknet/web3-shared-evm'
import classNames from 'classnames'
import { EthereumAddress } from 'wallet.ts'
import { Box, CircularProgress, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { SelectNftContractDialogEvent, WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'

interface StyleProps {
    hasIcon: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => {
    return {
        root: {
            height: 52,
            border: `1px solid ${theme.palette.mode === 'light' ? '#EBEEF0' : '#2F3336'}`,
            borderRadius: 12,
            padding: theme.spacing(0.8, 1.2, 1),
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
        },
        balance: {},
        title: {},
        wrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
        },
        icon: {
            height: 24,
            width: 24,
            borderRadius: 500,
        },
        tokenWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        nftName: {
            marginLeft: theme.spacing(props.hasIcon ? 1 : 0),
            fontWeight: 300,
            pointerEvents: 'none',
            fontSize: 16,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        expandIcon: {
            color: theme.palette.text.primary,
        },
        pointer: {
            cursor: 'pointer',
        },
    }
})

export interface ERC721TokenSelectPanelProps {
    label?: string
    chainId?: ChainId
    onContractChange: (contract: ERC721ContractDetailed) => void
    onBalanceChange?: (balance: number) => void
    contract: ERC721ContractDetailed | null | undefined
}
export function ERC721ContractSelectPanel(props: ERC721TokenSelectPanelProps) {
    const { onContractChange, onBalanceChange, contract, label, chainId = ChainId.Mainnet } = props
    const account = useAccount()
    const { classes } = useStyles({ hasIcon: Boolean(contract?.iconURL) })
    const { value: balanceFromChain, loading: loadingFromChain } = useERC721ContractBalance(contract?.address, account)
    const { data: assets, state: loadingBalanceFromRemoteState } = useCollections(account, chainId, !!contract)

    const convertedAssets = assets.map((x) => ({
        contractDetailed: {
            type: EthereumTokenType.ERC721,
            address: x.address,
            chainId,
            name: x.name,
            symbol: x.symbol,
            baseURI: x.iconURL,
            iconURL: x.iconURL,
        } as ERC721ContractDetailed,
        balance: x.balance,
    }))

    const { t } = useI18N()

    const balanceFromRemote = convertedAssets
        ? convertedAssets.find((asset) => isSameAddress(asset.contractDetailed.address, contract?.address))?.balance
        : undefined

    const balance = balanceFromChain ? Number(balanceFromChain) : balanceFromRemote ?? 0

    useEffect(() => {
        onBalanceChange?.(balance)
    }, [onBalanceChange, balance])

    const loading = (loadingFromChain || loadingBalanceFromRemoteState !== SocketState.done) && !balance

    // #region select contract
    const [id] = useState(uuid)

    const { setDialog: setNftContractDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        useCallback(
            (ev: SelectNftContractDialogEvent) => {
                if (ev.open || !ev.contract || ev.uuid !== id) return
                onContractChange(ev.contract)
            },
            [id, onContractChange],
        ),
    )

    const openDialog = useCallback(() => {
        setNftContractDialog({
            open: true,
            chainId,
            uuid: id,
        })
    }, [setNftContractDialog, uuid, chainId])
    // #endregion

    return (
        <Box className={classes.root}>
            <div className={classes.wrapper}>
                <Typography className={classes.title} color="textSecondary" variant="body2" component="span">
                    {label ?? t('collectibles_name')}
                </Typography>
                {!contract?.address || !EthereumAddress.isValid(contract.address) ? null : loading ? (
                    <CircularProgress size={16} />
                ) : (
                    <Typography className={classes.title} color="textSecondary" variant="body2" component="span">
                        {t('wallet_balance')}: {balance ? balance : '0'}
                    </Typography>
                )}
            </div>
            <div className={classNames(classes.wrapper, classes.pointer)} onClick={openDialog}>
                <div className={classes.tokenWrapper}>
                    {contract?.iconURL ? <img className={classes.icon} src={contract?.iconURL} /> : null}
                    {contract?.name ? (
                        <Typography className={classes.nftName} color="textPrimary">
                            {contract?.name}
                        </Typography>
                    ) : null}
                </div>
                <ExpandMoreIcon className={classes.expandIcon} />
            </div>
        </Box>
    )
}
