import { useCallback, useState, useMemo } from 'react'
import { useAsync } from 'react-use'
import { delay } from '@dimensiondev/kit'
import { useChainId } from '@masknet/plugin-infra/web3'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DialogContent, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'

import { useI18N } from '../locales'
import { PluginReferralMessages, ReferralRPC } from '../messages'
import { NATIVE_TOKEN } from '../constants'
import { parseChainAddress } from '../helpers'
import type { FungibleTokenDetailed } from '../types'

import { FungibleTokenList } from './shared-ui/FungibleTokenList'

import { useSharedStyles } from './styles'

const DISABLED_NATIVE_TOKEN = true

const useStyles = makeStyles()(() => ({
    dialog: {
        maxWidth: 600,
        boxShadow: 'none',
        backgroundImage: 'none',
    },
    dialogTitle: {
        '& > p': {
            overflow: 'inherit!important',
        },
    },
}))

export function SelectToken() {
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const t = useI18N()
    const { classes: sharedClasses } = useSharedStyles()
    const { classes } = useStyles()

    const [title, setTitle] = useState('')
    const [id, setId] = useState('')
    const [onlyFarmTokens, setOnlyFarmTokens] = useState(false)

    const { open, setDialog } = useRemoteControlledDialog(PluginReferralMessages.selectTokenUpdated, (ev) => {
        if (!ev.open) return
        setId(ev.uuid)
        setTitle(ev.title)
        setOnlyFarmTokens(!!ev.onlyFarmTokens)
    })

    const {
        value: referredTokensDefn = EMPTY_LIST,
        loading,
        error,
    } = useAsync(
        async () => (currentChainId ? ReferralRPC.getReferredTokensDefn(currentChainId) : []),
        [currentChainId],
    )
    const referredTokens = useMemo(() => {
        return referredTokensDefn.length
            ? referredTokensDefn.map((referredTokenDefn) => parseChainAddress(referredTokenDefn).address)
            : []
    }, [referredTokensDefn])

    const onClose = useCallback(async () => {
        setDialog({
            open: false,
            uuid: id,
        })
        await delay(300)
    }, [id, setDialog])

    const onSubmit = useCallback(
        async (token: FungibleTokenDetailed) => {
            setDialog({
                open: false,
                uuid: id,
                token,
            })
            await delay(300)
        },
        [id, setDialog],
    )

    return (
        <InjectedDialog
            titleBarIconStyle="back"
            open={open}
            onClose={onClose}
            title={title}
            maxWidth="xs"
            classes={{
                paper: classes.dialog,
                dialogTitle: classes.dialogTitle,
            }}>
            <DialogContent>
                {onlyFarmTokens && error ? (
                    <Typography className={sharedClasses.msg}>{t.blockchain_error_your_referral_farms()}</Typography>
                ) : (
                    <FungibleTokenList
                        whitelist={onlyFarmTokens ? referredTokens : undefined}
                        loading={loading}
                        referredTokensDefn={referredTokensDefn}
                        FixedSizeListProps={{ height: 340, itemSize: 54 }}
                        onSelect={onSubmit}
                        blacklist={DISABLED_NATIVE_TOKEN ? [NATIVE_TOKEN] : []}
                    />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
