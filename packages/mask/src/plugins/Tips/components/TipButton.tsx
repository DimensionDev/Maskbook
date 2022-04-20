import { TipCoin } from '@masknet/icons'
import { PluginId } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { BindingProof, EMPTY_LIST, NextIDPlatform, NextIDStorageInfo, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import type { TooltipProps } from '@mui/material'
import classnames from 'classnames'
import { uniq } from 'lodash-unified'
import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import { useAsync, useAsyncFn, useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../../shared'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useKvGet } from '../hooks/useKv'
import { useI18N } from '../locales'
import { PluginNextIDMessages } from '../messages'

interface Props extends HTMLProps<HTMLDivElement> {
    addresses?: string[]
    receiver?: ProfileIdentifier
    tooltipProps?: Partial<TooltipProps>
}

const useStyles = makeStyles()({
    tipButton: {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, system-ui, sans-serif',
    },
    buttonWrapper: {
        // temporarily hard code
        height: 46,
        display: 'flex',
        alignItems: 'center',
        color: '#8899a6',
    },
    postTipButton: {
        cursor: 'pointer',
        width: 34,
        height: 34,
        borderRadius: '100%',
        '&:hover': {
            backgroundColor: 'rgba(20,155,240,0.1)',
        },
    },
    tooltip: {
        backgroundColor: 'rgb(102,102,102)',
        color: 'white',
        marginTop: '0 !important',
    },
    disabled: {
        opacity: 0.4,
        cursor: 'default',
    },
})

export const TipButton: FC<Props> = ({
    className,
    receiver,
    addresses = EMPTY_LIST,
    children,
    tooltipProps,
    ...rest
}) => {
    const { classes } = useStyles()
    const t = useI18N()

    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: receiverPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!receiver) return
        return Services.Identity.queryPersonaByProfile(receiver)
    }, [receiver])

    const {
        value: isAccountVerified,
        loading: loadingVerifyInfo,
        retry: retryLoadVerifyInfo,
    } = useAsyncRetry(() => {
        if (!receiverPersona?.publicHexKey || !receiver?.userId) return Promise.resolve(false)
        return NextIDProof.queryIsBound(receiverPersona.publicHexKey, platform, receiver.userId, true)
    }, [receiverPersona?.publicHexKey, platform, receiver?.userId])

    const [publicKey, setPublicKey] = useState<string | null>(null)
    const { value: kv } = useKvGet<NextIDStorageInfo<BindingProof[]>>(publicKey)

    const [NextIDWalletsState, queryBindings] = useAsyncFn(async () => {
        if (!receiver) return EMPTY_LIST

        const persona = await Services.Identity.queryPersonaByProfile(receiver)
        if (!persona?.publicHexKey) return EMPTY_LIST
        setPublicKey(persona.publicHexKey)

        const bindings = await NextIDProof.queryExistedBindingByPersona(persona.publicHexKey, true)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs.filter((p) => p.platform === NextIDPlatform.Ethereum).map((p) => p.identity)
        return wallets
    }, [receiver])

    const walletsFromCloud = useMemo(() => {
        if (kv?.ok) {
            if (!kv.val.proofs.length) return null
            const tipWallets = kv.val.proofs.map((x) =>
                x.content[PluginId.Tips].filter((y) => y.platform === NextIDPlatform.Ethereum),
            )[0]
            if (!tipWallets) return []
            return tipWallets
                .filter((x) => {
                    if (NextIDWalletsState.value) {
                        // Sometimes, the wallet might get deleted from next.id
                        return x.isPublic && NextIDWalletsState.value.includes(x.identity)
                    } else {
                        return x.isPublic
                    }
                })
                .map((x) => x.identity)
        }
        return null
    }, [kv, NextIDWalletsState.value])

    useAsync(queryBindings, [queryBindings])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            retryLoadVerifyInfo()
            queryBindings()
        })
    }, [])

    const allAddresses = useMemo(() => {
        return walletsFromCloud || uniq([...(NextIDWalletsState.value || []), ...addresses])
    }, [NextIDWalletsState.value, addresses, walletsFromCloud])

    const hideAllWallets = walletsFromCloud !== null && walletsFromCloud.length === 0

    const isChecking = loadingPersona || loadingVerifyInfo
    const disabled = isChecking || !isAccountVerified || allAddresses.length === 0 || hideAllWallets

    const sendTip: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (disabled) return
            if (NextIDWalletsState.loading || !NextIDWalletsState.value) {
                await queryBindings()
            }
            if (!allAddresses.length || !receiver?.userId) return
            PluginNextIDMessages.tipTask.sendToLocal({
                recipientSnsId: receiver.userId,
                addresses: allAddresses,
            })
        },
        [disabled, NextIDWalletsState, allAddresses, receiver?.userId, queryBindings],
    )
    const dom = (
        <div
            className={classnames(className, classes.tipButton, disabled ? classes.disabled : null)}
            {...rest}
            role="button"
            onClick={sendTip}>
            <TipCoin viewBox="0 0 24 24" />
            {children}
        </div>
    )

    if (disabled)
        return (
            <ShadowRootTooltip
                classes={{ tooltip: classes.tooltip }}
                title={isChecking ? '' : t.tip_wallets_missed()}
                placement="bottom"
                arrow={false}
                {...tooltipProps}>
                {dom}
            </ShadowRootTooltip>
        )
    return dom
}

export const PostTipButton: FC<Props> = ({ className, ...rest }) => {
    const identifier = usePostInfoDetails.author()
    const { classes } = useStyles()
    return (
        <div className={classes.buttonWrapper}>
            <TipButton className={classnames(classes.postTipButton, className)} {...rest} receiver={identifier} />
        </div>
    )
}
