# FCM Setup for Push Notifications

## Current Status

✅ Notifications saved to database  
✅ Notifications visible in app  
✅ Firebase configured in mobile app  
⏳ Push delivery needs FCM credentials in Expo

## Setup FCM Credentials in Expo

### Option 1: Using Service Account (Recommended - V1 API)

Since you have Firebase Cloud Messaging API (V1) enabled, use the service account:

```powershell
cd C:\Users\Adrianne\Projects\LamboRepos\lamboMobile
eas credentials
```

Select:

1. **Android**
2. **Push Notifications**
3. **Upload Google Service Account**
4. Select file: `C:\Users\Adrianne\Downloads\lambo-mobile-app-firebase-adminsdk-fbsvc-b011b58a65.json`

### Option 2: Using Web UI

1. Go to: https://expo.dev/accounts/bellisperennis143/projects/lambo-mobile
2. Click **Credentials**
3. Select **Android**
4. Under **Push Notifications**, click **Add**
5. Upload: `lambo-mobile-app-firebase-adminsdk-fbsvc-b011b58a65.json`

## After Setup

Once configured, push notifications will be delivered as banners/popups!

Test with:

```powershell
cd C:\Users\Adrianne\Projects\LamboRepos\lambo-web-1
Get-Content notifications\test_send_notification.py | .\.venv\Scripts\python.exe manage.py shell
```

You should see the notification appear on your device! 🎉
