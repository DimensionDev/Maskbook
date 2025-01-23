import { NetworkPluginID } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { useBalance, useChainContext } from '@masknet/web3-hooks-base'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { EVMChainResolver } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { formatBalance } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, useRedPacketConstants, type GasConfig } from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useCreateCallback, useCreateParams, type RedPacketSettings } from './useCreateCallback.js'
import { getLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'

export function useCreateFTRedpacketCallback(
    redpacketPubkey: string,
    privateKey: string,
    settings: RedPacketSettings,
    gasOption?: GasConfig,
    onCreated?: (payload: RedPacketJSONPayload) => void,
    onClose?: () => void,
) {
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const contract_version = 4

    const { chainId, networkType, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: createParams } = useCreateParams(chainId, settings, contract_version, redpacketPubkey)
    const isNativeToken = isNativeTokenAddress(settings.token?.address)
    const { transactionValue, estimateGasFee } = useTransactionValue(
        settings.total,
        createParams?.gas,
        gasOption?.gasCurrency,
    )

    const { isPending: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM)

    const isWaitGasBeMinus = (!estimateGasFee || loadingBalance) && isNativeToken

    const isBalanceInsufficient =
        isNativeTokenAddress(gasOption?.gasCurrency) && new BigNumber(transactionValue).isLessThanOrEqualTo(0)

    const total =
        isNativeToken ?
            isBalanceInsufficient ? '0'
            :   transactionValue
        :   (settings.total as string)

    const formatTotal = formatBalance(total, settings.token?.decimals ?? 18, { significant: isNativeToken ? 3 : 0 })
    const formatAvg = formatBalance(
        new BigNumber(total).div(settings.shares ?? 1).toFixed(0, 1),
        settings.token?.decimals ?? 18,
        { significant: isNativeToken ? 3 : 0 },
    )

    const settingsWithTotal = useMemo(() => ({ ...settings, total }), [settings, total])
    const [{ loading: isCreating }, createCallback] = useCreateCallback(
        chainId,
        settingsWithTotal,
        contract_version,
        redpacketPubkey,
        gasOption,
    )

    const createRedpacket = useCallback(async () => {
        const result = await createCallback()
        const { hash, receipt, events } = result ?? {}
        if (typeof hash !== 'string') return
        if (typeof receipt?.transactionHash !== 'string') return

        if (!settings.token) return

        const CreationSuccess = (events?.CreationSuccess?.returnValues ?? {}) as {
            creation_time: string
            creator: string
            id: string
            token_address: string
            total: string
        }

        // the events log is not available
        if (!events?.CreationSuccess?.returnValues.id) return
        const senderName = settings.name || getLastRecognizedIdentity()?.identifier?.userId
        const redpacketPayload = {
            sender: {
                address: account,
                name: senderName,
                message: settings.message,
            },
            is_random: settings.isRandom,
            shares: settings.shares,
            password: privateKey,
            rpid: CreationSuccess.id,
            total: CreationSuccess.total,
            duration: settings.duration,
            creation_time: Number.parseInt(CreationSuccess.creation_time, 10) * 1000,
            token: settings.token,
        } as const
        Object.assign(payload.current, redpacketPayload)

        queryClient.invalidateQueries({
            queryKey: ['redpacket', 'history'],
        })

        // output the redpacket as JSON payload
        onCreated?.(payload.current)
    }, [createCallback, settings, onCreated])

    const payload = useRef<RedPacketJSONPayload>({
        network: EVMChainResolver.chainName(chainId),
    } as RedPacketJSONPayload)

    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)

    useEffect(() => {
        const contractAddress = HAPPY_RED_PACKET_ADDRESS_V4
        if (!contractAddress) {
            onClose?.()
            return
        }
        payload.current.contract_address = contractAddress
        payload.current.contract_version = contract_version
        payload.current.network = EVMChainResolver.networkType(chainId)
    }, [chainId, networkType, contract_version])

    return {
        createRedpacket,
        isCreating,
        formatAvg,
        formatTotal,
        isBalanceInsufficient,
        isWaitGasBeMinus,
        gas: createParams?.gas,
        estimateGasFee,
    }
}
