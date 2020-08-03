/**
 * WARNING: THIS FILE IS GENERATED. DO NOT MODIFY IT.
 * https://github.com/mozilla/web-ext/issues/1986
 */
declare module 'web-ext' {
    /// <reference types="node" />
    import defaultNotifier from 'node-notifier'
    import { EventEmitter } from 'events'
    import FirefoxClient from '@cliqz-oss/firefox-client'
    import FirefoxProfile from 'firefox-profile'
    import { fs } from 'mz'
    import { default as open_2 } from 'open'
    import { Readable } from 'stream'
    import { signAddon } from 'sign-addon'
    import Watchpack from 'watchpack'

    declare function build(params: BuildCmdParams, options: BuildCmdOptions): Promise<ExtensionBuildResult>

    declare function build_2(
        { sourceDir, artifactsDir, asNeeded, overwriteDest, ignoreFiles, filename }: BuildCmdParams,
        {
            manifestData,
            createFileFilter,
            fileFilter,
            onSourceChange,
            packageCreator,
            showReadyMessage,
        }?: BuildCmdOptions,
    ): Promise<ExtensionBuildResult>

    declare type BuildCmdOptions = {
        manifestData?: ExtensionManifest
        fileFilter?: FileFilter
        onSourceChange?: OnSourceChangeFn
        packageCreator?: PackageCreatorFn
        showReadyMessage?: boolean
        createFileFilter?: FileFilterCreatorFn
        shouldExitProgram?: boolean
    }

    declare type BuildCmdParams = {
        sourceDir: string
        artifactsDir: string
        asNeeded?: boolean
        overwriteDest?: boolean
        ignoreFiles?: Array<string>
        filename?: string
    }

    export declare type BunyanLogEntry = {
        name: string
        msg: string
        level: BunyanLogLevel
    }

    export declare type BunyanLogLevel = TRACE | DEBUG | INFO | WARN | ERROR | FATAL

    export declare type BunyanStreamConfig = {
        type: string
        stream: ConsoleStream
    }

    export declare const cmd: {
        build: typeof build
        docs: typeof docs
        lint: typeof lint
        run: typeof run
        sign: typeof sign
    }

    declare type CmdRunOptions = {
        buildExtension: typeof build_2
        desktopNotifications: typeof showDesktopNotification
        firefoxApp: {
            configureProfile: typeof configureProfile
            useProfile: typeof useProfile
            installExtension: typeof installExtension
            isDefaultProfile: typeof isDefaultProfile
            copyProfile: typeof copyProfile
            run: typeof run_2
            createProfile: typeof createProfile
            defaultCreateProfileFinder: typeof defaultCreateProfileFinder
            defaultFirefoxEnv: typeof defaultFirefoxEnv
        }
        firefoxClient: typeof connectWithMaxRetries
        reloadStrategy: typeof defaultReloadStrategy
        shouldExitProgram?: boolean
        MultiExtensionRunner?: typeof MultiExtensionRunner
        getValidatedManifest?: typeof getValidatedManifest
    }

    declare type CmdRunParams = {
        artifactsDir: string
        browserConsole: boolean
        pref?: FirefoxPreferences
        firefox: string
        firefoxProfile?: string
        ignoreFiles?: Array<string>
        keepProfileChanges: boolean
        noInput?: boolean
        noReload: boolean
        preInstall: boolean
        sourceDir: string
        watchFile?: string
        startUrl?: Array<string>
        target?: Array<string>
        args?: Array<string>
        adbBin?: string
        adbHost?: string
        adbPort?: string
        adbDevice?: string
        adbDiscoveryTimeout?: number
        adbRemoveOldArtifacts?: boolean
        firefoxApk?: string
        firefoxApkComponent?: string
        chromiumBinary?: string
        chromiumProfile?: string
    }

    declare function configureProfile(
        profile: FirefoxProfile,
        { app, getPrefs, customPrefs }?: ConfigureProfileOptions,
    ): Promise<FirefoxProfile>

    declare type ConfigureProfileFn = (
        profile: FirefoxProfile,
        options?: ConfigureProfileOptions,
    ) => Promise<FirefoxProfile>

