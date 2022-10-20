import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled.js'
import { useSideBarNativeItemStyleVariants } from './ToolboxHint.js'
import { styled, ListItemButton, Typography, ListItemIcon, useMediaQuery, Box } from '@mui/material'
import GuideStep from '../../../components/GuideStep'
import { useI18N } from '../../../utils'
import { useCallback } from 'react'
import { CrossIsolationMessages } from '@masknet/shared-base'

const twitterBreakPoint = 1265
const Container = styled('div')`
    cursor: pointer;
    padding: 4px 0;
`
const ListItem = styled(ListItemButton)`
    border-radius: 9999px;
    display: inline-flex;
    &:hover {
        background: rgba(15, 20, 25, 0.1);
        ${({ theme }) => (theme.palette.mode === 'dark' ? 'background: rgba(217, 217, 217, 0.1);' : '')}
    }
    /* twitter break point */
    @media screen and (max-width: ${twitterBreakPoint}px) {
        height: 50px;
    }
`
const Text = styled(Typography)`
    margin-right: 16px;
    font-size: 15px;
    font-family: inherit;
    font-weight: 400;
    font-size: 20px;
    color: ${({ theme }) => (theme.palette.mode === 'light' ? 'rgb(15, 20, 25)' : 'rgb(216, 216, 216)')};
`
const Icon = styled(ListItemIcon)`
    color: ${({ theme }) => (theme.palette.mode === 'light' ? 'rgb(15, 20, 25)' : 'rgb(216, 216, 216)')};
    min-width: 0;
`

export function ToolboxHintAtTwitter(props: { category: 'wallet' | 'application' }) {
    const mini = useMediaQuery(`(max-width: ${twitterBreakPoint}px)`)
    const { textMarginLeft, itemPadding, iconSize } = useSideBarNativeItemStyleVariants()

    return (
        <ToolboxHintUnstyled
            iconSize={Number(iconSize.replace('px', '')) - 1}
            mini={mini}
            ListItemIcon={Icon}
            Typography={({ children }) => <Text marginLeft={textMarginLeft ?? '20px'}>{children}</Text>}
            ListItemButton={({ children, onClick }) => (
                <ListItem style={{ padding: `6px ${itemPadding ?? '11px'}` }} onClick={onClick}>
                    {children}
                </ListItem>
            )}
            Container={Container}
            category={props.category}
        />
    )
}

export function ProfileLinkAtTwitter() {
    const { t } = useI18N()
    const onHintButtonClicked = useCallback(() => {
        CrossIsolationMessages.events.requestComposition.sendToLocal({ reason: 'timeline', open: true })
    }, [])
    return (
        <>
            <GuideStep step={3} total={3} tip={t('user_guide_tip_3')} onComplete={onHintButtonClicked}>
                <Box sx={{ position: 'absolute', left: 0, right: 0, width: '100%', height: '100%' }} />
            </GuideStep>
        </>
    )
}
