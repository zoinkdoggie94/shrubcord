# Shrubcord

An iOS-only Discord modification based on Valenced. Bundle ID: `com.shrubhub.shrubcord`.

Includes the inherited plugin and appearance system, plus a recovery cache-reset action,
a fix for shake-menu reloads, and fewer repeated filesystem reads for missing caches.
Settings, bundled plugin descriptions, recovery dialogs and artwork use Shrubcord branding.
Internal Valenced module names remain for plugin and storage compatibility.
Android sources are retained as upstream reference; Shrubcord release automation builds iOS only.

## Automatic IPA releases

Add a repository Actions secret named `DISCORD_IPA_URL` containing a direct HTTPS URL
to a decrypted Discord IPA. In GitHub: Settings → Secrets and variables → Actions →
New repository secret. Expiring download URLs must be renewed before builds.
Never commit the URL or put it in an Actions variable.

Every push to `main` builds the current tweak and publishes an IPA in GitHub Releases.
After setting the secret, run **Shrubcord Release** manually to retry without a code change.
Builds use Java 25, Deno, Kotlin/Native and Theos on a macOS runner.
No upstream apt repository dispatch or Android signing secrets are required.

The packaged app is unsigned and needs signing with your chosen iOS sideloading tool.
Changing the bundle ID may affect push notifications, keychain access, app groups and extensions;
these need verification with your signing setup. Discord 351.0 compatibility and performance
have not been verified on a device.

## Recovery

Shake the device to open Shrubcord Recovery Options. Reload and recovery mode restart
the app; reopen it afterward. **Reset Caches & Restart** removes loader caches
without deleting plugin configuration.

## Development and attribution

`./gradlew :ios:packageTweak` builds the loader and bundled JS on macOS with Theos.
`./gradlew :bundle:testBundle` runs bundle checks.
`python3 -m unittest discover -s scripts -p 'test_*.py'` checks IPA identity packaging.

Based on [Valenced](https://github.com/Valenced). Original copyright notices and licenses
are preserved. See [LICENSE](LICENSE) (GPL-3.0) and the licenses in individual modules.
