# Testing Translations on Localhost

## Quick Test Steps

### Method 1: Browser Console (Easiest)

1. Open your browser's Developer Console (F12)
2. Run this command:
```javascript
localStorage.setItem('test_country', 'RS')
```
3. Refresh the page (F5)
4. Check the Network tab - you should see `X-Test-Country: RS` header in API requests
5. Check API response - should return Serbian translations

### Method 2: URL Parameter

Add `?test_country=RS` to your URL:
```
http://localhost:3000/dashboard/farmer?test_country=RS
```

### Method 3: Check if it's working

Open browser console and check:
1. Network tab → Find `/api/translations` request
2. Check Request Headers → Should see `X-Test-Country: RS`
3. Check Response → Should see `"locale": "sr"` and Serbian translations

## Debugging

If it's not working:

1. **Check localStorage:**
```javascript
console.log(localStorage.getItem('test_country'))
// Should output: "RS"
```

2. **Check if header is being sent:**
- Open Network tab
- Find any API request
- Check Request Headers
- Look for `X-Test-Country: RS`

3. **Check backend logs:**
```bash
cd cattle-backend
vendor/bin/sail artisan tail
# Look for "Test country detected: RS"
```

4. **Test API directly:**
```bash
curl -H "X-Test-Country: RS" http://localhost:8000/api/translations
```

## Available Test Countries

- `RS` - Serbia → Serbian (`sr`)
- `US` - USA → English US (`en_US`)
- `GB` - UK → English UK (`en_GB`)
- `ES` - Spain → Spanish (`es`)
- `FR` - France → French (`fr`)
- `DE` - Germany → German (`de`)

## Clear Test Country

```javascript
localStorage.removeItem('test_country')
location.reload()
```
