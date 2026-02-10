# Merge Master - App Store Publishing Guide

## STEP 1: Test the Game Locally

1. Open Finder → iCloud Drive → CLAUDE CODE → MergeMaster
2. Double-click `index.html` to open in browser
3. Play the game to make sure it works
4. Test on mobile by hosting locally or using a tool

---

## STEP 2: Create App Icons

You need PNG icons in these sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### How to create icons:

**Option A: Online Tool (Easy)**
1. Go to https://www.canva.com (free)
2. Create 512x512 design
3. Use the icon.svg as reference
4. Download as PNG
5. Use https://www.appicon.co to generate all sizes

**Option B: Use the SVG**
1. Open icon.svg in browser
2. Take screenshot
3. Use https://www.iloveimg.com/resize-image to create all sizes

Save icons as:
- icons/icon-72.png
- icons/icon-96.png
- icons/icon-128.png
- icons/icon-144.png
- icons/icon-152.png
- icons/icon-192.png
- icons/icon-384.png
- icons/icon-512.png

---

## STEP 3: Create Privacy Policy

Required for both app stores. Create at:
- https://app-privacy-policy-generator.firebaseapp.com (free)

Or use the included `privacy-policy.html`

Host it online (can use GitHub Pages or your website)

---

## STEP 4: Take Screenshots

You need screenshots for app store listings:

**For iPhone:**
- 6.5" (1284 x 2778) - iPhone 14 Pro Max
- 5.5" (1242 x 2208) - iPhone 8 Plus

**For Android:**
- Phone: 1080 x 1920 minimum
- Tablet: 1200 x 1920 (optional)

### How to take screenshots:
1. Open game in Chrome
2. Press F12 (Developer Tools)
3. Click device icon (toggle device toolbar)
4. Select iPhone 14 Pro Max or similar
5. Take screenshot (Cmd+Shift+4 on Mac)

Take screenshots of:
- Main game screen
- Game in progress
- Win screen
- High score

---

## STEP 5: Set Up Developer Accounts

### Apple App Store ($99/year)
1. Go to https://developer.apple.com
2. Click "Account" → "Enroll"
3. Sign in with Apple ID (or create one)
4. Pay $99 enrollment fee
5. Wait for approval (usually 24-48 hours)

### Google Play Store ($25 one-time)
1. Go to https://play.google.com/console
2. Sign in with Google account
3. Pay $25 registration fee
4. Complete account details

---

## STEP 6: Package the Game (Convert to Native App)

### Option A: Using Capacitor (Recommended)

**Prerequisites:**
- Node.js installed (https://nodejs.org)
- Xcode installed (Mac App Store, free)
- Android Studio installed (https://developer.android.com/studio)

**Steps:**

```bash
# 1. Install Capacitor
cd /path/to/MergeMaster
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# 2. Initialize Capacitor
npx cap init "Merge Master" "com.yourname.mergemaster"

# 3. Add platforms
npx cap add ios
npx cap add android

# 4. Copy web files
npx cap copy

# 5. Open in Xcode (iOS)
npx cap open ios

# 6. Open in Android Studio (Android)
npx cap open android
```

### Option B: Using PWA Builder (Easier)

1. Host game online (Netlify, GitHub Pages)
2. Go to https://www.pwabuilder.com
3. Enter your URL
4. Generate packages for iOS and Android
5. Download and submit

---

## STEP 7: Submit to Apple App Store

1. Open Xcode
2. Select your project
3. Go to Product → Archive
4. Click "Distribute App"
5. Select "App Store Connect"
6. Follow prompts

### In App Store Connect:
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in details:
   - Name: Merge Master
   - Primary Language: English
   - Bundle ID: com.yourname.mergemaster
   - SKU: mergemaster001
4. Add screenshots
5. Add description (see below)
6. Set price (Free, $0.99, $1.99, etc.)
7. Submit for review

---

## STEP 8: Submit to Google Play Store

1. Open Android Studio
2. Build → Generate Signed Bundle/APK
3. Create new keystore (save safely!)
4. Build release APK or AAB

### In Google Play Console:
1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in details
4. Upload AAB/APK
5. Add screenshots
6. Add description
7. Set content rating (complete questionnaire)
8. Set price
9. Submit for review

---

## APP STORE DESCRIPTIONS

### Short Description (80 characters):
```
Swipe to merge tiles. Reach 2048. How high can you score?
```

### Full Description:
```
Merge Master - The Ultimate Number Puzzle Game!

Swipe to move tiles. When two tiles with the same number touch, they merge into one! Start with 2s, merge to 4s, then 8s, and keep going until you reach the legendary 2048 tile!

FEATURES:
★ Simple, addictive gameplay
★ Clean, modern design
★ Smooth animations
★ Works offline
★ No ads (or minimal ads)
★ Saves your best score
★ Free to play

HOW TO PLAY:
• Swipe in any direction to move all tiles
• Tiles with the same number merge when they collide
• Keep merging to create higher numbers
• Try to reach 2048!

Challenge yourself and beat your high score!

Perfect for quick gaming sessions or extended play.
```

### Keywords (iOS):
```
puzzle, 2048, merge, tiles, number, brain, logic, casual, addictive, free
```

---

## STEP 9: Monetization Options

### Option A: Paid App
- Set price: $0.99 - $2.99
- Simple, no ads
- Apple takes 30%, you get 70%

### Option B: Free with Ads
- Add AdMob ads
- Banner at bottom or interstitial between games
- More downloads, revenue from ads

### Option C: Freemium
- Free to play
- In-app purchase to remove ads ($1.99)
- In-app purchase for themes ($0.99)

---

## STEP 10: After Launch

1. Monitor reviews and ratings
2. Respond to feedback
3. Fix bugs quickly
4. Add new features:
   - Different themes
   - Leaderboards (Game Center / Google Play Games)
   - Daily challenges
   - Different grid sizes (5x5, 6x6)

---

## TIMELINE

| Task | Time |
|------|------|
| Test & Polish | 1-2 days |
| Create Icons & Screenshots | 1 day |
| Set up Developer Accounts | 1-3 days |
| Package App | 1 day |
| Submit to Stores | 1 day |
| Apple Review | 1-7 days |
| Google Review | 1-3 days |
| **Total** | **1-2 weeks** |

---

## COSTS

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Google Play Account | $25 one-time |
| **Total to Start** | **$124** |

---

## NEED HELP?

Resources:
- Apple Developer Documentation: https://developer.apple.com/documentation/
- Android Developer Guide: https://developer.android.com/guide
- Capacitor Docs: https://capacitorjs.com/docs
- PWA Builder: https://www.pwabuilder.com

Good luck with your app launch!