    declare type ConfigureProfileOptions = {
        app?: PreferencesAppName
        getPrefs?: PreferencesGetterFn
        customPrefs?: FirefoxPreferences
    }

    declare function connect(port: number, { connectToFirefox }?: ConnectOptions): Promise<RemoteFirefox>

    declare type ConnectOptions = {
        connectToFirefox: FirefoxConnectorFn
    }

    declare function connectWithMaxRetries( // A max of 250 will try connecting for 30 seconds.
        { maxRetries, retryInterval, port }: ConnectWithMaxRetriesParams,
        { connectToFirefox }?: ConnectWithMaxRetriesDeps,
    ): Promise<RemoteFirefox>

    declare type ConnectWithMaxRetriesDeps = {
        connectToFirefox: typeof connect
    }

    declare type ConnectWithMaxRetriesParams = {
        maxRetries?: number
        retryInterval?: number
        port: number
    }

    export declare type ConsoleOptions = {
        localProcess?: typeof process
    }

    declare class ConsoleStream {
        verbose: boolean
        isCapturing: boolean
        capturedMessages: Array<string>
        constructor({ verbose }?: ConsoleStreamParams)
        format({ name, msg, level }: BunyanLogEntry): string
        makeVerbose(): void
        write(packet: BunyanLogEntry, { localProcess }?: ConsoleOptions): void
        startCapturing(): void
        stopCapturing(): void
        flushCapturedLogs({ localProcess }?: ConsoleOptions): void
    }

    export declare type ConsoleStreamParams = {
        verbose?: boolean
    }

    declare function copyProfile(
        profileDirectory: string,
        { app, configureThisProfile, copyFromUserProfile, customPrefs }?: CopyProfileOptions,
    ): Promise<FirefoxProfile>

    declare type CopyProfileOptions = {
        app?: PreferencesAppName
        configureThisProfile?: ConfigureProfileFn
        copyFromUserProfile?: Function
        customPrefs?: FirefoxPreferences
    }

    export declare type CreateBunyanLogFn = (params: CreateBunyanLogParams) => Logger

    export declare type CreateBunyanLogParams = {
        name: string
        level: BunyanLogLevel
        streams: Array<BunyanStreamConfig>
    }

    declare const createFileFilter: (params: FileFilterOptions) => FileFilter

    declare function createLogger(filename: string, { createBunyanLog }?: CreateLoggerOptions): Logger

    export declare type CreateLoggerOptions = {
        createBunyanLog: CreateBunyanLogFn
    }

    declare function createProfile({
        app,
        configureThisProfile,
        customPrefs,
    }?: CreateProfileParams): Promise<FirefoxProfile>

    declare type CreateProfileFinderParams = {
        userDirectoryPath?: string
        FxProfile?: typeof FirefoxProfile
    }

    declare type CreateProfileParams = {
        app?: PreferencesAppName
        configureThisProfile?: ConfigureProfileFn
        customPrefs?: FirefoxPreferences
    }

    export declare type DEBUG = 20

    declare const defaultAsyncFsStat: any

    declare function defaultCreateProfileFinder({
        userDirectoryPath,
        FxProfile,
    }?: CreateProfileFinderParams): getProfileFn

    declare const defaultFirefoxEnv: {
        XPCOM_DEBUG_BREAK: string
        NS_TRACE_MALLOC_DISABLE_STACKS: string
    }

    declare function defaultReloadStrategy(
        { artifactsDir, extensionRunner, ignoreFiles, noInput, sourceDir, watchFile }: ReloadStrategyParams,
        { createWatcher, stdin, kill }?: ReloadStrategyOptions,
    ): void

    declare type DesktopNotificationsOptions = {
        notifier?: typeof defaultNotifier
        log?: Logger
    }

    declare type DesktopNotificationsParams = {
        title: string
        message: string
        icon?: string
    }

    declare function docs(params: DocsParams, options: DocsOptions): Promise<void>

    declare type DocsOptions = {
        openUrl?: typeof open_2
    }

    declare type DocsParams = {
        noInput?: boolean
        shouldExitProgram?: boolean
    }

    export declare type ERROR = 50

    declare type ExtensionBuildResult = {
        extensionPath: string
    }

