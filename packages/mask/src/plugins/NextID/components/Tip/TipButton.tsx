import { TipCoin } from '@masknet/icons'
import { usePostInfoDetails } from '@masknet/plugin-infra'
import { EMPTY_LIST, NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { queryExistedBindingByPersona, queryIsBound } from '@masknet/web3-providers'
import type { TooltipProps } from '@mui/material'
import classnames from 'classnames'
import { uniq } from 'lodash-unified'
import { FC, HTMLProps, MouseEventHandler, useCallback, useMemo } from 'react'
import { useAsync, useAsyncFn, useAsyncRetry } from 'react-use'
import Services from '../../../../extension/service'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { useI18N } from '../../locales'
import { PluginNextIdMessages } from '../../messages'

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

    const { value: isAccountVerified, loading: loadingVerifyInfo } = useAsync(() => {
        if (!receiverPersona?.publicHexKey || !receiver?.userId) return Promise.resolve(false)
        return queryIsBound(receiverPersona.publicHexKey, platform, receiver.userId, true)
    }, [receiverPersona?.publicHexKey, platform, receiver?.userId])

    const [walletsState, queryBindings] = useAsyncFn(async () => {
        if (!receiver) return EMPTY_LIST

        const persona = await Services.Identity.queryPersonaByProfile(receiver)
        if (!persona?.publicHexKey) return EMPTY_LIST

        const bindings = await queryExistedBindingByPersona(persona.publicHexKey, true)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs.filter((p) => p.platform === NextIDPlatform.Ethereum).map((p) => p.identity)
        return wallets
    }, [receiver])

    useAsync(queryBindings, [queryBindings])

    const allAddresses = useMemo(() => {
        return uniq([...(walletsState.value || []), ...addresses])
    }, [walletsState.value, addresses])

    const disabled = loadingPersona || loadingVerifyInfo || !isAccountVerified || allAddresses.length === 0

    const sendTip: MouseEventHandler<HTMLDivElement> = useCallback(
        async (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (disabled) return
            if (walletsState.loading || !walletsState.value) {
                await queryBindings()
            }
            if (!allAddresses.length || !receiver?.userId) return
            PluginNextIdMessages.tipTask.sendToLocal({
                recipientSnsId: receiver.userId,
                addresses: allAddresses,
            })
        },
        [disabled, walletsState, allAddresses, receiver?.userId, queryBindings],
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
            <ShadowRootTooltip title={t.tip_wallets_missed()} placement="top" arrow {...tooltipProps}>
                {dom}
            </ShadowRootTooltip>
        )
    return dom
}

const postTipButtonTooltip = { placement: 'bottom', arrow: false } as const

export const PostTipButton: FC<Props> = (props) => {
    const identifier = usePostInfoDetails.author()
    const { classes } = useStyles()
    return (
        <div className={classes.buttonWrapper}>
            <TipButton
                {...props}
                className={classnames(classes.postTipButton, props.className)}
                tooltipProps={postTipButtonTooltip}
                receiver={identifier}
            />
        </div>
    )
}
