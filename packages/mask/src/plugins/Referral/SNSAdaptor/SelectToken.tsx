import { useCallback, useState, useMemo } from 'react'
import { useAsync } from 'react-use'
import { delay } from '@dimensiondev/kit'
import { FungibleTokenDetailed, useChainId } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DialogContent, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'

import { useI18N } from '../../../utils'
import { PluginReferralMessages, ReferralRPC } from '../messages'
import { NATIVE_TOKEN } from '../constants'
import { parseChainAddress } from '../helpers'

import { ERC20TokenList } from './shared-ui/ERC20TokenList'

import { useSharedStyles } from './styles'

const DISABLED_NATIVE_TOKEN = true

export function SelectToken() {
    const currentChainId = useChainId()
    const { t } = useI18N()
    const { classes: sharedClasses } = useSharedStyles()

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
        <InjectedDialog titleBarIconStyle="back" open={open} onClose={onClose} title={title} maxWidth="xs">
            <DialogContent>
                {onlyFarmTokens && error ? (
                    <Typography className={sharedClasses.msg}>
                        {t('plugin_referral_blockchain_error_your_referral_farms')}
                    </Typography>
                ) : (
                    <ERC20TokenList
                        whitelist={onlyFarmTokens ? referredTokens : undefined}
                        dataLoading={loading}
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
