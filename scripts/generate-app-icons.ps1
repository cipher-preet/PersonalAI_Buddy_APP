Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Convert-Scale {
    param(
        [Parameter(Mandatory = $true)][int]$Size,
        [Parameter(Mandatory = $true)][float]$Value
    )

    return [float]($Size * $Value / 1024)
}

function New-ScaledPoint {
    param(
        [Parameter(Mandatory = $true)][int]$Size,
        [Parameter(Mandatory = $true)][float]$X,
        [Parameter(Mandatory = $true)][float]$Y
    )

    return New-Object System.Drawing.PointF -ArgumentList @((Convert-Scale $Size $X), (Convert-Scale $Size $Y))
}

function Add-ScaledBezier {
    param(
        [Parameter(Mandatory = $true, Position = 0)][System.Drawing.Drawing2D.GraphicsPath]$Path,
        [Parameter(Mandatory = $true, Position = 1)][int]$Size,
        [Parameter(Mandatory = $true, Position = 2)][float[]]$Coords
    )

    if (($Coords.Length -ne 6) -and ($Coords.Length -ne 8)) {
        throw "Add-ScaledBezier expected 6 or 8 coordinate values and received $($Coords.Length)."
    }

    if ($Coords.Length -eq 6) {
        $Path.AddBezier(
            $Path.GetLastPoint(),
            (New-ScaledPoint $Size $Coords[0] $Coords[1]),
            (New-ScaledPoint $Size $Coords[2] $Coords[3]),
            (New-ScaledPoint $Size $Coords[4] $Coords[5])
        )
    }
    else {
        $Path.AddBezier(
            (New-ScaledPoint $Size $Coords[0] $Coords[1]),
            (New-ScaledPoint $Size $Coords[2] $Coords[3]),
            (New-ScaledPoint $Size $Coords[4] $Coords[5]),
            (New-ScaledPoint $Size $Coords[6] $Coords[7])
        )
    }
}

function New-BuddyBubblePath {
    param([Parameter(Mandatory = $true)][int]$Size)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.StartFigure()
    Add-ScaledBezier $path $Size @(192, 713, 126, 615, 128, 467, 178, 351)
    Add-ScaledBezier $path $Size @(242, 205, 392, 119, 580, 117)
    Add-ScaledBezier $path $Size @(682, 116, 769, 137, 828, 177)
    Add-ScaledBezier $path $Size @(811, 202, 771, 224, 736, 237)
    Add-ScaledBezier $path $Size @(812, 265, 864, 327, 891, 416)
    Add-ScaledBezier $path $Size @(930, 545, 883, 680, 774, 751)
    Add-ScaledBezier $path $Size @(690, 806, 585, 799, 501, 814)
    Add-ScaledBezier $path $Size @(430, 827, 370, 868, 303, 929)
    Add-ScaledBezier $path $Size @(278, 952, 242, 935, 244, 898)
    Add-ScaledBezier $path $Size @(245, 867, 245, 837, 245, 806)
    Add-ScaledBezier $path $Size @(224, 790, 207, 759, 192, 713)
    $path.CloseFigure()

    return $path
}

function New-BuddyFacePath {
    param([Parameter(Mandatory = $true)][int]$Size)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.StartFigure()
    Add-ScaledBezier $path $Size @(277, 474, 296, 363, 399, 320, 532, 323)
    Add-ScaledBezier $path $Size @(664, 325, 723, 377, 726, 491)
    Add-ScaledBezier $path $Size @(730, 604, 659, 668, 519, 673)
    Add-ScaledBezier $path $Size @(376, 678, 264, 632, 277, 474)
    $path.CloseFigure()

    return $path
}

