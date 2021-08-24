import { useStylesExtends } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { useState, useEffect } from 'react'
import { CollectibleListAddress } from '../../extension/options-page/DashboardComponents/CollectibleList'
import { useEthereumAddress } from '../../social-network-adaptor/twitter.com/injection/useEthereumName'
import { MaskMessage } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'

const useStyles = makeStyles()((theme) => ({
    text: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            color: getMaskColor(theme).textPrimary,
        },
    },
    button: {},
}))

interface EnhancedProfileaPageProps extends withClasses<'text' | 'button'> {
    bioDescription: string
    nickname: string
    twitterId: string
    onUpdated: () => void
}

export function EnhancedProfileaPage(props: EnhancedProfileaPageProps) {
    const [show, setShow] = useState(false)
    const classes = useStylesExtends(useStyles(), props)
    const { bioDescription, nickname, twitterId, onUpdated } = props

    useLocationChange(() => {
        MaskMessage.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        return MaskMessage.events.profileNFTsTabUpdated.on((data) => {
            onUpdated()
        })
    }, [])

    useEffect(() => {
        return MaskMessage.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [])

    const resolvedAddress = useEthereumAddress(nickname, twitterId, bioDescription)
    return <>{show ? <CollectibleListAddress classes={classes} address={resolvedAddress ?? ''} /> : null}</>
}
