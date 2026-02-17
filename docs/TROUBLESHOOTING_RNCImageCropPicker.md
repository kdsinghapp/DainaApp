# Fix: RNCImageCropPicker could not be found

This app **does not use** `react-native-image-crop-picker`. The error usually appears when:

- An old JS bundle or native build is still on the device
- Metro cache or Android build cache is stale

## What was done

- Removed `node_modules/.cache`
- Removed `android/app/build`, `android/build`, `android/.gradle`

## What you need to run

In the project root, run:

```bash
# 1. Reset Metro cache and start bundler (in one terminal)
npx react-native start --reset-cache

# 2. In another terminal: clean and rebuild Android
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

If you use watchman:

```bash
watchman watch-del-all
```

Then start the app again with `npx react-native start --reset-cache` and `npx react-native run-android`.

## If the error persists

- Uninstall the app from the device/emulator (moto g05), then run `npx react-native run-android` again so a fresh install is done.
- Confirm you are on the correct branch and that no file imports `react-native-image-crop-picker` or `NativeImageCropPicker`. This project uses `@react-native-documents/picker` and `react-native-image-picker` only.
