import { useState, useEffect, useMemo } from 'react'
import { useStylesExtends } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

import { MaskMessages } from '../../../utils'
import { useLocationChange } from '../../../utils/hooks/useLocationChange'
import { WalletsPage } from './WalletsPage'
import { NFTPage } from './NFTPage'
import { DonationPage } from './DonationsPage'
import { PageTags } from '../types'
import { unreachable } from '@dimensiondev/kit'
import { PageTag } from './PageTag'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    tags: {
        padding: theme.spacing(2),
    },
    content: {
        position: 'relative',
        padding: theme.spacing(1),
    },
}))

interface EnhancedProfilePageProps extends withClasses<'text' | 'button'> {}

export function EnhancedProfilePage(props: EnhancedProfilePageProps) {
    const [show, setShow] = useState(false)
    const classes = useStylesExtends(useStyles(), props)
    const [currentTag, setCurrentTag] = useState<PageTags>(PageTags.NFTTag)

    useLocationChange(() => {
        MaskMessages.events.profileNFTsTabUpdated.sendToLocal('reset')
    })

    useEffect(() => {
        return MaskMessages.events.profileNFTsPageUpdated.on((data) => {
            setShow(data.show)
        })
    }, [])

    const content = useMemo(() => {
        switch (currentTag) {
            case PageTags.WalletTag:
                return <WalletsPage />
            case PageTags.NFTTag:
                return <NFTPage />
            case PageTags.DonationTag:
                return <DonationPage />
            default:
                return unreachable(currentTag)
        }
    }, [currentTag])

    if (!show) return null

    return (
        <div className={classes.root}>
            <div className={classes.tags}>
                <PageTag onChange={(tag) => setCurrentTag(tag)} tag={currentTag} />
            </div>
            <div className={classes.content}>{content}</div>
        </div>
    )
}
