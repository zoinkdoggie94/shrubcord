"""Apply Shrubcord identity without extracting or changing ZIP entry permissions."""
import os
import plistlib
import sys
import zipfile
from pathlib import Path

BUNDLE_ID = "com.shrubhub.shrubcord"

def brand(path):
    path = Path(path)
    temporary = path.with_suffix(".tmp")
    try:
        with zipfile.ZipFile(path) as source:
            roots = [n for n in source.namelist()
                     if n.startswith("Payload/") and n.count("/") == 2
                     and n.endswith(".app/Info.plist")]
            if len(roots) != 1:
                raise ValueError("Expected exactly one application in Payload")
            root = roots[0]
            info = plistlib.loads(source.read(root))
            original = info["CFBundleIdentifier"]
            if original not in ("com.hammerandchisel.discord", BUNDLE_ID):
                raise ValueError("Expected a Discord application")
            with zipfile.ZipFile(temporary, "w") as output:
                for entry in source.infolist():
                    data = source.read(entry)
                    if entry.filename == root:
                        info.update(CFBundleIdentifier=BUNDLE_ID,
                                    CFBundleDisplayName="Shrubcord",
                                    CFBundleName="Shrubcord")
                        data = plistlib.dumps(info, fmt=plistlib.FMT_BINARY)
                    elif entry.filename.startswith(root.rsplit("/", 1)[0] + "/") and entry.filename.endswith("/Info.plist"):
                        child = plistlib.loads(data)
                        identifier = child.get("CFBundleIdentifier", "")
                        if identifier.startswith(original + "."):
                            child["CFBundleIdentifier"] = BUNDLE_ID + identifier[len(original):]
                            data = plistlib.dumps(child, fmt=plistlib.FMT_BINARY)
                    output.writestr(entry, data)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)

if __name__ == "__main__":
    brand(sys.argv[1])
