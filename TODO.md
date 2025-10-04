# TODO: Add Test Push Notification Button

## Completed Tasks
- [x] Add EXPO_ACCESS_TOKEN to app.json extra config
- [x] Implement sendTestPushNotification function in src/lib/push.ts
- [x] Add test button in src/screens/startApp/getStarted.tsx with handler
- [x] Install expo-notifications dependency
- [x] Add expo-notifications plugin to app.json
- [x] Run expo prebuild --clean to link native modules

## Remaining Tasks
- [x] Replace "YOUR_EXPO_ACCESS_TOKEN" in app.json with the actual Expo access token
- [ ] Test the push notification functionality by logging in and pressing the test button
- [ ] Verify that the notification is received on the device

## Notes
- The test button is added in getStarted.tsx as requested
- It requires the user to be logged in to work
- If no user is logged in, it shows an alert to log in first
- The function fetches the user's push token from the database and sends a test notification via Expo API
- expo-notifications plugin has been added to app.json and prebuild run to resolve native module issues
