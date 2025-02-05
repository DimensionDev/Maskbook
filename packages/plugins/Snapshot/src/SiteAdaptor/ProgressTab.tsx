import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import { InformationCard } from './InformationCard.js'
import { ResultCard } from './ResultCard.js'
import { SnapshotTab } from './SnapshotTab.js'
import { VotesCard } from './VotesCard.js'

export function ProgressTab() {
    return (
        <SnapshotTab>
            <ThemeProvider theme={MaskLightTheme}>
                <InformationCard />
                <ResultCard />
                <VotesCard />
            </ThemeProvider>
        </SnapshotTab>
    )
}
