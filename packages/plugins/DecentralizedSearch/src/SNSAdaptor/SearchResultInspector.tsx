import { useRef, useEffect, useState, useMemo } from 'react'
import { Hidden } from '@masknet/shared'
import { first } from 'lodash-es'
import { TabContext } from '@mui/lab'
import { useAvailablePlugins, getProfileTabContent } from '@masknet/plugin-infra'
import {
    useActivatedPluginSNSAdaptor,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { Tab } from '@mui/material'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { useAddressTypeBaseOnChainIdList } from '@masknet/web3-hooks-evm'
import { ChainId, AddressType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { SocialAddressType, resolveSearchKeywordType } from '@masknet/web3-shared-base'
import { DecentralizedSearchPostExtraInfoWrapper } from './DecentralizedSearchPostExtraInfoWrapper.js'
import { PluginID, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { LoadingContent } from './LoadingContent.js'
import { EmptyContent } from './EmptyContent.js'
import { LoadFailedContent } from './LoadFailedContent.js'

const useStyles = makeStyles()((theme) => ({
    tabs: {
        display: 'flex',
        position: 'relative',
        padding: theme.spacing(0, 2),
    },
    content: {
        position: 'relative',
        background: theme.palette.common.white,
        maxHeight: 478,
        overflow: 'scroll',
    },
}))

export function SearchResultInspector(props: { keyword: string }) {
    const ENS_Plugin = useActivatedPluginSNSAdaptor(PluginID.ENS, 'any')
    const { classes } = useStyles()
    const ensRef = useRef<{
        isLoading: boolean
        isError: boolean
        domain: string
        reversedAddress: string
        tokenId: string
        retry: () => void
    }>()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { value: addressType, loading: isLoadingAddressType } = useAddressTypeBaseOnChainIdList(
        NetworkPluginID.PLUGIN_EVM,
        props.keyword,
        [ChainId.Mainnet, ChainId.BSC, ChainId.Matic],
    )

    const ENS_SearchResult = ENS_Plugin!.SearchResultContent?.UI?.Content!
    const [isLoading, setLoading] = useState(true)
    const [isHiddenAll, setHiddenAll] = useState(true)
    const [isEmpty, setEmpty] = useState(false)
    const [isError, setError] = useState(false)
    const socialAccount = {
        pluginID: NetworkPluginID.PLUGIN_EVM,
        address: ensRef.current?.reversedAddress ?? '',
        label: ensRef.current?.domain ?? '',
        supportedAddressTypes: [SocialAddressType.ENS],
    }
    const translate = usePluginI18NField()
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileCardTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => {
                return x.Utils?.shouldDisplay?.(undefined, socialAccount) ?? true
            })
            .sort((a, z) => {
                // order those tabs from collectible first
                if (a.pluginID === PluginID.Collectible) return -1
                if (z.pluginID === PluginID.Collectible) return 1

                return a.priority - z.priority
            })
    })
    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))
    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

    const component = useMemo(() => {
        const Component = getProfileTabContent(currentTab)
        if (!Component) return null

        return <Component identity={undefined} socialAccount={socialAccount} />
    }, [currentTab, socialAccount])

    useEffect(() => {
        setLoading(!ensRef.current || ensRef.current?.isLoading)
        setHiddenAll(Boolean(ensRef.current && ensRef.current?.reversedAddress === undefined) || isLoadingAddressType)
        setEmpty(
            Boolean(
                ensRef.current &&
                    (!ensRef.current?.reversedAddress || !ensRef.current?.tokenId) &&
                    !ensRef.current?.isLoading,
            ),
        )
        setError(Boolean(ensRef.current?.isError))
    }, [ensRef.current, isLoadingAddressType])

    if (
        addressType === AddressType.Contract ||
        isLoadingAddressType ||
        (!addressType && ensRef.current?.reversedAddress && !Others?.isValidDomain?.(props.keyword))
    )
        return null

    return (
        <Hidden hidden={isHiddenAll}>
            <DecentralizedSearchPostExtraInfoWrapper>
                <Hidden hidden={isLoading || isEmpty || isError}>
                    <ENS_SearchResult
                        keyword={props.keyword}
                        ref={ensRef}
                        keywordType={resolveSearchKeywordType(
                            props.keyword,
                            (keyword: string) => Boolean(Others?.isValidDomain(keyword)),
                            (keyword: string) =>
                                Boolean(Others?.isValidAddress(keyword) && !Others?.isZeroAddress(keyword)),
                        )}
                    />
                    <div className={classes.tabs}>
                        <TabContext value={currentTab}>
                            <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                                {tabs.map((tab) => (
                                    <Tab key={tab.id} label={tab.label} value={tab.id} />
                                ))}
                            </MaskTabList>
                        </TabContext>
                    </div>
                    <div className={classes.content}>{component}</div>
                </Hidden>
                <Hidden hidden={!isLoading}>
                    <LoadingContent />
                </Hidden>
                <Hidden hidden={!isEmpty}>
                    <EmptyContent />
                </Hidden>
                <Hidden hidden={!isError}>
                    <LoadFailedContent isLoading={isLoading} retry={ensRef.current?.retry} />
                </Hidden>
            </DecentralizedSearchPostExtraInfoWrapper>
        </Hidden>
    )
}
