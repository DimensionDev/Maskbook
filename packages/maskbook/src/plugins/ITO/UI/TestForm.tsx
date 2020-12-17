import { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useFillCallback } from '../hooks/useFillCallback'
import type { ITO_JSONPayload } from '../types'
import { useChainId } from '../../../web3/hooks/useChainState'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core'
import { useAccount } from '../../../web3/hooks/useAccount'
import { resolveChainName } from '../../../web3/pipes'
import { useERC20TokenDetailed } from '../../../web3/hooks/useERC20TokenDetailed'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { CONSTANTS } from '../../../web3/constants'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { usePoolPayload } from '../hooks/usePoolPayload'

export interface TestFormProps {
    onCreate?: (payload: ITO_JSONPayload) => void
}

export function TestForm(props: TestFormProps) {
    const account = useAccount()
    const chainId = useChainId()

    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')

    const { value: MaskbookA } = useERC20TokenDetailed('0xe54bf69054da160c597f8b5177924b9e4b81e930')
    const { value: MaskbookB } = useERC20TokenDetailed('0xe379c7a6ba07575a5a49d8f8ebfd04921b86917d')
    const { value: MaskbookC } = useERC20TokenDetailed('0xb1465b954f893D921566D8BB4092B6f03FC8C313')

    const settings = useMemo(() => {
        const today = new Date()
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        return {
            name: 'Mask',
            title: 'Test ITO Packet',
            password: uuid(),
            limit: new BigNumber(10).toFixed(),
            total: new BigNumber(100).toFixed(),
            startTime: today,
            endTime: tomorrow,
            exchangeAmounts: [new BigNumber(1000).toFixed(), new BigNumber(10000).toFixed()],
            exchangeTokens: MaskbookB && MaskbookC ? [MaskbookB, MaskbookC] : [],
            token: MaskbookA,
        }
    }, [chainId, MaskbookA, MaskbookB, MaskbookC])

    //#region blocking
    const [fillSettings, fillState, fillCallback, resetFillCallback] = useFillCallback(settings)
    const onCreate = useCallback(async () => {
        await fillCallback()
    }, [settings])
    //#endregion

    //#region compose JSON payload
    const payload = useMemo(() => {
        if (!fillSettings?.token) return
        if (fillState.type !== TransactionStateType.CONFIRMED) return
        const { receipt } = fillState
        const FillSuccess = (receipt.events?.FillSuccess.returnValues ?? {}) as {
            total: string
            id: string
            creator: string
            creation_time: string
            token_address: string
            name: string
            message: string
        }
        return {
            contract_address: ITO_CONTRACT_ADDRESS,
            creation_time: Number.parseInt(FillSuccess.creation_time, 10) * 1000,
            total: FillSuccess.total,
            total_remaining: FillSuccess.total,
            claim_remaining: fillSettings.limit,
            pid: FillSuccess.id,
            sender: {
                address: FillSuccess.creator,
                name: FillSuccess.name,
                message: FillSuccess.message,
            },
            chain_id: chainId,
            token: fillSettings.token,
            limit: fillSettings.limit,
            password: fillSettings.password,
            start_time: fillSettings.startTime.getTime(),
            end_time: fillSettings.endTime.getTime(),
            exchange_tokens: fillSettings.exchangeTokens,
            exchange_amounts: fillSettings.exchangeAmounts,
        } as ITO_JSONPayload
    }, [fillState /* update payload only if state changed */])

    const onCompose = useCallback(() => {
        // if (!payload) return
        props.onCreate?.({
            contract_address: '0x52ceb31d6c197b5c039786fbefd6a82df70fdfd6',
            total: '1000000',
            total_remaining: '900000',
            claim_remaining: '500',
            pid: '0x91abb4660d1925c3c0a5bfb9d0481e80a558d86b3fe446764cadc2cd9505f1b4',
            sender: {
                address: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                name: 'Mask',
                message: 'Test ITO Packet',
            },
            chain_id: 4,
            token: {
                type: 1,
                address: '0x960b816d6dd03ed514c03f56788279154348ea37',
                chainId: 4,
                name: 'MASKBOOK A',
                symbol: 'MSKA',
                decimals: 18,
            },
            limit: '1000',
            password: 'd928b4b2-0a7e-4c08-aaa9-6d02d7a40391',
            creation_time: 1607669042000,
            start_time: 1609668871197,
            end_time: 1610668871197,
            exchange_tokens: [
                {
                    type: 1,
                    address: '0x0000000000000000000000000000000000000000',
                    chainId: 4,
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                },
                {
                    type: 1,
                    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
                    chainId: 4,
                    name: 'Dai Stablecoin',
                    symbol: 'DAI',
                    decimals: 18,
                },
                {
                    type: 1,
                    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                    chainId: 4,
                    name: 'Tether USD',
                    symbol: 'USDT',
                    decimals: 18,
                },
                {
                    type: 1,
                    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                    chainId: 4,
                    name: 'USD Coin',
                    symbol: 'USDC',
                    decimals: 18,
                },
            ],
            exchange_amounts: ['333000000000000000', '12220000000000000', '18999222000000000', '5000000000000000'],
        })
    }, [payload])
    //#endregion

    //#region claim
    const claimPayload = usePoolPayload('')
    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(
        claimPayload.pid,
        claimPayload.password,
        '10',
        {
            address: MaskbookB?.address ?? '',
        },
    )
    const onClaim = useCallback(() => {
        if (!claimPayload) return
        claimCallback()
    }, [claimPayload, claimCallback])
    //#endregion

    //#region approve
    const [approveToken, setApproveToken] = useState(MaskbookA)
    const [approveState, approveCallback, resetApproveCallback] = useERC20TokenApproveCallback(
        approveToken?.address ?? '',
        '10',
        ITO_CONTRACT_ADDRESS,
    )
    const onApprove = useCallback(() => {
        if (approveState !== ApproveState.APPROVED) approveCallback(true)
    }, [approveState, approveCallback])
    //#endregion

    //#region reset
    const onReset = useCallback(() => {
        resetFillCallback()
        resetClaimCallback()
        resetApproveCallback()
    }, [])
    //#endregion

    return (
        <div>
            <Accordion elevation={0}>
                <AccordionSummary>
                    <Typography>Context</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <pre>
                        {JSON.stringify(
                            {
                                account,
                                chainName: resolveChainName(chainId),
                            },
                            null,
                            2,
                        )}
                    </pre>
                </AccordionDetails>
            </Accordion>
            <Accordion elevation={0}>
                <AccordionSummary>
                    <Typography>Payload</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <AccordionDetails>
                        <pre>{JSON.stringify(payload, null, 2)}</pre>
                    </AccordionDetails>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>Status</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <pre>
                        {JSON.stringify(
                            {
                                approveState,
                                claimState,
                                fillState,
                                fillSettings,
                            },
                            null,
                            2,
                        )}
                    </pre>
                </AccordionDetails>
            </Accordion>
            <Accordion elevation={0}>
                <AccordionSummary>
                    <Typography>Pool Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <pre>{JSON.stringify(settings, null, 2)}</pre>
                </AccordionDetails>
            </Accordion>

            <ActionButton onClick={onCreate}>Create Pool</ActionButton>
            <ActionButton onClick={onCompose}>Compose Payload</ActionButton>
            <ActionButton disabled={!claimPayload} onClick={onClaim}>
                Claim Pool
            </ActionButton>
            <ActionButton
                onClick={() => {
                    if (approveToken?.address === MaskbookA?.address) onApprove()
                    else setApproveToken(MaskbookA)
                }}>
                {approveToken?.address === MaskbookA?.address ? 'Approve MSKA' : 'Switch To MSKA'}
            </ActionButton>
            <ActionButton
                onClick={() => {
                    if (approveToken?.address === MaskbookB?.address) onApprove()
                    else setApproveToken(MaskbookB)
                }}>
                {approveToken?.address === MaskbookB?.address ? 'Approve MSKB' : 'Switch To MSKB'}
            </ActionButton>
            <ActionButton
                onClick={() => {
                    if (approveToken?.address === MaskbookC?.address) onApprove()
                    else setApproveToken(MaskbookC)
                }}>
                {approveToken?.address === MaskbookC?.address ? 'Approve MSKC' : 'Switch To MSKC'}
            </ActionButton>
            <ActionButton onClick={onReset}>Reset</ActionButton>
        </div>
    )
}
