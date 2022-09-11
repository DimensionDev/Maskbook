import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import classNames from 'classnames'
import { EthereumAddress } from 'wallet.ts'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { SelectNftContractDialogEvent, WalletMessages } from '../../plugins/Wallet/messages.js'
import { useI18N } from '../../utils/index.js'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'

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
    onContractChange: (contract: NonFungibleTokenContract<ChainId, SchemaType.ERC721>) => void
    onBalanceChange: (balance: number) => void
    balance: number
    contract: NonFungibleTokenContract<ChainId, SchemaType.ERC721> | null | undefined
}
export function ERC721ContractSelectPanel(props: ERC721TokenSelectPanelProps) {
    const { onContractChange, onBalanceChange, contract, label, chainId = ChainId.Mainnet, balance } = props
    const { t } = useI18N()
    const { classes } = useStyles({ hasIcon: Boolean(contract?.logoURL) })

    // #region select contract
    const [id] = useState(uuid)

    const { setDialog: setNftContractDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        useCallback(
            (ev: SelectNftContractDialogEvent) => {
                if (ev.open || !ev.contract || ev.uuid !== id) return
                onContractChange(ev.contract as NonFungibleTokenContract<ChainId, SchemaType.ERC721>)
                onBalanceChange(Number.parseInt(ev.balance ?? '0', 10))
            },
            [id, onContractChange, onBalanceChange],
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
                    {label ?? t('select_an_nft')}
                </Typography>
                {!contract?.address || !EthereumAddress.isValid(contract.address) ? null : (
                    <Typography className={classes.title} color="textSecondary" variant="body2" component="span">
                        {t('wallet_balance')}: {balance ? balance : '0'}
                    </Typography>
                )}
            </div>
            <div className={classNames(classes.wrapper, classes.pointer)} onClick={openDialog}>
                <div className={classes.tokenWrapper}>
                    {contract?.logoURL ? <img className={classes.icon} src={contract?.logoURL} /> : null}
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
