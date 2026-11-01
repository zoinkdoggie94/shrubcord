plugins {
    base
}

val isMacHost = System.getProperty("os.name").equals("Mac OS X", ignoreCase = true)

val theosDir = providers.environmentVariable("THEOS")
    .orElse(providers.systemProperty("user.home").map { "$it/theos" })

val coreStaticLib = rootProject.layout.projectDirectory
    .file("core/build/bin/iosArm64/debugStatic/libValencedCore.a")

/** The release JS bundle from `:bundle`, shipped next to the tweak. */
val bundleScope = configurations.dependencyScope("releaseBundle")
dependencies.add(bundleScope.name, dependencies.project(":bundle", "releaseBundle"))
val bundleFiles = configurations.resolvable("releaseBundleFiles") { extendsFrom(bundleScope.get()) }
val bundleDir: FileCollection = files(bundleFiles)

val packageTweak = tasks.register<Exec>("packageTweak") {
    group = "build"
    description = "Builds the ValencedTweak deb with Theos."

    workingDir = layout.projectDirectory.asFile
    commandLine("make", "-j${Runtime.getRuntime().availableProcessors()}", "package")
    environment("THEOS", theosDir.get())
    inputs.files(bundleDir)
    doFirst { environment("VALENCED_BUNDLE_DIR", bundleDir.singleFile.absolutePath) }
    if (isMacHost) {
        dependsOn(":core:linkDebugStaticIosArm64")
        environment("VALENCED_CORE_LIB", coreStaticLib.asFile.absolutePath)
    } else {
        dependsOn(":core:linkValencedCoreStaticIosArm64")
        environment("VALENCED_CORE_LIB", coreStaticLib.asFile.absolutePath)
    }

    doFirst {
        check(file(theosDir.get()).isDirectory) { "Theos is not installed at ${theosDir.get()}" }
        val nativeBinary = coreStaticLib.asFile
        check(nativeBinary.isFile) { "Kotlin/Native output is missing: $nativeBinary" }
        check(bundleDir.singleFile.resolve("valenced.bundle").isFile) { "Release JS bundle is missing" }
    }
}

tasks.named("assemble") {
    dependsOn(packageTweak)
}

val cleanTheos = tasks.register<Exec>("cleanTheos") {
    group = "build"
    description = "Removes Theos build intermediates (.theos/)."
    workingDir = layout.projectDirectory.asFile
    commandLine("make", "clean")
    environment("THEOS", theosDir.get())
    isIgnoreExitValue = true
}

tasks.named<Delete>("clean") {
    dependsOn(cleanTheos)
}
