const mainFallbackMap = new Map([['zh', 'zh-TW']])
export function getLanguageFamilyName(_languages: string[]): Map<string, string> {
    const languages = _languages
        .filter((x) => x.endsWith('.json'))
        .sort()
        .map((x) => x.slice(0, -5))
    const languageMap = new Map<string, string>()
    const hasFamily = new Set<string>()

    for (const language of languages) {
        const family = language.slice(0, 2)
        if (hasFamily.has(family) || (mainFallbackMap.has(family) && mainFallbackMap.get(family) !== language)) {
            languageMap.set(language, language)
        } else {
            languageMap.set(language, family)
            hasFamily.add(family)
        }
    }
    return languageMap
}
