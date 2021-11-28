import { ToolboxHintUnstyled } from '../../../components/InjectedComponents/ToolboxUnstyled'
// see https://github.com/import-js/eslint-plugin-import/issues/2288
// eslint-disable-next-line import/no-deprecated
import { styled, ListItemButton, Typography, ListItemIcon, useMediaQuery } from '@mui/material'

const twitterBreakPoint = 1265
const Container = styled('div')`
    cursor: pointer;
    padding: 4px 0;
`
const ListItem = styled(ListItemButton)`
    border-radius: 9999px;
    padding: 6px 14px;
    display: inline-flex;
    &:hover {
        background: rgba(15, 20, 25, 0.1);
        ${({ theme }) => (theme.palette.mode === 'dark' ? `background: rgba(217, 217, 217, 0.1);` : '')}
    }
    /* twitter break point */
    @media screen and (max-width: ${twitterBreakPoint}px) {
        height: 50px;
    }
`
const Text = styled(Typography)`
    margin-left: 20px;
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

export function ToolboxHintAtTwitter() {
    // see https://github.com/import-js/eslint-plugin-import/issues/2288
    // eslint-disable-next-line import/no-deprecated
    const mini = useMediaQuery(`(max-width: ${twitterBreakPoint}px)`)
    return (
        <ToolboxHintUnstyled
            mini={mini}
            ListItemIcon={Icon}
            Typography={Text}
            ListItemButton={ListItem}
            Container={Container}
        />
    )
}
