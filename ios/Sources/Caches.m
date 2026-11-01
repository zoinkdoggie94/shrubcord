#import "Bridge.h"
#import "Constants.h"
#import "Utils.h"

// Discord can replace its JS bundle without changing CFBundleVersion.
// Module and asset IDs are valid only for the current runtime.
static const int kModulesCacheVersion = 3;
static const int kAssetsCacheVersion = 2;

void RegisterCachesMethods(void) {
    __block NSDictionary *modulesCache = nil;
    __block NSDictionary *assetsCache = nil;

    // Discard files from older builds. Keep plugin settings and login data.
    NSURL *cacheDirectory = [getValencedDirectory() URLByAppendingPathComponent:CACHE_DIR];
    NSFileManager *manager = [NSFileManager defaultManager];
    for (NSURL *file in [manager contentsOfDirectoryAtURL:cacheDirectory
                             includingPropertiesForKeys:nil options:0 error:nil]) {
        if ([file.lastPathComponent hasPrefix:@"modules."] ||
            [file.lastPathComponent hasPrefix:@"assets."]) {
            [manager removeItemAtURL:file error:nil];
        }
    }

    bridgeHandlers()[@"valenced.caches.modules.read"] = ^NSDictionary *(NSArray *args) {
        return @{@"result": modulesCache ?: [NSNull null]};
    };

    bridgeHandlers()[@"valenced.caches.modules.write"] = ^NSDictionary *(NSArray *args) {
        id blacklist = args.count > 0 ? args[0] : nil;
        id finds = args.count > 1 ? args[1] : nil;
        if (![blacklist isKindOfClass:[NSArray class]]) return @{@"error": @"Expected a blacklist argument"};
        if (![finds isKindOfClass:[NSDictionary class]]) return @{@"error": @"Expected a finds argument"};
        modulesCache = @{@"blacklist": blacklist, @"finds": finds, @"version": @(kModulesCacheVersion)};
        return @{@"result": [NSNull null]};
    };

    bridgeHandlers()[@"valenced.caches.assets.read"] = ^NSDictionary *(NSArray *args) {
        return @{@"result": assetsCache ?: [NSNull null]};
    };

    bridgeHandlers()[@"valenced.caches.assets.write"] = ^NSDictionary *(NSArray *args) {
        id data = args.firstObject;
        if (![data isKindOfClass:[NSDictionary class]]) return @{@"error": @"Expected a data argument"};
        assetsCache = @{@"data": data, @"version": @(kAssetsCacheVersion)};
        return @{@"result": [NSNull null]};
    };
}
