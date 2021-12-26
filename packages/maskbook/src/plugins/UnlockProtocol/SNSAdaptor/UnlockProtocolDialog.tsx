import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { DialogActions, DialogContent, DialogProps, Chip, Button, InputBase } from '@mui/material'
import { useEffect } from 'react'
import { useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils'
import { pluginMetaKey } from '../constants'
import type { UnlockLocks } from '../types'
import { PluginUnlockProtocolRPC } from '../messages'
import { SelectRecipientsUnlockDialogUI } from './SelectRecipientsUnlockDialog'
import { useCompositionContext } from '../../../components/CompositionDialog/CompositionContext'
import { makeStyles } from '@masknet/theme'

interface UnlockProtocolDialogProps extends withClasses<'wrapper'> {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
    children?: React.ReactNode
}

const useStyles = makeStyles()(() => ({
    actions: {
        flexDirection: 'row',
    },
}))

export default function UnlockProtocolDialog(props: UnlockProtocolDialogProps) {
    const { t } = useI18N()
    const [open, setOpen] = useState(false)
    const address = useAccount()
    const { classes } = useStyles()
    const [currentUnlockChain, setCurrentUnlockChain] = useState(useChainId())
    const [currentUnlockPost, setCurrentUnlockPost] = useState('')
    const [currentUnlockTarget, setCurrentUnlockTarget] = useState<UnlockLocks[]>(() => [])
    const [availableUnlockTarget, setAvailableUnlockTarget] = useState<UnlockLocks[]>(() => [])
    const { attachMetadata, dropMetadata } = useCompositionContext()
    useEffect(() => {
        PluginUnlockProtocolRPC.getLocks(address)
            .then((value) => {
                if (value.length) {
                    setAvailableUnlockTarget(value)
                }
            })
            .catch((error) => {
                console.error(error)
                setAvailableUnlockTarget([
                    {
                        lock: {
                            name: error.message || 'Some error occurred.',
                            chain: currentUnlockChain,
                            address: '0x0',
                            price: '0',
                        },
                    },
                ])
            })
    }, [address])

    const onInsert = () => {
        if (!!currentUnlockTarget.length && !!currentUnlockPost) {
            PluginUnlockProtocolRPC.encryptUnlockData(currentUnlockPost).then((encryption) => {
                const uploadData = {
                    identifier: encryption.iv,
                    unlockLocks: currentUnlockTarget.map((x) => {
                        return { unlocklock: x.lock.address, chainid: x.lock.chain }
                    }),
                    unlockKey: encryption.key,
                }
                PluginUnlockProtocolRPC.postUnlockData(uploadData).then((res) => {
                    if (res === 200) {
                        const data = {
                            iv: uploadData.identifier,
                            unlockLocks: uploadData.unlockLocks,
                            post: encryption.encrypted,
                        }
                        if (data) {
                            attachMetadata(pluginMetaKey, JSON.parse(JSON.stringify(data)))
                        } else {
                            dropMetadata(pluginMetaKey)
                        }
                        props.onClose()
                    } else {
                        return
                    }
                })
            })
        } else {
            return
        }
    }

    return (
        <InjectedDialog open={props.open} onClose={props.onClose} title={t('plugin_unlockprotocol_title')}>
            <DialogContent>
                <InputBase
                    id="outlined-multiline-static"
                    placeholder={t('post_dialog__placeholder')}
                    rows={4}
                    // variant="outlined"
                    multiline
                    fullWidth
                    onChange={(e) => setCurrentUnlockPost(e.target.value)}
                />
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Chip label={t('plugin_unlockprotocol_select_unlock_lock')} onClick={() => setOpen(true)} />
                <SelectRecipientsUnlockDialogUI
                    onSelect={(item) => setCurrentUnlockTarget([...currentUnlockTarget, item])}
                    onDeselect={(item) =>
                        setCurrentUnlockTarget(currentUnlockTarget.filter((x) => x.lock.address !== item.lock.address))
                    }
                    open={open}
                    selected={currentUnlockTarget}
                    disabled={false}
                    chain={currentUnlockChain}
                    setChain={(chain) => setCurrentUnlockChain(chain)}
                    items={availableUnlockTarget}
                    onClose={() => setOpen(false)}
                />
                <Button
                    style={{ marginLeft: 'auto' }}
                    variant="contained"
                    disabled={!(!!currentUnlockTarget.length && !!currentUnlockPost)}
                    onClick={onInsert}>
                    {t('plugin_unlockprotocol_submit_post')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
