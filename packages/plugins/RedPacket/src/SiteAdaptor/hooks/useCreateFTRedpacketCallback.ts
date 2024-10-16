import { isNativeTokenAddress, type GasConfig, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { useCreateParams, type RedPacketSettings, useCreateCallback } from './useCreateCallback.js'
import { useBalance, useChainContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { BigNumber } from 'bignumber.js'
import { EVMChainResolver } from '@masknet/web3-providers'
import type { RedPacketRecord, RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { useCallback, useRef, useEffect } from 'react'
import { RedPacketRPC } from '../../messages.js'
import { formatBalance } from '@masknet/web3-shared-base'

export function useCreateFTRedpacketCallback(
    publicKey: string,
    privateKey: string,
    settings: RedPacketSettings,
    gasOption?: GasConfig,
    onCreated?: (payload: RedPacketJSONPayload) => void,
    onClose?: () => void,
    currentAccount?: string,
) {
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const contract_version = 4

    const { chainId, networkType, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: createParams } = useCreateParams(chainId, settings, contract_version, publicKey)
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
        :   (settings?.total as string)

    const formatTotal = formatBalance(total, settings?.token?.decimals ?? 18, { significant: isNativeToken ? 3 : 0 })
    const formatAvg = formatBalance(
        new BigNumber(total).div(settings?.shares ?? 1).toFixed(0, 1),
        settings?.token?.decimals ?? 18,
        { significant: isNativeToken ? 3 : 0 },
    )

    const [{ loading: isCreating }, createCallback] = useCreateCallback(
        chainId,
        { ...settings!, total, name: currentAccount || settings.name },
        contract_version,
        publicKey,
        gasOption,
    )

    const createRedpacket = useCallback(async () => {
        const result = await createCallback()
        const { hash, receipt, events } = result ?? {}
        if (typeof hash !== 'string') return
        if (typeof receipt?.transactionHash !== 'string') return

        // the settings is not available
        if (!settings?.token) return

        const CreationSuccess = (events?.CreationSuccess?.returnValues ?? {}) as {
            creation_time: string
            creator: string
            id: string
            token_address: string
            total: string
        }

        // the events log is not available
        if (!events?.CreationSuccess?.returnValues.id) return
        const redpacketPayload = {
            sender: {
                address: account,
                name: currentAccount || settings.name,
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

        const record: RedPacketRecord = {
            chainId,
            id: receipt.transactionHash,
            from: '',
            password: privateKey,
            contract_version,
        }
        RedPacketRPC.addRedPacket(record)

        // output the redpacket as JSON payload
        onCreated?.(payload.current)
    }, [createCallback, settings, onCreated, currentAccount])

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
