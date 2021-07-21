import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import type { ERC721ContractDetailed } from '@masknet/web3-shared'
import classNames from 'classnames'
import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared'
import { SelectNftContractDialogEvent, WalletMessages } from '../../plugins/Wallet/messages'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            height: 52,
            width: 524,
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
        },
        tokenWrapper: {
            display: 'flex',
            alignItems: 'center',
        },
        nftName: {
            marginLeft: theme.spacing(1),
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
    onContractChange: (contract: ERC721ContractDetailed) => void
    contract: ERC721ContractDetailed | undefined
}
export function ERC721ContractSelectPanel(props: ERC721TokenSelectPanelProps) {
    const { onContractChange, contract } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    //#region select contract
    const [id] = useState(uuid())

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
            uuid: id,
        })
    }, [setNftContractDialog, uuid])
    //#endregion

    return (
        <Box className={classes.root}>
            <div className={classes.wrapper}>
                <Typography className={classes.title} color="textSecondary" variant="body2" component="span">
                    {t('dashboard_tab_collectibles')}
                </Typography>
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
