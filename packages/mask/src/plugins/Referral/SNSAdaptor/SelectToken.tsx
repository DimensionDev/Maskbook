import { useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { delay } from '@dimensiondev/kit'
import { FungibleTokenDetailed, useChainId } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DialogContent } from '@mui/material'
import { EMPTY_LIST } from '@masknet/shared-base'

import { PluginReferralMessages } from '../messages'
import { NATIVE_TOKEN } from '../constants'
import { parseChainAddress } from '../helpers'

import { InjectedDialog } from '@masknet/shared'
import { ERC20TokenList } from './shared-ui/ERC20TokenList'
import { farmsService } from '../Worker/services'

const DISABLED_NATIVE_TOKEN = true

export function SelectToken() {
    const currentChainId = useChainId()

    const [title, setTitle] = useState('')
    const [id, setId] = useState('')
    const [onlyFarmTokens, setOnlyFarmTokens] = useState<boolean>(false)

    const { open, setDialog } = useRemoteControlledDialog(PluginReferralMessages.selectTokenUpdated, (ev) => {
        if (!ev.open) return
        setId(ev.uuid)
        setTitle(ev.title)
        setOnlyFarmTokens(!!ev.onlyFarmTokens)
    })
    const { value: farms = EMPTY_LIST, loading: loadingAllFarms } = useAsync(
        async () => farmsService.getAllFarms(currentChainId),
        [currentChainId],
    )

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

    const referredTokensDefn = farms.map((farm) => farm.referredTokenDefn)
    const uniqReferredTokensDefn = [...new Set(referredTokensDefn)]
    const referredTokens = uniqReferredTokensDefn.map(
        (referredTokenDefn) => parseChainAddress(referredTokenDefn).address,
    )

    return (
        <InjectedDialog titleBarIconStyle="back" open={open} onClose={onClose} title={title} maxWidth="xs">
            <DialogContent>
                <ERC20TokenList
                    renderList={onlyFarmTokens ? referredTokens : undefined}
                    dataLoading={loadingAllFarms}
                    referredTokensDefn={referredTokensDefn}
                    FixedSizeListProps={{ height: 340, itemSize: 54 }}
                    onSelect={onSubmit}
                    blacklist={DISABLED_NATIVE_TOKEN ? [NATIVE_TOKEN] : []}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
