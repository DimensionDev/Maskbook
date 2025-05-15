import { Select, Trans } from '@lingui/react/macro'
import { NetworkPluginID } from '@masknet/shared-base'
import { useCustomSnackbar } from '@masknet/theme'
import { NFTScanNonFungibleTokenEVM, NFTSpam } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAsyncFn } from 'react-use'
import { ConfirmDialog } from '../UI/modals/modals.js'

interface Options {
    address?: string
    chainId?: number
    pluginID?: NetworkPluginID
    collectionId?: string
}

export function useReportSpam({ pluginID, chainId, address, collectionId }: Options) {
    const isSolana = pluginID === NetworkPluginID.PLUGIN_SOLANA
    const { data: collectionByAddress } = useQuery({
        enabled: !collectionId && !isSolana,
        queryKey: ['nftscan', 'collection', chainId, address],
        queryFn: async () => {
            if (!address || !chainId) return null
            return (await NFTScanNonFungibleTokenEVM.getCollection(address, { chainId })) || null
        },
    })
    const collection = collectionByAddress
    const colId = collectionId
    const [state, reportSpam] = useAsyncFn(async (chainId: number, address: string) => {
        const res = await NFTSpam.report(chainId, address)
        return res.code === 0
    }, [])

    const { showSnackbar } = useCustomSnackbar()
    const promptReport = useCallback(async () => {
        const confirmed = await ConfirmDialog.openAndWaitForClose({
            title: <Trans>Report NFT Scam Contract?</Trans>,
            message: (
                <Trans>
                    Are you sure to report{' '}
                    <Select
                        value={collection?.name ? 'hasName' : 'noName'}
                        _hasName={collection?.name}
                        _noName="this NFT"
                    />
                    ? After confirmed, this NFT will be marked as spam.
                </Trans>
            ),
            confirmVariant: 'warning',
        })
        if (!confirmed || !chainId || !address) return
        const result = await reportSpam(chainId, address)
        showSnackbar(<Trans>Report Spam</Trans>, {
            variant: result ? 'success' : 'error',
            message: result ? <Trans>Spam reported.</Trans> : <Trans>Failed to report spam.</Trans>,
        })
    }, [colId, reportSpam, collection?.name])
    const isSpam = collection?.isSpam

    return {
        isReporting: state.loading,
        isSpam,
        promptReport,
    }
}
