import { SteganographyPreset } from '@masknet/encryption'
export const SteganographyPresetImage: Record<SteganographyPreset, string> = {
    [SteganographyPreset.Preset2021]: new URL('./normal/payload-v2.png', import.meta.url).toString(),
    [SteganographyPreset.Preset2022]: new URL('./normal/payload-v3.png', import.meta.url).toString(),
}
