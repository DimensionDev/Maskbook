//
//  ViewController.m
//  mask-safari
//
//  Created by webjs on 2023/4/22.
//

#import "ViewController.h"

#import <SafariServices/SafariServices.h>
#import <WebKit/WebKit.h>

static NSString * const extensionBundleIdentifier = @"Maskbook.Safari.mask-safari.Extension";

@interface ViewController () <WKNavigationDelegate, WKScriptMessageHandler>

@property (nonatomic) IBOutlet WKWebView *webView;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    _webView.navigationDelegate = self;

    [_webView.configuration.userContentController addScriptMessageHandler:self name:@"controller"];

    [_webView loadFileURL:[NSBundle.mainBundle URLForResource:@"Main" withExtension:@"html"] allowingReadAccessToURL:NSBundle.mainBundle.resourceURL];
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    [SFSafariExtensionManager getStateOfSafariExtensionWithIdentifier:extensionBundleIdentifier completionHandler:^(SFSafariExtensionState *state, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (!state) {
                // Insert code to inform the user something went wrong.
                return;
            }

            NSString *isExtensionEnabledAsString = state.isEnabled ? @"true" : @"false";
            if (@available(macOS 13, *)) {
                [webView evaluateJavaScript:[NSString stringWithFormat:@"show(%@, true)", isExtensionEnabledAsString] completionHandler:nil];
            } else {
                [webView evaluateJavaScript:[NSString stringWithFormat:@"show(%@, false)", isExtensionEnabledAsString] completionHandler:nil];
            }
        });
    }];
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    if (![message.body isEqualToString:@"open-preferences"])
        return;

    [SFSafariApplication showPreferencesForExtensionWithIdentifier:extensionBundleIdentifier completionHandler:^(NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [NSApplication.sharedApplication terminate:nil];
        });
    }];
}

@end
