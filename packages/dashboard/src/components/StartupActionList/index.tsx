import { styled } from '@material-ui/core'
import type {} from '@material-ui/system'
/**
 * This component is an abstraction of a list of "start up action suggestions".
 */
export const StartupActionList = styled('ul')(
    ({ theme }) => `
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    width: 440px;
    & > * {
        margin-bottom: ${theme.spacing(0.75)};
    }
`,
)
export interface StartupActionListProps extends React.PropsWithChildren<{}> {}
export * from './StartupActionListItem'
