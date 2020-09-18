import React, { useState, useEffect } from 'react'
import { MoreHorizontal } from 'react-feather'
import { makeStyles, Theme, createStyles, DialogContent, GridList, GridListTile } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { getActivatedUI } from '../../../social-network/ui'
import { useTwitterDialog } from '../../../social-network-provider/twitter.com/utils/theme'
import { MessageCenter } from '../../../utils/messages'
import { Provider } from './Provider'
import { getUrl, sleep } from '../../../utils/utils'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'
import Services, { ServicesWithProgress } from '../../../extension/service'
import { useERC20TokenContract } from '../../../web3/hooks/useContract'

console.log('ETHEREUM')
// @ts-ignore
console.log(globalThis.ethereum)

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '750px !important',
        },
        content: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden',
            padding: theme.spacing(2, 1),
        },
        grid: {
            width: '100%',
        },
        icon: {
            fontSize: 45,
        },
    }),
)

interface SelectProviderDialogUIProps
    extends withClasses<
        KeysInferFromUseStyles<typeof useStyles> | 'root' | 'dialog' | 'backdrop' | 'container' | 'paper' | 'content'
    > {}

function SelectProviderDialogUI(props: SelectProviderDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    // //#region dialog
    const [open, setOpen] = useState(false)

    // // submit token
    // const onSelect = (address: string) => {
    //     setOpen(false)
    //     setTimeout(() => {
    //         MessageCenter.emit('selectTokenDialogUpdated', {
    //             open: false,
    //             token: address ? tokens.find((x) => x.address === address) : undefined,
    //         })
    //     })
    // }

    // // open dialog from message center
    // useEffect(() => {
    //     if (open) return
    //     MessageCenter.on('selectTokenDialogUpdated', (ev) => {
    //         if (!ev.open) return // expect open dialog
    //         setOpen(true)
    //     })
    // }, [open])

    // // close dialog with message center
    // const onClose = () => {
    //     if (!open) return
    //     setOpen(!open)
    //     setTimeout(() => {
    //         MessageCenter.emit('selectTokenDialogUpdated', {
    //             open: false,
    //         })
    //     }, 100)
    // }
    // //#endregion

    const onClose = () => {}

    const erc20Control = useERC20TokenContract('0xaFF4481D10270F50f203E0763e2597776068CBc5')

    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={onClose}
                onExit={onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogContent className={classes.content}>
                    <GridList className={classes.grid} spacing={16} cellHeight={183}>
                        <GridListTile>
                            <Provider
                                logo={<MaskbookIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="Maskbook"
                                description="Create wallet with Maskbook"
                                onClick={async () => {
                                    const address = await Services.Ethereum.connectMetaMask()
                                    console.log('DEBUG: !!!')
                                    console.log(address)

                                    await sleep(1000)

                                    if (!erc20Control) return
                                    console.log(erc20Control)

                                    const approveTx = erc20Control.methods.approve(
                                        '0xe483fd62961Ca2384d293c98e8D82EA1b7CF2036',
                                        `1${'0'.repeat(10)}`,
                                    )
                                    const rtn = ServicesWithProgress.sendTransaction(address, {
                                        from: address,
                                        to: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
                                        data: approveTx.encodeABI(),
                                    })

                                    for await (const stage of rtn) {
                                        console.log(stage)
                                    }
                                }}
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={<MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="MetaMask"
                                description="Connect to your MetaMask Wallet"
                                onClick={async () => {
                                    const address = await Services.Ethereum.connectMetaMask()
                                    console.log('DEBUG: !!!')
                                    console.log(address)
                                }}
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={<WalletConnectIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="WalletConnect"
                                description="Scan with WalletConnect to connect"
                                onClick={async () => {
                                    console.log({
                                        balance: await Services.Ethereum.getBalance(
                                            '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                                        ),
                                        blockNumber: await Services.Ethereum.getBlockNumber(),
                                        getGasPrice: await Services.Ethereum.getGasPrice(),
                                        tx: await Services.Ethereum.getTransactionReceipt(
                                            '0x435362f91163e908d591a60494138a82c93ff6ab989da8fb7b54e7c2a97b29c1',
                                        ),
                                    })
                                }}
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={
                                    <MoreHorizontal
                                        className={classes.icon}
                                        viewBox="0 0 22.5 22.5"
                                        width={45}
                                        height={45}
                                    />
                                }
                                name="More"
                                description="Comming soon…"
                                ButtonBaseProps={{ disabled: true }}
                            />
                        </GridListTile>
                    </GridList>
                </DialogContent>
            </ShadowRootDialog>
        </div>
    )
}

export interface SelectProviderDialogProps extends SelectProviderDialogUIProps {}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    const ui = getActivatedUI()
    const twitterClasses = {
        ...useTwitterDialog(),
    }

    return ui.internalName === 'twitter' ? (
        <SelectProviderDialogUI classes={twitterClasses} {...props} />
    ) : (
        <SelectProviderDialogUI {...props} />
    )
}
