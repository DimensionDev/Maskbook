import type { PluginConfig } from '../plugin'
import { PreviewCard } from './PreviewCard'
import React, { Suspense, useMemo, useState } from 'react'
import { SnackbarContent } from '@material-ui/core'
import { useExtensionPermission } from '../../components/DataSource/useExtensionPermission'
import useSWR from 'swr'
import { parseURL } from '../../utils/utils'
import Services from '../../extension/service'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { extractTextFromTypedMessage } from '../../extension/background-script/CryptoServices/utils'
import { Result, Ok, Err } from 'ts-results'
import { DonateDialog } from './DonateDialog'
import { useWalletDataSource } from '../shared/useWallet'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { useObservableValues } from '../../utils/hooks/useObservableMapSet'
import type { GitcoinGrantMetadata } from './Services'
import BigNumber from 'bignumber.js'
import { EthereumTokenType, ERC20TokenRecord } from '../Wallet/database/types'
import { getNetworkSettings } from '../Wallet/UI/Developer/SelectEthereumNetwork'
import { isNumber } from 'lodash-es'

const isGitcoin = (x: string): boolean => x.startsWith('https://gitcoin.co/grants')
export const GitcoinPluginDefine: PluginConfig = {
    identifier: 'co.gitcoin',
    shouldActivateInSuccessDecryption(post) {
        const text = extractTextFromTypedMessage(post)
        // https://github.com/vultix/ts-results/issues/8
        if (text.ok) return shouldActivate(text.val).ok
        return false
    },
    SuccessDecryptionComponent(props) {
        const text = extractTextFromTypedMessage(props.message)
        if (text.err) return null
        const gitcoin = parseURL(text.val).find(isGitcoin)
        if (gitcoin) return Renderer({ url: gitcoin })
        return null
    },
    postInspector: function Comp(props) {
        const post = useValueRef(props.postContent)
        const link = useObservableValues(props.postMetadata.mentionedLinks)
            .concat(useMemo(() => parseURL(post), [post]))
            .find(isGitcoin)
        if (!link) return null
        return <Renderer url={link} />
    },
}

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    return (
        <MaskbookPluginWrapper pluginName="Gitcoin">
            <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                <Gitcoin url={props.url} />
            </Suspense>
        </MaskbookPluginWrapper>
    )
}

function shouldActivate(post: string): Result<void, void> {
    const has = post.includes('https://gitcoin.co/grants/')
    if (has) return Ok.EMPTY
    return Err.EMPTY
}

function Gitcoin(props: { url: string }) {
    const [open, setOpen] = useState(false)
    const [wallets, tokens, onRequireNewWallet] = useWalletDataSource()
    const url = props.url
    const { revalidate, data, isValidating } = useSWR(url, {
        fetcher(url: string) {
            return Services.Plugin.invokePlugin('co.gitcoin', 'fetchMetadata', url)
        },
    })
    const { amount, contributors, finalAmount, title, image, description, address } = data?.ok
        ? data.val
        : ({} as GitcoinGrantMetadata)

    const onDonate = async ({
        amount,
        address,
        token,
        tokenType,
    }: {
        amount: number
        address: string
        token: ERC20TokenRecord
        tokenType: EthereumTokenType
    }) => {
        if (!address) {
            return
        }
        const power = tokenType === EthereumTokenType.ETH ? 18 : token!.decimals
        try {
            await Services.Plugin.invokePlugin('co.gitcoin', 'donateGrant', {
                donation_address: address,
                donation_total: new BigNumber(amount).multipliedBy(new BigNumber(10).pow(power)),
                donor_address: address,
                network: getNetworkSettings().networkType,
                token_type: tokenType,
                token: token,
            })
        } catch (e) {
            alert(e.message)
            console.log(`error: ${e}`)
        }
    }

    return (
        <>
            <PreviewCard
                onRequestGrant={() => (wallets.length === 0 ? onRequireNewWallet() : setOpen(true))}
                requestPermission={() => {}}
                hasPermission={true}
                loading={isValidating}
                image={image ? <img src={image} width="100%" /> : null}
                title={title ?? 'A Gitcoin grant'}
                line1={isNumber(finalAmount) ? `${finalAmount} DAI` : ''}
                line2="ESTIMATED"
                line3={isNumber(amount) ? `${amount} DAI` : ''}
                line4={isNumber(contributors) ? `${contributors} contributors` : ''}
                address={address}
                originalURL={url ?? ''}
            />
            {wallets.length ? (
                <DonateDialog
                    address={address}
                    onRequireNewWallet={onRequireNewWallet}
                    wallets={wallets}
                    tokens={tokens}
                    open={!!(open && address?.length)}
                    title={title ?? 'A Gitcoin grant'}
                    description={description ?? ''}
                    onDonate={onDonate}
                    onClose={() => setOpen(false)}
                />
            ) : null}
        </>
    )
}
