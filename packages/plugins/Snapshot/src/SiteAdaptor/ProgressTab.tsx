import { MaskThemeProvider } from '@masknet/theme'
import { InformationCard } from './InformationCard.js'
import { ResultCard } from './ResultCard.js'
import { SnapshotTab } from './SnapshotTab.js'
import { VotesCard } from './VotesCard.js'

export function ProgressTab() {
    return (
        <SnapshotTab>
            <MaskThemeProvider palette="light">
                <InformationCard />
                <ResultCard />
                <VotesCard />
            </MaskThemeProvider>
        </SnapshotTab>
    )
}
