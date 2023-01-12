interface WindowEventMap {
    scenechange: CustomEvent<{ scene: 'profile'; value: string }> | CustomEvent<{ scene: 'unknown' }>
}