    declare type ExtensionManifest = {
        name: string
        version: string
        default_locale?: string
        applications?: ExtensionManifestApplications
        browser_specific_settings?: ExtensionManifestApplications
        permissions?: Array<string>
    }

    declare type ExtensionManifestApplications = {
        gecko?: {
            id?: string
            strict_min_version?: string
            strict_max_version?: string
            update_url?: string
        }
    }

    declare type ExtensionRunnerReloadResult = {
        runnerName: string
        reloadError?: Error
        sourceDir?: string
    }

    export declare type FATAL = 60

    declare class FileFilter {
        filesToIgnore: Array<string>
        sourceDir: string
        constructor({ baseIgnoredPatterns, ignoreFiles, sourceDir, artifactsDir }?: FileFilterOptions)
        /**
         *  Resolve relative path to absolute path with sourceDir.
         */
        resolveWithSourceDir(file: string): string
        /**
         *  Insert more files into filesToIgnore array.
         */
        addToIgnoreList(files: Array<string>): void
        wantFile(filePath: string): boolean
    }

    declare type FileFilterCreatorFn = typeof createFileFilter

    declare type FileFilterOptions = {
        baseIgnoredPatterns?: Array<string>
        ignoreFiles?: Array<string>
        sourceDir: string
        artifactsDir?: string
    }

    declare type FirefoxConnectorFn = (port?: number) => Promise<FirefoxClient>

    declare type FirefoxInfo = {
        firefox: FirefoxProcess
        debuggerPort: number
    }

    declare type FirefoxPreferences = {
        [key: string]: boolean | string | number
    }

    declare interface FirefoxProcess extends EventEmitter {
        stderr: EventEmitter
        stdout: EventEmitter
        kill: Function
    }

    declare type FirefoxRDPAddonActor = {
        id: string
        actor: string
    }

    declare type FirefoxRDPResponseAddon = {
        addon: FirefoxRDPAddonActor
    }

    declare type FirefoxRDPResponseAny = Object

    declare type FirefoxRDPResponseMaybe = FirefoxRDPResponseRequestTypes | FirefoxRDPResponseAny

    declare type FirefoxRDPResponseRequestTypes = {
        requestTypes: Array<string>
    }

    declare type FirefoxRunnerFn = (params: FirefoxRunnerParams) => Promise<FirefoxRunnerResults>

    declare type FirefoxRunnerParams = {
        binary: string | null | undefined
        profile?: string
        'new-instance'?: boolean
        'no-remote'?: boolean
        foreground?: boolean
        listen: number
        'binary-args'?: Array<string> | string
        env?: {
            [key: string]: string | void
        }
        verbose?: boolean
    }

    declare type FirefoxRunnerResults = {
        process: FirefoxProcess
        binary: string
        args: Array<string>
    }

    declare type FirefoxRunOptions = {
        fxRunner?: FirefoxRunnerFn
        findRemotePort?: RemotePortFinderFn
        firefoxBinary?: string
        binaryArgs?: Array<string>
        args?: Array<any>
    }

    declare type getProfileFn = (profileName: string) => Promise<string | void>

    declare function getValidatedManifest(sourceDir: string): Promise<ExtensionManifest>

    declare interface IExtensionRunner {
        getName(): string
        run(): Promise<void>
        reloadAllExtensions(): Promise<Array<ExtensionRunnerReloadResult>>
        reloadExtensionBySourceDir(extensionSourceDir: string): Promise<Array<ExtensionRunnerReloadResult>>
        registerCleanup(fn: Function): void
        exit(): Promise<void>
    }

    export declare type INFO = 30

    declare function installExtension({
        asProxy,
        manifestData,
        profile,
        extensionPath,
        asyncFsStat,
    }: InstallExtensionParams): Promise<any>

    declare type InstallExtensionParams = {
        asProxy?: boolean
        manifestData: ExtensionManifest
        profile: FirefoxProfile
        extensionPath: string
        asyncFsStat?: typeof defaultAsyncFsStat
    }

    declare function isDefaultProfile(
        profilePathOrName: string,
        ProfileFinder?: typeof FirefoxProfile.Finder,
        fsStat?: typeof fs.stat,
    ): Promise<boolean>

