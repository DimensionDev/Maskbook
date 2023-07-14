import { DisableShadowRootContext, ShadowRootIsolation, makeStyles } from '@masknet/theme'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { StickySearchHeader } from '../components/StickySearchBar.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { InputAdornment, InputBase } from '@mui/material'
import { startTransition, useCallback, useDeferredValue, useState } from 'react'
import { Icons } from '@masknet/icons'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { SearchResultInspector } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    input: {
        width: '100%',
    },
}))

export interface DSearchPageProps {
    disabled?: boolean
}

export default function DSearchPage({ disabled = false }: DSearchPageProps) {
    const { classes } = useStyles()

    const [search, setSearch] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(search))
    const keyword = registeredAddress || search

    const onSearch = useCallback((keyworkd: string) => {}, [])
    return (
        <DashboardContainer>
            <StickySearchHeader />

            <main>
                <DashboardHeader title="Swap" />

                <div className="bg-white p-5">
                    <div className="border pt-3 rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <InputBase
                                    className={classes.input}
                                    value={disabled ? '' : search}
                                    onChange={useCallback(
                                        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                            setSearch(e.target.value),
                                        [],
                                    )}
                                    onKeyDown={(e) => {
                                        if (e.code !== 'Enter') return
                                        startTransition(() => onSearch(keyword))
                                    }}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <Icons.Search />
                                        </InputAdornment>
                                    }
                                    placeholder="eg: Twitter accounts, Persona public keys, wallet addresses or ENS"
                                    disabled={disabled}
                                />
                                <SearchResultInspector keyword={keyword} isProfilePage />
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
