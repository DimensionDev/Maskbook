//
//  SafariWebExtensionHandler.m
//  mask-safari Extension
//
//  Created by webjs on 2023/4/22.
//

#import "SafariWebExtensionHandler.h"

#import <SafariServices/SafariServices.h>

#if __MAC_OS_X_VERSION_MIN_REQUIRED < 110000
NSString * const SFExtensionMessageKey = @"message";
#endif

@implementation SafariWebExtensionHandler

- (void)beginRequestWithExtensionContext:(NSExtensionContext *)context {
    id message = [context.inputItems.firstObject userInfo][SFExtensionMessageKey];
    NSLog(@"Received message from browser.runtime.sendNativeMessage: %@", message);

    NSExtensionItem *response = [[NSExtensionItem alloc] init];
    response.userInfo = @{ SFExtensionMessageKey: @{ @"Response to": message } };

    [context completeRequestReturningItems:@[ response ] completionHandler:nil];
}

@end
