import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled'
import { useSideBarNativeItemStyleVariants } from './ToolboxHint'
import { styled, ListItemButton, Typography, ListItemIcon, useMediaQuery, Box } from '@mui/material'
import GuideStep from '../../../components/GuideStep'
import { useI18N } from '../../../utils'

const twitterBreakPoint = 1265
const Container = styled('div')`
    cursor: pointer;
    padding: 4px 0;
`
const ListItem = styled(ListItemButton)<{ itemPadding?: string }>`
    border-radius: 9999px;
    padding: 6px ${(props) => props.itemPadding ?? '11px'};
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
const Text = styled(Typography)<{ textMarginLeft?: string }>`
    margin-left: ${(props) => props.textMarginLeft ?? '20px'};
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
    const { textMarginLeft, itemPadding } = useSideBarNativeItemStyleVariants()

    return (
        <ToolboxHintUnstyled
            iconSize={26}
            iconFontSize="1.75rem"
            mini={mini}
            ListItemIcon={Icon}
            Typography={({ children }) => <Text textMarginLeft={textMarginLeft}>{children}</Text>}
            ListItemButton={({ children }) => <ListItem itemPadding={itemPadding}>{children}</ListItem>}
            Container={Container}
            category={props.category}
        />
    )
}

export function ProfileLinkAtTwitter() {
    const { t } = useI18N()
    return (
        <GuideStep step={3} total={4} tip={t('user_guide_tip_3')}>
            <Box sx={{ position: 'absolute', left: 0, right: 0, width: '100%', height: '100%' }} />
        </GuideStep>
    )
}
