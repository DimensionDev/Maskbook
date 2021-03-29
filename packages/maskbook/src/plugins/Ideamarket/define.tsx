import { PluginConfig, PluginStage, PluginScope } from '../types'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { getAllListings } from './api'
import type { getAllListingsData } from './types'
import LogoButton from './UI/LogoButton'
import { isArray } from 'lodash-es'
import Logo from '../../extension/options-page/DashboardComponents/MaskbookLogo'

let ideaTokens: getAllListingsData[]

const fetchAll = async () => {
    const result = await getAllListings()

    ideaTokens = result.ideaTokens
}

fetchAll()

export const IdeamarketPluginDefine: PluginConfig = {
    pluginName: 'Ideamarket',
    identifier: 'ideamarket.io',
    stage: PluginStage.Development,
    scope: PluginScope.Internal,

    postInspector: function Component(): JSX.Element | null {
	const user = usePostInfoDetails('postBy').userId

        if (!user) return null
        
        const username = '@' + user

        let potentialListing: getAllListingsData | undefined

        // if no data stored, fetch it.
        if (!ideaTokens) {
            fetchAll()
        } else {
            potentialListing = ideaTokens.find((i) => i.name.toLowerCase() === username.toLowerCase())

            if (potentialListing) {
                return (
                    <LogoButton
                        found={true}
                        username={username}
                        rank={potentialListing.rank}
                        dayChange={potentialListing.dayChange}
                        price={potentialListing.latestPricePoint.price}
                    />
                )
            }
        }

        return <LogoButton found={false} username={username} />
    },
}
