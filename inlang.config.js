export async function defineConfig(env) {
	const { default: i18nextPlugin } = await env.$import(
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-i18next@2/dist/index.js",
	)
  const { default: standardLintRules } = await env.$import(
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-standard-lint-rules@3/dist/index.js",
	)

	return {
		referenceLanguage: "en-US",
		plugins: [
			i18nextPlugin({
				pathPattern: "./packages/shared/src/locales/{language}.json",
                ignore: ["qya-AA.json"]
			}),
            standardLintRules(),
		],
	}
}