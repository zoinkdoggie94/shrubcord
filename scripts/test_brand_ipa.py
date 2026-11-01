import plistlib
import tempfile
import unittest
import zipfile
from pathlib import Path
from brand_ipa import brand, BUNDLE_ID

class BrandingTests(unittest.TestCase):
    def test_identity_extensions_and_permissions(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "app.ipa"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("Payload/Discord.app/Info.plist", plistlib.dumps({
                    "CFBundleIdentifier": "com.hammerandchisel.discord",
                    "CFBundleShortVersionString": "351.0"}))
                archive.writestr("Payload/Discord.app/PlugIns/Widget.appex/Info.plist",
                    plistlib.dumps({"CFBundleIdentifier": "com.hammerandchisel.discord.Widget"}))
                executable = zipfile.ZipInfo("Payload/Discord.app/Discord")
                executable.external_attr = 0o100755 << 16
                archive.writestr(executable, b"executable")
            brand(path)
            with zipfile.ZipFile(path) as archive:
                info = plistlib.loads(archive.read("Payload/Discord.app/Info.plist"))
                self.assertEqual(info["CFBundleIdentifier"], BUNDLE_ID)
                self.assertEqual(info["CFBundleDisplayName"], "Shrubcord")
                self.assertEqual(info["CFBundleShortVersionString"], "351.0")
                child = plistlib.loads(archive.read("Payload/Discord.app/PlugIns/Widget.appex/Info.plist"))
                self.assertEqual(child["CFBundleIdentifier"], BUNDLE_ID + ".Widget")
                self.assertEqual(archive.getinfo("Payload/Discord.app/Discord").external_attr >> 16, 0o100755)
            brand(path)

    def test_invalid_input_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.ipa"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("bad", b"bad")
            before = path.read_bytes()
            with self.assertRaises(ValueError):
                brand(path)
            self.assertEqual(path.read_bytes(), before)
            self.assertFalse(path.with_suffix(".tmp").exists())
