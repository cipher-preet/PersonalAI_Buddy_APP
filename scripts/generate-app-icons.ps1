Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$fontFamilyName = "Arial"

function New-AppIcon {
    param(
        [Parameter(Mandatory = $true)][int]$Size,
        [Parameter(Mandatory = $true)][string]$OutputPath,
        [Parameter(Mandatory = $false)][bool]$Round = $false
    )

    $bitmap = New-Object System.Drawing.Bitmap -ArgumentList @($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $rect = New-Object System.Drawing.Rectangle -ArgumentList @(0, 0, $Size, $Size)
    $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($rect, ([System.Drawing.Color]::FromArgb(255, 139, 92, 246)), ([System.Drawing.Color]::FromArgb(255, 67, 56, 202)), 135)

    if ($Round) {
        $graphicsPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $graphicsPath.AddEllipse(0, 0, $Size, $Size)
        $graphics.SetClip($graphicsPath)
        $graphics.FillPath($gradient, $graphicsPath)
    }
    else {
        $graphics.FillRectangle($gradient, $rect)
    }

    $glowBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(56, 255, 255, 255))
    $glowSize = [int]($Size * 0.52)
    $graphics.FillEllipse($glowBrush, [int]($Size * 0.58), [int](-$Size * 0.08), $glowSize, $glowSize)

    $fontSize = [float]($Size * 0.46)
    $font = New-Object System.Drawing.Font -ArgumentList @($fontFamilyName, $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::White)
    $textRect = New-Object System.Drawing.RectangleF -ArgumentList @(0, [float]($Size * -0.01), $Size, $Size)
    $graphics.DrawString("B", $font, $textBrush, $textRect, $format)

    $directory = Split-Path -Parent $OutputPath
    if (!(Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $textBrush.Dispose()
    $font.Dispose()
    $format.Dispose()
    $glowBrush.Dispose()
    $gradient.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}

function New-AndroidLauncherIcons {
    param(
        [Parameter(Mandatory = $true)][string]$Density,
        [Parameter(Mandatory = $true)][int]$IconSize
    )

    $dir = Join-Path $root "android/app/src/main/res/mipmap-$Density"
    $launcherPath = Join-Path $dir "ic_launcher.png"
    $roundLauncherPath = Join-Path $dir "ic_launcher_round.png"
    $launcherArgs = @{ Size = $IconSize; OutputPath = $launcherPath }
    $roundLauncherArgs = @{ Size = $IconSize; OutputPath = $roundLauncherPath; Round = $true }
    New-AppIcon @launcherArgs
    New-AppIcon @roundLauncherArgs
}

New-AndroidLauncherIcons -Density "mdpi" -IconSize 48
New-AndroidLauncherIcons -Density "hdpi" -IconSize 72
New-AndroidLauncherIcons -Density "xhdpi" -IconSize 96
New-AndroidLauncherIcons -Density "xxhdpi" -IconSize 144
New-AndroidLauncherIcons -Density "xxxhdpi" -IconSize 192

$iosDir = Join-Path $root "ios/AIAssistantApp/Images.xcassets/AppIcon.appiconset"

function New-IosAppIcon {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][int]$IconSize
    )

    $iconPath = Join-Path $iosDir $Name
    $iconArgs = @{ Size = $IconSize; OutputPath = $iconPath }
    New-AppIcon @iconArgs
}

New-IosAppIcon -Name "Icon-App-20x20@2x.png" -IconSize 40
New-IosAppIcon -Name "Icon-App-20x20@3x.png" -IconSize 60
New-IosAppIcon -Name "Icon-App-29x29@2x.png" -IconSize 58
New-IosAppIcon -Name "Icon-App-29x29@3x.png" -IconSize 87
New-IosAppIcon -Name "Icon-App-40x40@2x.png" -IconSize 80
New-IosAppIcon -Name "Icon-App-40x40@3x.png" -IconSize 120
New-IosAppIcon -Name "Icon-App-60x60@2x.png" -IconSize 120
New-IosAppIcon -Name "Icon-App-60x60@3x.png" -IconSize 180
New-IosAppIcon -Name "Icon-App-1024x1024@1x.png" -IconSize 1024
