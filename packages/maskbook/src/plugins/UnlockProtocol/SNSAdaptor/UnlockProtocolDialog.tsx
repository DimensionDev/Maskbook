// import { TextField } from '@dimensiondev/maskbook-theme/src/component-changes'
import { useAccount, useChainId } from '@masknet/web3-shared'
import { DialogActions, DialogContent, DialogProps, Chip, Button, InputBase } from '@material-ui/core'
import { useEffect } from 'react'
import { useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils'
import { graphEndpointKeyVal, pluginMetaKey } from '../constants'
import type { UnlockLocks } from '../types'
import { PuginUnlockProtocolRPC } from '../messages'
import { SelectRecipientsUnlockDialogUI } from './SelectRecipientsUnlockDialog'
import { useCompositionContext } from '../../../components/CompositionDialog/CompositionContext'

interface UnlockProtocolDialogProps extends withClasses<'wrapper'> {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
    children?: React.ReactNode
}

export default function UnlockProtocolDialog(props: UnlockProtocolDialogProps) {
    const { t } = useI18N()
    const [open, setOpen] = useState(false)
    const [address, setAddress] = useState(useAccount())
    const [currentUnlockChain, setCurrentUnlockChain] = useState(useChainId())
    const [currentUnlockPost, setCurrentUnlockPost] = useState('')
    const [currentUnlockTarget, setCurrentUnlockTarget] = useState<UnlockLocks[]>(() => [])
    const [availableUnlockTarget, setAvailableUnlockTarget] = useState<UnlockLocks[]>(() => [])
    const { children } = props
    const { attachMetadata, dropMetadata } = useCompositionContext()
    useEffect(() => {
        for (const [key, url] of Object.entries(graphEndpointKeyVal)) {
            PuginUnlockProtocolRPC.getLocks(address, key.toString())
                .then((value) => {
                    if (value.lockManagers.length) {
                        setAvailableUnlockTarget([...availableUnlockTarget, ...value.lockManagers])
                    } else {
                        console.log(availableUnlockTarget)
                    }
                })
                .catch((error) => {
                    console.error(error)
                    setAvailableUnlockTarget([
                        {
                            lock: {
                                name: error.message || 'Some error occured',
                                chain: currentUnlockChain,
                                address: '0x0',
                                price: '0',
                            },
                        },
                    ])
                })
        }
    }, [address])

    const onInsert = () => {
        if (!!currentUnlockTarget.length && !!currentUnlockPost) {
            PuginUnlockProtocolRPC.encryptUnlockData(currentUnlockPost).then((encres) => {
                const uploadData = {
                    identifier: encres.iv,
                    unlockLocks: currentUnlockTarget.map((x) => {
                        return { unlocklock: x.lock.address, chainid: x.lock.chain }
                    }),
                    unlockKey: encres.key,
                }
                PuginUnlockProtocolRPC.postUnlockData(uploadData).then((res) => {
                    if (res === 200) {
                        const data = {
                            iv: uploadData.identifier,
                            unlockLocks: uploadData.unlockLocks,
                            post: encres.encrypted,
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
            <DialogActions>
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
