# icon
mkdir icons.iconset
sips -z 16 16 logo-1.png -o icons.iconset/icon_16x16.png
sips -z 32 32 logo-1.png -o icons.iconset/icon_16x16@2x.png
sips -z 32 32 logo-1.png -o icons.iconset/icon_32x32.png
sips -z 64 64 logo-1.png -o icons.iconset/icon_32x32@2x.png
sips -z 128 128 logo-1.png -o icons.iconset/icon_128x128.png
sips -z 256 256 logo-1.png -o icons.iconset/icon_128x128@2x.png
sips -z 256 256 logo-1.png -o icons.iconset/icon_256x256.png
sips -z 512 512 logo-1.png -o icons.iconset/icon_256x256@2x.png
sips -z 512 512 logo-1.png -o icons.iconset/icon_512x512.png
sips -z 1024 1024 logo-1.png -o icons.iconset/icon_512x512@2x.png
iconutil -c icns icons.iconset -o icon.icns
mv icons.iconset/icon_512x512@2x.png icon_for_ico.png
rm -rf icons.iconset

# transparent
sips -z 32 32 logo-2.png -o 32x32.png
sips -z 128 128 logo-2.png -o 128x128.png
sips -z 256 256 logo-2.png -o 128x128@2x.png
sips -z 44 44 logo-2.png -o Square44x44Logo.png
sips -z 50 50 logo-2.png -o StoreLogo.png
sips -z 71 71 logo-2.png -o Square71x71Logo.png
sips -z 89 89 logo-2.png -o Square89x89Logo.png
sips -z 107 107 logo-2.png -o Square107x107Logo.png
sips -z 142 142 logo-2.png -o Square142x142Logo.png
sips -z 150 150 logo-2.png -o Square150x150Logo.png
sips -z 284 284 logo-2.png -o Square284x284Logo.png
sips -z 310 310 logo-2.png -o Square310x310Logo.png
