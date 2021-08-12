import { getMaskColor, makeStyles } from '@masknet/theme'
import { useState, useEffect } from 'react'
import { CollectibleListAddress } from '../../extension/options-page/DashboardComponents/CollectibleList'
import { useEthereumAddress } from '../../social-network-adaptor/twitter.com/injection/useEthereumName'
import { searchNewTweetButtonSelector } from '../../social-network-adaptor/twitter.com/utils/selector'
import { getBioDescription, getNickname, getTwitterId } from '../../social-network-adaptor/twitter.com/utils/user'
import { MaskMessage } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'

interface StyleProps {
    backgroundColor: string
}

const EMPTY_STYLE = {} as CSSStyleDeclaration

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    empty: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            fontSize: 18,
            fontFamily: 'inherit',
            fontWeight: 700,
            color: getMaskColor(theme).textPrimary,
        },
    },
    button: {
        backgroundColor: props.backgroundColor,
        color: 'white',
        marginTop: 18,
        '&:hover': {
            backgroundColor: props.backgroundColor,
        },
    },
}))

export function EnhancedProfileaPage() {
    const [show, setShow] = useState(false)
    const newTweetButton = searchNewTweetButtonSelector().evaluate()
    const style = newTweetButton ? window.getComputedStyle(newTweetButton) : EMPTY_STYLE
    const { classes } = useStyles({ backgroundColor: style.backgroundColor })

    const [bio, setBio] = useState(getBioDescription())
    const [nickname, setNickname] = useState(getNickname())
    const [twitterId, setTwitterId] = useState(getTwitterId())

    const onLocalChange = () => {
        MaskMessage.events.profileNFTsTabUpdated.sendToLocal('reset')
    }

    useEffect(() => {
        return MaskMessage.events.profileNFTsTabUpdated.on((data) => {
            const _bioDescription = getBioDescription()
            setBio(_bioDescription)
            const _nickname = getNickname()
            setNickname(_nickname)
            const _twitterId = getTwitterId()
            setTwitterId(_twitterId)
        })
    }, [])

    useLocationChange(onLocalChange)

    useEffect(() => {
        return MaskMessage.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [])

    const resolvedAddress = useEthereumAddress(nickname, twitterId, bio)
    return <>{show ? <CollectibleListAddress classes={classes} address={resolvedAddress ?? ''} /> : null}</>
}
