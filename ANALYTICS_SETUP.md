# Google Analytics Lead Tracking Setup

## ✅ What's Already Implemented

The code has been updated to automatically track quote submissions as **leads** in Google Analytics. Here's what's tracking:

### 📊 Events Being Tracked:

1. **Quote Started** (`begin_checkout`)
   - Fires when user first loads the quote page
   - Tracked once per session

2. **Item Added to Quote** (`add_to_cart`)  
   - Fires when user adds media formats to their quote
   - Includes format name, quantity, and value

3. **Lead Generated** (`generate_lead`) 🎯
   - **MAIN CONVERSION**: Fires when quote is submitted
   - Includes total quote value, item count, contact info
   - This is what will show up in your GA4 "Generate leads overview"

## 🔧 Required Setup Steps

### 1. Add Google Analytics to Your CMS

Go to your CMS → Analytics Manager and add your Google Analytics tracking code:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Replace `GA_MEASUREMENT_ID` with your actual Google Analytics 4 measurement ID (format: G-XXXXXXXXXX)**

### 2. Set Up Conversion Goals in Google Analytics

1. Go to Google Analytics 4 → **Admin** → **Conversions**
2. Click **Create conversion event**
3. Add these events as conversions:
   - `generate_lead` (main conversion)
   - `begin_checkout` (optional)

### 3. Optional: Google Ads Conversion Tracking

If you want to track conversions for Google Ads, update the conversion tracking in `/src/utils/analytics.ts`:

```typescript
// Replace this line:
send_to: 'GA_MEASUREMENT_ID/quote_submission'

// With your Google Ads conversion:
send_to: 'AW-123456789/ABCD_efgh_ijkl'
```

## 📈 Expected Results

After setup, you'll see in Google Analytics:

- **Realtime Overview**: Live quote activity
- **Generate leads overview**: Quote submissions as qualified leads
- **Conversion tracking**: Revenue attribution from quotes
- **User journey**: Path from landing page → quote → submission

## 🎯 Lead Quality

Each lead includes:
- Quote total value (in GBP)
- Number of items in quote
- Contact email & company
- Unique quote ID for tracking

## 🔍 Testing

To test the setup:

1. Submit a test quote on your website
2. Check Google Analytics → **Realtime** → **Events**
3. Look for `generate_lead` events
4. Verify the lead shows up in "Generate leads overview"

---

**Note**: It may take 24-48 hours for conversion data to fully populate in Google Analytics after initial setup.