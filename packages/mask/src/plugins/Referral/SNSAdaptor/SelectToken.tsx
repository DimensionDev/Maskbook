import { useCallback, useState, useMemo } from 'react'
import { useAsync } from 'react-use'
import { delay } from '@masknet/kit'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DialogContent, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'

import { useI18N } from '../locales/index.js'
import { PluginReferralMessages, ReferralRPC } from '../messages.js'
import { NATIVE_TOKEN } from '../constants.js'
import { parseChainAddress } from '../helpers/index.js'
import type { FungibleTokenDetailed } from '../types.js'

import { FungibleTokenList } from './shared-ui/FungibleTokenList/index.js'

import { useRowSize } from '../../../../../shared/src/contexts/components/useRowSize.js'

const DISABLED_NATIVE_TOKEN = true

const useStyles = makeStyles()((theme) => ({
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
    wrapper: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(6),
    },
    msg: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: theme.palette.background.default,
        padding: '12px 0',
        color: theme.palette.text.strong,
        fontWeight: 500,
        textAlign: 'center',
    },
}))

export function SelectToken() {
    const { chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const t = useI18N()
    const { classes } = useStyles()
    const rowSize = useRowSize()

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
                    <Typography className={classes.msg}>{t.blockchain_error_your_referral_farms()}</Typography>
                ) : (
                    <FungibleTokenList
                        whitelist={onlyFarmTokens ? referredTokens : undefined}
                        loading={loading}
                        referredTokensDefn={referredTokensDefn}
                        FixedSizeListProps={{ itemSize: rowSize + 22, height: 428, className: classes.wrapper }}
                        onSelect={onSubmit}
                        blacklist={DISABLED_NATIVE_TOKEN ? [NATIVE_TOKEN] : []}
                    />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
