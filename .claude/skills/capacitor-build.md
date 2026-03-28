# Skill: Capacitor Build & Deploy

## When to use

When building for iOS/Android simulator or device.

## Build flow

```bash
cd client
ng build --configuration=production    # Build Angular app
npx cap sync                           # Sync web assets + plugins to native
npx cap open ios                       # Open Xcode project
# In Xcode: select simulator, click Run
```

## Common issues

- **White screen on device**: Check browser console via Safari Web Inspector. Usually a missing polyfill or CORS issue.
- **API calls fail on device**: Capacitor runs on `capacitor://localhost` (iOS) or `http://localhost` (Android). Server CORS must allow these origins.
- **Safe area overlap**: Use `<ion-header>` and `<ion-content>` — they handle safe areas. Don't use raw `<div>` for layout.
- **Keyboard pushes content up**: Ionic handles this by default with `<ion-content>`. Don't fight it.

## Verification after build

- [ ] App loads without white screen
- [ ] Portfolio data displays correctly
- [ ] AI chat works (messages send, streaming displays)
- [ ] Scroll works smoothly
- [ ] Navigation works (tabs or routing)
- [ ] No console errors in Safari Web Inspector

## Environment config

Client `environment.ts` should detect platform:

- Browser dev: `http://localhost:8000`
- Capacitor: `http://<your-local-ip>:8000` (device can't reach localhost)