function New-SparklePath {
    param([Parameter(Mandatory = $true)][int]$Size)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.StartFigure()
    $path.AddLine((New-ScaledPoint $Size 828 224), (New-ScaledPoint $Size 864 284))
    $path.AddLine((New-ScaledPoint $Size 864 284), (New-ScaledPoint $Size 922 312))
    $path.AddLine((New-ScaledPoint $Size 922 312), (New-ScaledPoint $Size 864 340))
    $path.AddLine((New-ScaledPoint $Size 864 340), (New-ScaledPoint $Size 828 404))
    $path.AddLine((New-ScaledPoint $Size 828 404), (New-ScaledPoint $Size 792 340))
    $path.AddLine((New-ScaledPoint $Size 792 340), (New-ScaledPoint $Size 735 312))
    $path.AddLine((New-ScaledPoint $Size 735 312), (New-ScaledPoint $Size 792 284))
    $path.AddLine((New-ScaledPoint $Size 792 284), (New-ScaledPoint $Size 828 224))
    $path.CloseFigure()

    return $path
}

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
    $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($rect, ([System.Drawing.Color]::FromArgb(255, 251, 249, 255)), ([System.Drawing.Color]::FromArgb(255, 239, 236, 250)), 135)

    if ($Round) {
        $graphicsPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $graphicsPath.AddEllipse(0, 0, $Size, $Size)
        $graphics.SetClip($graphicsPath)
        $graphics.FillPath($background, $graphicsPath)
    }
    else {
        $graphics.FillRectangle($background, $rect)
    }

    $bubblePath = New-BuddyBubblePath $Size
    $bubbleGradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList @($rect, ([System.Drawing.Color]::FromArgb(255, 77, 63, 222)), ([System.Drawing.Color]::FromArgb(255, 47, 41, 154)), 135)
    $graphics.FillPath($bubbleGradient, $bubblePath)

    $shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    Add-ScaledBezier $shadowPath $Size @(745, 246, 873, 350, 896, 510, 917, 656)
    Add-ScaledBezier $shadowPath $Size @(802, 752, 649, 773, 565, 785)
    Add-ScaledBezier $shadowPath $Size @(565, 785, 475, 793, 394, 855)
    Add-ScaledBezier $shadowPath $Size @(516, 768, 704, 767, 793, 680)
    Add-ScaledBezier $shadowPath $Size @(876, 598, 885, 442, 813, 326)
    Add-ScaledBezier $shadowPath $Size @(792, 292, 769, 266, 745, 246)
    $shadowPath.CloseFigure()
    $shadowBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(80, 153, 112, 244))
    $graphics.FillPath($shadowBrush, $shadowPath)

    $facePath = New-BuddyFacePath $Size
    $faceBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(255, 250, 249, 255))
    $graphics.FillPath($faceBrush, $facePath)

    $eyeBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(255, 43, 36, 139))
    $graphics.FillEllipse($eyeBrush, [int](Convert-Scale $Size 372), [int](Convert-Scale $Size 454), [int](Convert-Scale $Size 63), [int](Convert-Scale $Size 87))
    $graphics.FillEllipse($eyeBrush, [int](Convert-Scale $Size 570), [int](Convert-Scale $Size 454), [int](Convert-Scale $Size 63), [int](Convert-Scale $Size 87))

    $smilePen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(255, 43, 36, 139)), [float](Convert-Scale $Size 18))
    $smilePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $smilePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawBezier(
        $smilePen,
        (New-ScaledPoint $Size 458 566),
        (New-ScaledPoint $Size 482 603),
        (New-ScaledPoint $Size 536 605),
        (New-ScaledPoint $Size 557 566)
    )

    $sparklePath = New-SparklePath $Size
    $sparkleStroke = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(255, 250, 249, 255)), [float](Convert-Scale $Size 24))
    $sparkleStroke.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $sparkleBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(255, 31, 190, 208))
    $graphics.DrawPath($sparkleStroke, $sparklePath)
    $graphics.FillPath($sparkleBrush, $sparklePath)

    $directory = Split-Path -Parent $OutputPath
    if (!(Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $sparkleBrush.Dispose()
    $sparkleStroke.Dispose()
    $sparklePath.Dispose()
    $smilePen.Dispose()
    $eyeBrush.Dispose()
    $faceBrush.Dispose()
    $facePath.Dispose()
    $shadowBrush.Dispose()
    $shadowPath.Dispose()
    $bubbleGradient.Dispose()
    $bubblePath.Dispose()
    $background.Dispose()
    if ($Round) {
        $graphicsPath.Dispose()
    }
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
