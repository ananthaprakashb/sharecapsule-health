import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const androidDir = resolve(root, 'android')
const release = JSON.parse(readFileSync(resolve(root, 'mobile/android-release.json'), 'utf8'))
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

function run(args) {
  const result = spawnSync(npx, args, { cwd: root, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`Command failed: npx ${args.join(' ')}`)
}

function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`Unable to find ${label} in generated Android project.`)
  return source.replace(pattern, replacement)
}

if (!existsSync(resolve(root, 'dist/index.html'))) {
  throw new Error('dist/index.html is missing. Run npm run build before preparing Android.')
}

if (!existsSync(androidDir)) {
  console.log('Creating Capacitor Android project...')
  run(['cap', 'add', 'android'])
}

console.log('Syncing bundled Vital web assets into Android...')
run(['cap', 'sync', 'android'])

console.log('Generating Vital Android icons and splash resources...')
run([
  '@capacitor/assets',
  'generate',
  '--android',
  '--assetPath',
  'assets',
  '--iconBackgroundColor',
  '#12392f',
  '--iconBackgroundColorDark',
  '#061f25',
  '--splashBackgroundColor',
  '#f5f2e8',
  '--splashBackgroundColorDark',
  '#061f25',
])

const manifestPath = resolve(androidDir, 'app/src/main/AndroidManifest.xml')
let manifest = readFileSync(manifestPath, 'utf8')

for (const permission of [
  'android.permission.INTERNET',
  'android.permission.RECORD_AUDIO',
  'android.permission.MODIFY_AUDIO_SETTINGS',
]) {
  if (!manifest.includes(`android:name="${permission}"`)) {
    manifest = manifest.replace(
      /\n\s*<application/,
      `\n    <uses-permission android:name="${permission}" />\n\n    <application`,
    )
  }
}

if (/android:allowBackup="[^"]*"/.test(manifest)) {
  manifest = manifest.replace(/android:allowBackup="[^"]*"/, 'android:allowBackup="false"')
} else {
  manifest = manifest.replace('<application', '<application android:allowBackup="false"')
}

if (/android:usesCleartextTraffic="[^"]*"/.test(manifest)) {
  manifest = manifest.replace(/android:usesCleartextTraffic="[^"]*"/, 'android:usesCleartextTraffic="false"')
} else {
  manifest = manifest.replace('<application', '<application android:usesCleartextTraffic="false"')
}

writeFileSync(manifestPath, manifest)

const gradlePath = resolve(androidDir, 'app/build.gradle')
let gradle = readFileSync(gradlePath, 'utf8')
gradle = replaceRequired(
  gradle,
  /applicationId\s+["'][^"']+["']/,
  `applicationId "${release.applicationId}"`,
  'applicationId',
)
gradle = replaceRequired(gradle, /versionCode\s+\d+/, `versionCode ${release.versionCode}`, 'versionCode')
gradle = replaceRequired(
  gradle,
  /versionName\s+["'][^"']+["']/,
  `versionName "${release.versionName}"`,
  'versionName',
)
writeFileSync(gradlePath, gradle)

const variables = readFileSync(resolve(androidDir, 'variables.gradle'), 'utf8')
const targetMatch = variables.match(/targetSdkVersion\s*=\s*(\d+)/)
const minMatch = variables.match(/minSdkVersion\s*=\s*(\d+)/)
if (Number(targetMatch?.[1]) !== release.targetSdk) {
  throw new Error(`Expected Android target SDK ${release.targetSdk}, found ${targetMatch?.[1] ?? 'unknown'}.`)
}
if (Number(minMatch?.[1]) !== release.minSdk) {
  throw new Error(`Expected Android min SDK ${release.minSdk}, found ${minMatch?.[1] ?? 'unknown'}.`)
}

if (!gradle.includes(`applicationId "${release.applicationId}"`)) {
  throw new Error('Generated Android applicationId does not match mobile/android-release.json.')
}

console.log(`Vital Android ${release.versionName} (${release.versionCode}) is prepared.`)
console.log(`Application ID: ${release.applicationId}`)
console.log(`SDK range: ${release.minSdk}–${release.targetSdk}`)
console.log('Next: npx cap open android, or build with android/gradlew bundleRelease.')