    declare type IsDefaultProfileFn = (
        profilePathOrName: string,
        ProfileFinder?: typeof FirefoxProfile.Finder,
        fsStat?: typeof fs.stat,
    ) => Promise<boolean>

    declare function lint(params: LintCmdParams, options: LintCmdOptions): Promise<void>

    declare type LintCmdOptions = {
        createLinter?: LinterCreatorFn
        createFileFilter?: FileFilterCreatorFn
        shouldExitProgram?: boolean
    }

    declare type LintCmdParams = {
        artifactsDir?: string
        boring?: boolean
        ignoreFiles?: Array<string>
        metadata?: boolean
        output?: LinterOutputType
        pretty?: boolean
        selfHosted?: boolean
        sourceDir: string
        verbose?: boolean
        warningsAsErrors?: boolean
    }

    declare type Linter = {
        run: () => Promise<void>
    }

    declare type LinterCreatorFn = (params: LinterCreatorParams) => Linter

    declare type LinterCreatorParams = {
        config: {
            logLevel: 'debug' | 'fatal'
            stack: boolean
            pretty?: boolean
            warningsAsErrors?: boolean
            metadata?: boolean
            output?: LinterOutputType
            boring?: boolean
            selfHosted?: boolean
            shouldScanFile: (fileName: string) => boolean
            _: Array<string>
        }
        runAsBinary: boolean
    }

    declare type LinterOutputType = 'text' | 'json'

    export declare type Logger = {
        debug: (msg: string, ...args: any) => void
        error: (msg: string, ...args: any) => void
        info: (msg: string, ...args: any) => void
        warn: (msg: string, ...args: any) => void
    }

    export declare function main(
        absolutePackageDir: string,
        { getVersion, commands, argv, runOptions }?: MainParams,
    ): Promise<any>

    declare type MainParams = {
        getVersion?: VersionGetterFn
        commands?: Object
        argv: Array<any>
        runOptions?: Object
    }

    /**
     * Implements an IExtensionRunner which allow the caller to
     * manage multiple extension runners at the same time (e.g. by running
     * a Firefox Desktop instance alongside to a Firefox for Android instance).
     */
    declare class MultiExtensionRunner {
        extensionRunners: Array<IExtensionRunner>
        desktopNotifications: typeof showDesktopNotification
        constructor(params: MultiExtensionRunnerParams)
        /**
         * Returns the runner name.
         */
        getName(): string
        /**
         * Call the `run` method on all the managed extension runners,
         * and awaits that all the runners has been successfully started.
         */
        run(): Promise<void>
        /**
         * Reloads all the extensions on all the managed extension runners,
         * collect any reload error, and resolves to an array composed by
         * a ExtensionRunnerReloadResult object per managed runner.
         *
         * Any detected reload error is also logged on the terminal and shows as a
         * desktop notification.
         */
        reloadAllExtensions(): Promise<Array<ExtensionRunnerReloadResult>>
        /**
         * Reloads a single extension on all the managed extension runners,
         * collect any reload error and resolves to an array composed by
         * a ExtensionRunnerReloadResult object per managed runner.
         *
         * Any detected reload error is also logged on the terminal and shows as a
         * desktop notification.
         */
        reloadExtensionBySourceDir(sourceDir: string): Promise<Array<ExtensionRunnerReloadResult>>
        /**
         * Register a callback to be called when all the managed runners has been exited.
         */
        registerCleanup(cleanupCallback: Function): void
        /**
         * Exits all the managed runner has been exited.
         */
        exit(): Promise<void>
        handleReloadResults(results: Array<ExtensionRunnerReloadResult>): void
    }

    declare type MultiExtensionRunnerParams = {
        runners: Array<IExtensionRunner>
        desktopNotifications: typeof showDesktopNotification
    }

    declare type OnChangeFn = () => any

    declare type OnSourceChangeFn = (params: OnSourceChangeParams) => Watchpack

    declare type OnSourceChangeParams = {
        sourceDir: string
        watchFile?: string
        artifactsDir: string
        onChange: OnChangeFn
        shouldWatchFile: ShouldWatchFn
    }

