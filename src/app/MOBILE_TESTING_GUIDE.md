# Mobile Testing & Optimization Guide

## Quick Performance Check

### View Current Optimizations
Add this to your URL to see active mobile optimizations:
```
?mobile-status=true
```

### Check Web Vitals in Console
Open browser console and check for performance metrics:
- ✅ LCP (Largest Contentful Paint) - Target: < 2.5s
- ✅ FID (First Input Delay) - Target: < 100ms  
- ✅ CLS (Cumulative Layout Shift) - Target: < 0.1

### View Stored Metrics
```javascript
// In browser console:
JSON.parse(localStorage.getItem('web-vitals'))
```

## Testing on Real Devices

### iOS Safari
1. **Test Touch Targets**
   - All buttons should be at least 44x44px
   - Easy to tap without zooming
   
2. **Check Form Inputs**
   - Should NOT zoom when focused
   - Keyboard should appear smoothly
   - Safe area (notch) should be respected

3. **Scroll Performance**
   - Should feel smooth and native
   - No janky animations
   - Floating nav appears/disappears smoothly

### Android Chrome
1. **Test Pull-to-Refresh**
   - Should work naturally
   - No conflicts with page interactions

2. **Check Viewport**
   - Content fits without horizontal scroll
   - Status bar color matches theme

3. **Test Network Throttling**
   - Enable "Slow 3G" in Chrome DevTools
   - Images should lazy load
   - Animations should be reduced

## Chrome DevTools Mobile Testing

### 1. Open DevTools
- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

### 2. Toggle Device Toolbar
- Click device icon or press `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows)

### 3. Test Different Devices
- iPhone SE (small screen)
- iPhone 14 Pro (notch)
- iPad Air (tablet)
- Samsung Galaxy S20 (Android)

### 4. Network Throttling
Navigate to: **Network tab → Throttling → Slow 3G**

Expected behavior:
- Hero image still loads quickly (high priority)
- Gallery images lazy load
- Animations reduce automatically
- No blocking resources

### 5. Performance Tab
1. Click "Record" button
2. Reload page
3. Stop recording
4. Check metrics:
   - LCP should be under 2.5s
   - CLS should be minimal (< 0.1)
   - No long tasks blocking main thread

## Lighthouse Audit

### Run Mobile Audit
1. Open DevTools → Lighthouse tab
2. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
3. Device: **Mobile**
4. Click "Analyze page load"

### Target Scores
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Common Issues & Fixes

#### Issue: "Eliminate render-blocking resources"
✅ **Fixed**: Preconnect hints added for external resources

#### Issue: "Does not use passive listeners"
✅ **Fixed**: All scroll listeners use `{ passive: true }`

#### Issue: "Images not lazy loaded"
✅ **Fixed**: All images use lazy loading by default (except hero)

#### Issue: "Tap targets too small"
✅ **Fixed**: Minimum 44px touch targets on mobile

## Manual Testing Checklist

### Visual & Layout
- [ ] No horizontal scrolling
- [ ] Text is readable without zooming
- [ ] Images display correctly at all screen sizes
- [ ] Safe areas respected (notch, rounded corners)
- [ ] Footer doesn't overlap floating nav

### Interactions
- [ ] All buttons respond to touch immediately
- [ ] No accidental double-taps
- [ ] Sheet/drawer animations are smooth
- [ ] Form inputs don't cause zoom
- [ ] Active states provide visual feedback

### Forms
- [ ] Email input shows email keyboard
- [ ] Phone input shows numeric keyboard
- [ ] All fields are easily tappable
- [ ] Error states are clear
- [ ] Submit button is always visible

### Navigation
- [ ] Mobile menu opens smoothly
- [ ] Navigation links work correctly
- [ ] Floating action buttons appear after scroll
- [ ] Back to top button scrolls smoothly

### Performance
- [ ] Page loads in under 3 seconds (3G)
- [ ] No janky scrolling
- [ ] Images load progressively
- [ ] Animations respect reduced motion
- [ ] No layout shifts during load

## Testing Slow Connections

### Simulate 3G
```javascript
// In DevTools Console:
// Check connection type
navigator.connection?.effectiveType
```

### Expected Behavior on Slow 3G:
- Animations reduced automatically
- Images load progressively
- Hero loads first (high priority)
- Gallery images lazy load
- No blocking resources

## Accessibility Testing

### Screen Reader
- [ ] All images have alt text
- [ ] Buttons have descriptive labels
- [ ] Form fields have labels
- [ ] Navigation is logical

### Keyboard Navigation
- [ ] Tab order makes sense
- [ ] Focus indicators visible
- [ ] All actions keyboard accessible
- [ ] Skip links work

### Motion Preferences
Test with reduced motion:
```css
/* In DevTools, emulate: */
@media (prefers-reduced-motion: reduce)
```

Expected:
- Animations should be minimal
- Transitions should be instant
- Scroll should still work smoothly

## Performance Monitoring

### Check Metrics Periodically
```javascript
// In console:
const vitals = JSON.parse(localStorage.getItem('web-vitals'));
console.table(vitals);
```

### Performance Budget
- **JavaScript**: < 100KB gzipped
- **Images**: Optimized, lazy loaded
- **Fonts**: System fonts (no external fonts)
- **Total page size**: < 500KB on initial load

## Common Mobile Issues & Solutions

### Issue: Page jumps when keyboard opens
**Solution**: ✅ Fixed with safe area insets and viewport height handling

### Issue: Tap delay on buttons
**Solution**: ✅ Fixed with `touch-manipulation` CSS

### Issue: Images cause layout shift
**Solution**: ✅ Add explicit width/height or aspect-ratio

### Issue: Slow scroll performance
**Solution**: ✅ Passive listeners + debouncing

### Issue: Form inputs zoom on iOS
**Solution**: ✅ Ensured 16px minimum font size

## Browser Support

### Tested & Optimized For:
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+
- ✅ Samsung Internet 15+
- ✅ Firefox Android 90+

### Feature Detection
All optimizations use progressive enhancement:
- Intersection Observer (lazy loading)
- Network Information API (connection detection)
- Prefers-reduced-motion (accessibility)

## Debugging Tips

### Enable Performance Logging
Add to App.tsx:
```typescript
useWebVitals(true); // Enable console logging
```

### Check Optimization Status
Add to URL:
```
?mobile-status=true
```

### View All Performance Metrics
```javascript
// Console command:
performance.getEntriesByType('navigation')
performance.getEntriesByType('resource')
```

### Check Image Loading
```javascript
// See which images are lazy loaded:
document.querySelectorAll('img[loading="lazy"]').length
```

## Next Steps

1. **Deploy and Test**: Test on real devices after deployment
2. **Monitor**: Check Web Vitals weekly
3. **Iterate**: Based on real user metrics
4. **A/B Test**: Try different optimization strategies

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Mobile Performance](https://web.dev/mobile/)
- [Lighthouse Docs](https://developers.google.com/web/tools/lighthouse)
- [iOS Web App Guide](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
