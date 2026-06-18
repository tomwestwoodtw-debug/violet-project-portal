$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DeployRoot = Join-Path $Root ".deploy"
$PackageDir = Join-Path $DeployRoot "violet-project-portal-godaddy"
$AppDir = Join-Path $PackageDir "violet-project-portal"
$ZipPath = Join-Path $DeployRoot "violet-project-portal-godaddy.zip"

Set-Location $Root

Write-Host "Building Violet Project Portal..."
pnpm build

if (Test-Path -LiteralPath $DeployRoot) {
  $resolvedDeployRoot = Resolve-Path -LiteralPath $DeployRoot
} else {
  New-Item -ItemType Directory -Path $DeployRoot | Out-Null
  $resolvedDeployRoot = Resolve-Path -LiteralPath $DeployRoot
}

if (Test-Path -LiteralPath $PackageDir) {
  $resolvedPackageDir = Resolve-Path -LiteralPath $PackageDir
  if (-not $resolvedPackageDir.Path.StartsWith($resolvedDeployRoot.Path, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove a package directory outside .deploy."
  }
  Remove-Item -LiteralPath $PackageDir -Recurse -Force
}

if (Test-Path -LiteralPath $ZipPath) {
  Remove-Item -LiteralPath $ZipPath -Force
}

New-Item -ItemType Directory -Path $AppDir | Out-Null

$directoriesToCopy = @("app", "pages", "public")
$filesToCopy = @(
  ".env.example",
  "eslint.config.mjs",
  "godaddy-build.js",
  "next.config.ts",
  "package.json",
  "postcss.config.mjs",
  "server.js",
  "tsconfig.json"
)

foreach ($dir in $directoriesToCopy) {
  Copy-Item -LiteralPath (Join-Path $Root $dir) -Destination $AppDir -Recurse -Force
}

foreach ($file in $filesToCopy) {
  Copy-Item -LiteralPath (Join-Path $Root $file) -Destination $AppDir -Force
}

$packageJsonPath = Join-Path $AppDir "package.json"
$packageJson = Get-Content -Raw -LiteralPath $packageJsonPath | ConvertFrom-Json

if ($packageJson.devDependencies) {
  if (-not $packageJson.dependencies) {
    $packageJson | Add-Member -NotePropertyName "dependencies" -NotePropertyValue ([pscustomobject]@{})
  }

  $packageJson.devDependencies.PSObject.Properties | ForEach-Object {
    $packageJson.dependencies | Add-Member -NotePropertyName $_.Name -NotePropertyValue $_.Value -Force
  }

  $packageJson.PSObject.Properties.Remove("devDependencies")
}

$packageJson.PSObject.Properties.Remove("packageManager")
$packageJson.engines = [ordered]@{
  "node" = ">=18.18.0"
}
$packageJson.scripts = [ordered]@{
  "build" = "node godaddy-build.js"
  "start" = "cross-env NODE_ENV=production next start"
}

$packageJson.dependencies | Add-Member -NotePropertyName "cross-env" -NotePropertyValue "^7.0.3" -Force

$packageJsonText = $packageJson | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($packageJsonPath, $packageJsonText, $utf8NoBom)

Push-Location $AppDir
try {
  npm install --package-lock-only --ignore-scripts --no-audit --no-fund
} finally {
  Pop-Location
}

Compress-Archive -Path $AppDir -DestinationPath $ZipPath -Force

$zipInfo = Get-Item -LiteralPath $ZipPath
$sizeMb = [Math]::Round($zipInfo.Length / 1MB, 2)

Write-Host "Created $ZipPath ($sizeMb MB)."
Write-Host "Upload this zip to GoDaddy Node.js Hosting, then add the real environment variables in the GoDaddy UI."