    declare type PackageCreatorFn = (params: PackageCreatorParams) => Promise<ExtensionBuildResult>

    declare type PackageCreatorParams = {
        manifestData?: ExtensionManifest
        sourceDir: string
        fileFilter: FileFilter
        artifactsDir: string
        overwriteDest: boolean
        showReadyMessage: boolean
        filename?: string
    }

    declare type PreferencesAppName = 'firefox' | 'fennec'

    declare type PreferencesGetterFn = (appName: PreferencesAppName) => FirefoxPreferences

    declare type ReloadStrategyOptions = {
        createWatcher?: WatcherCreatorFn
        stdin?: Readable
        kill?: typeof process.kill
    }

    declare type ReloadStrategyParams = {
        extensionRunner: IExtensionRunner
        sourceDir: string
        watchFile?: string
        artifactsDir: string
        ignoreFiles?: Array<string>
        noInput?: boolean
    }

    declare class RemoteFirefox {
        client: Object
        checkedForAddonReloading: boolean
        constructor(client: FirefoxClient)
        disconnect(): void
        addonRequest(addon: FirefoxRDPAddonActor, request: string): Promise<FirefoxRDPResponseMaybe>
        getAddonsActor(): Promise<string>
        installTemporaryAddon(addonPath: string): Promise<FirefoxRDPResponseAddon>
        getInstalledAddon(addonId: string): Promise<FirefoxRDPAddonActor>
        checkForAddonReloading(addon: FirefoxRDPAddonActor): Promise<FirefoxRDPAddonActor>
        reloadAddon(addonId: string): Promise<void>
    }

    declare type RemotePortFinderFn = () => Promise<number>

    declare function run(params: CmdRunParams, options: CmdRunOptions): Promise<MultiExtensionRunner>

    declare function run_2(
        profile: FirefoxProfile,
        { fxRunner, findRemotePort, firefoxBinary, binaryArgs }?: FirefoxRunOptions,
    ): Promise<FirefoxInfo>

    declare type ShouldWatchFn = (filePath: string) => boolean

    declare function showDesktopNotification(
        { title, message, icon }: DesktopNotificationsParams,
        { notifier, log }?: DesktopNotificationsOptions,
    ): Promise<void>

    declare function sign(params: SignParams, options: SignOptions): Promise<SignResult>

    declare type SignOptions = {
        build?: typeof build_2
        signAddon?: typeof signAddon
        preValidatedManifest?: ExtensionManifest
        shouldExitProgram?: boolean
    }

    declare type SignParams = {
        apiKey: string
        apiProxy: string
        apiSecret: string
        apiUrlPrefix: string
        artifactsDir: string
        id?: string
        ignoreFiles?: Array<string>
        sourceDir: string
        timeout: number
        verbose?: boolean
        channel?: string
    }

    declare type SignResult = {
        success: boolean
        id: string
        downloadedFiles: Array<string>
    }

    export declare type TRACE = 10

    declare function useProfile(
        profilePath: string,
        { app, configureThisProfile, isFirefoxDefaultProfile, customPrefs, createProfileFinder }?: UseProfileParams,
    ): Promise<FirefoxProfile>

    declare type UseProfileParams = {
        app?: PreferencesAppName
        configureThisProfile?: ConfigureProfileFn
        isFirefoxDefaultProfile?: IsDefaultProfileFn
        customPrefs?: FirefoxPreferences
        createProfileFinder?: typeof defaultCreateProfileFinder
    }

    export declare const util: {
        ConsoleStream: typeof ConsoleStream
        consoleStream: ConsoleStream
        createLogger: typeof createLogger
    }

    declare type VersionGetterFn = (absolutePackageDir: string) => string

    export declare type WARN = 40

    declare type WatcherCreatorFn = (params: WatcherCreatorParams) => Watchpack

    declare type WatcherCreatorParams = {
        reloadExtension: (arg0: string) => void
        sourceDir: string
        watchFile?: string
        artifactsDir: string
        onSourceChange?: OnSourceChangeFn
        ignoreFiles?: Array<string>
        createFileFilter?: FileFilterCreatorFn
    }

    export {}
}
