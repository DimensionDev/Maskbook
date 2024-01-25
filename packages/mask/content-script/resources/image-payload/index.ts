import { SteganographyPreset } from '@masknet/encryption'
export const SteganographyPresetImage: Record<SteganographyPreset, string | null> = {
    [SteganographyPreset.Preset2021]: new URL('./normal/payload-2021.png', import.meta.url).toString(),
    [SteganographyPreset.Preset2022]: new URL('./normal/payload-2022.png', import.meta.url).toString(),
    [SteganographyPreset.Preset2023]: new URL('./normal/payload-2023.png', import.meta.url).toString(),
    [SteganographyPreset.Preset2023_Firefly]: null,
}
