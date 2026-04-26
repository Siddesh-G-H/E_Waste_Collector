Design a professional, responsive Waste Picker Web App called "WasteLink Picker" 
for desktop (1440px wide) and mobile (390px wide) breakpoints. This is a 
field-worker tool for informal e-waste collectors in India. Design must be 
functional-first, high-contrast, and accessible for outdoor use in bright sunlight.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND & VISUAL SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Colors:
  Primary:     #00695C  (Deep Teal)
  Primary Dark:#004D40  (Active / pressed states)
  Accent:      #FF8F00  (Amber — CTAs, alerts, earnings)
  Success:     #2E7D32  (Completed status)
  Warning:     #F57F17  (On the way / in-progress)
  Danger:      #C62828  (Urgent / overdue)
  Background:  #F4F6F5  (App background)
  Surface:     #FFFFFF  (Cards)
  Text Primary:#1C2B2A  (Dark headings)
  Text Muted:  #607D8B  (Labels, secondary info)
  Border:      #E0E7E6  (Card borders, dividers)

Typography:
  Font: "Noto Sans" (covers English + हिंदी + ಕನ್ನಡ)
  Heading 1: 28px Bold
  Heading 2: 20px SemiBold
  Body:      15px Regular
  Label:     12px Medium, uppercase, letter-spacing 0.8px
  Button:    15px Bold

Radius: 14px cards, 10px inputs, 999px pills/badges, 8px buttons
Shadow: 0 2px 12px rgba(0,0,0,0.08) for cards; 0 4px 20px rgba(0,0,0,0.14) for modals
Icons: Use Lucide icon set throughout (consistent weight: 1.8px stroke)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAVIGATION SYSTEM (ADAPTIVE — DESIGN BOTH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESKTOP NAV — Left Sidebar (collapsed to icons only at 1024px):
  Width: 240px (expanded) / 72px (collapsed)
  Top: WasteLink logo + "Picker" badge in teal pill
  Nav Items (icon + label):
    [Map Pin]       Live Requests     ← active state: teal left border + teal text
    [Package]       Active Job
    [Navigation 2]  My Route
    [Clock]         History
    [Wallet]        Earnings
  Bottom of sidebar:
    [User Circle]   Ravi K.  (avatar + name)
    [Power]         Logout (muted red)
  Sidebar background: #FFFFFF with right border #E0E7E6

MOBILE NAV — Bottom Tab Bar (fixed, always visible):
  Height: 64px, white background, top border #E0E7E6
  5 tabs: Requests | Job | Route | History | Earnings
  Active tab: teal icon + teal label + teal underline dot
  Inactive tab: #90A4AE icon + muted label
  Floating action badge on "Requests" tab if new jobs arrive (amber circle, white count)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 1 — LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESKTOP (1440px):
  Left half (50%): Full-height teal gradient (#004D40 → #00897B)
    - WasteLink logo centered (white leaf + circuit icon, 64px)
    - Tagline: "Your route. Your earnings. Your future." (white, 22px, centered)
    - 3 stat pills below: "4.2M Pickups" · "₹12Cr Earned" · "38 Cities" (white/translucent)
    - Bottom: decorative abstract map pattern (low-opacity white lines)
  Right half (50%): White background, vertically centered card (480px wide)
    - "Welcome Back 👋" heading (28px bold, dark)
    - Subtext: "Login to access your pickup queue" (muted, 15px)
    - Spacer 32px
    - Input: Phone Number (prefix flag dropdown +91, large 52px height)
    - Input: Picker ID (with badge/ID icon)
    - Language selector: pill row — "EN | हिंदी | ಕನ್ನಡ" (toggle pills, default EN)
    - "Send OTP" button (full-width, 52px, teal, bold)
    - OTP input row (4 separate boxes, 52x56px each) — shown after OTP sent
    - "Verify & Login" button (amber, full-width, 52px)
    - Bottom note: "No account needed. Contact your supervisor for your Picker ID." (muted, 12px)

MOBILE (390px):
  Full screen teal header (top 35%): logo + tagline centered
  White bottom sheet (65%, rounded top corners 28px):
    Same form fields as desktop but stacked full-width
    Language selector at very bottom above keyboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 2 — LIVE REQUESTS (MAIN SCREEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESKTOP (1440px) — 3-column layout:
  Left sidebar (240px): navigation (as described above)
  Center column (680px): job list feed
    - Top bar: "Live Requests" heading + "12 nearby" amber badge
    - Filter chips row: [All] [< 2km] [< 5km] [Mobile] [Laptop] [Appliance]
    - Sort row: "Sort by: Distance ▾" dropdown (right aligned)
    - JOB CARD (repeat 4-5 cards, each 100% width, white, shadow):
        Top row: Item icon (colored circle) + Item name (bold) + Distance pill (teal, right)
        Mid row: [Map Pin icon] "Kothnur, Bengaluru South" (muted)
        Price row: [Tag icon] "Est. ₹ 420–560" (green, bold 18px) 
        Time row: [Clock icon] "Requested 8 min ago" (muted, 12px)
        Bottom row: Two buttons side by side —
          "Accept Pickup" (teal, bold, left 60%) 
          "Details" (outline teal, right 38%)
        Left edge: vertical colored strip (amber = urgent <30min, teal = normal)
        URGENT variant: amber left border + "⚡ Urgent" amber pill top-right
  Right column (440px): Live map placeholder
    - Google Maps embedded view (full height of right column)
    - Floating card overlay: "You are ONLINE" green pulsing dot + toggle switch
    - Pins on map numbered 1-5 matching job cards

MOBILE (390px):
  Top bar: "Live Requests" (bold) + online toggle switch (right) + filter icon
  Amber notification banner (if new job): "New pickup in your area! 📍" (dismissible)
  Filter chips: horizontal scrollable row
  Job cards (full-width, stacked, same content as desktop but single column)
  Map button (floating, bottom-right, above nav bar): circular teal button [Map icon] "Map View"
  Map View (alternative state): full-screen map with bottom drawer showing job cards

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 3 — ACCEPTED JOB (DETAIL VIEW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESKTOP (1440px):
  Left sidebar: navigation (Active Job tab highlighted)
  Main area split (60/40):
    LEFT (detail panel, 60%):
      - Breadcrumb: "Live Requests > Job #WL-2041"
      - Status pill row (progress bar style):
          [✓ Accepted] → [On the Way] → [Reached] → [Completed]
          Currently: "Accepted" filled teal, rest ghost
      - Section: CUSTOMER INFO (card)
          Avatar placeholder + "Meena S." (bold 18px)
          [Phone icon] "+91 98765 43210" + "Call" button (green outline)
          [Map Pin] "14/B, 3rd Cross, Kothnur Main Rd, Bengaluru 560078"
          [Copy icon] small, right of address
      - Section: ITEM DETAILS (card)
          Item: "Laptop — Dell Inspiron 15" (bold)
          Condition: "Working" (green pill) 
          Quantity: 1
          Est. Weight: ~2.1 kg
          Est. Price: ₹ 480 (large green, 22px)
          Final Price field: editable input "Enter final ₹" (amber border when active)
          "Update Final Price" button (amber, right-aligned)
      - Section: UPLOADED IMAGES (card) — VERY IMPORTANT
          Label: "Customer's Device Photos"
          Image grid: 2x2 photo thumbnails (each 140x140px, rounded 10px, object-fit: cover)
          Below each image: small label "Front", "Back", "Serial No.", "Damage"
          Click to expand → lightbox overlay (dark bg, full-size image, arrows to navigate)
          If no images: placeholder with [Image] icon + "No photos uploaded"
    RIGHT (map + actions, 40%):
      - Google Maps placeholder (full right panel height ~55%)
        Route line from current location to pickup address
        Two pins: "You" (teal) + "Customer" (amber)
      - Action buttons (below map, stacked):
          "▶  Start Navigation" (teal, full-width, 52px) — opens Google Maps
          "📞  Call Customer" (green outline, full-width, 52px)
          "❌  Cancel Job" (light red ghost, 44px, muted)
      - ETA card: "~18 min · 4.2 km away" (grey card, center)

MOBILE (390px):
  Top: back arrow + "Job #WL-2041" + status pill (right)
  Map (40% screen height, full-width)
  Scrollable bottom panel:
    Status progress pills (horizontal scroll if needed)
    Customer info card
    Item details card
    IMAGE GRID: horizontal scrollable strip (150px tall thumbnails) 
    Final price input
  Fixed bottom: "Navigate" (teal 60%) + "Call" (green 38%) side-by-side buttons

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 4 — STATUS FLOW (VERY IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design this as a prominent sticky component at the TOP of the Active Job screen.

STATUS STEPPER COMPONENT (design all 4 states):

  STATE 1 — ACCEPTED (current):
    [● Accepted]  ——  [ On the Way ]  ——  [ Reached ]  ——  [ Completed ]
    Active step: filled teal circle + teal label (bold)
    Future steps: grey circle + grey label
    CTA button below stepper: "I'm On the Way →" (amber, large, full-width, 56px)
    Firebase action label (small, muted): "Updates order status to: on_the_way"

  STATE 2 — ON THE WAY (current):
    [✓ Accepted]  ——  [● On the Way]  ——  [ Reached ]  ——  [ Completed ]
    Teal connecting line from step 1 to 2
    CTA button: "I've Reached the Location 📍" (amber, full-width, 56px)
    Live location banner (amber, top of screen):
      [Pulsing dot] "Sharing your location with customer..." [Stop button]

  STATE 3 — REACHED (current):
    [✓ Accepted]  ——  [✓ On the Way]  ——  [● Reached]  ——  [ Completed ]
    CTA button: "Mark as Completed ✓" (green, full-width, 56px)
    Final price input appears here:
      Label: "Enter Final Price After Inspection"
      Large input: "₹ [____]" (center aligned, 28px, amber border)
      Helper: "Original estimate was ₹ 480"

  STATE 4 — COMPLETED:
    [✓ Accepted]  ——  [✓ On the Way]  ——  [✓ Reached]  ——  [✓ Completed]
    Full teal connecting line across all steps
    Green success banner: "✓ Job Completed! ₹ 520 added to your earnings"
    Confetti animation area (subtle, above banner)
    "View Earnings" (teal outline) + "Back to Requests" (teal filled) buttons

  FIREBASE SYNC INDICATOR (small, all states):
    Bottom-right of stepper: [Cloud icon] "Synced" (green) or [Spin icon] "Syncing..." (amber)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 5 — LIVE LOCATION TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is a persistent background feature — show it as a status component, not a full screen.

LOCATION SHARING BANNER (shown when status = on_the_way or reached):
  Full-width amber banner (48px height, sticky below top nav):
    Left: [Pulsing green dot] "Live location ON — Customer can see you"
    Right: "Stop Sharing" (white text, underlined)

LOCATION CARD (on desktop right panel / mobile bottom sheet):
  Title: "Your Live Location"
  Coordinates display: "12.8915° N, 77.5937° E" (monospace, muted)
  Update frequency: "Updating every 5 seconds" (muted, 12px)
  Map mini-preview: 100% width, 180px height, your position with pulsing teal dot
  Firebase path label (for dev reference, very small grey): 
    "orders/{jobId}/collectorLocation → {lat, lng}"

OFFLINE STATE variant:
  Banner turns grey: [Grey dot] "Location sharing paused — no internet"
  Retry button (right)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 6 — FINAL PRICE UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design as a modal overlay (desktop) and bottom sheet (mobile).

MODAL / BOTTOM SHEET:
  Handle bar (mobile only, grey pill, centered top)
  Title: "Final Price After Inspection" (bold, 20px)
  Subtext: "Original estimate shown to customer: ₹ 480" (muted)
  
  Price input (very prominent):
    "₹" prefix (teal, 28px)
    Large number input (36px, center, amber bottom border active state)
    Keypad shows automatically (number pad)
  
  Reason dropdown (optional): 
    "Reason for adjustment" → [Better condition / Worse condition / Different item / Parts only]
  
  Preview card:
    "Customer will see:"  
    Old price (strikethrough grey): ₹ 480  
    New price (green bold 22px): ₹ 520  
    Change indicator: "+ ₹ 40 ↑" (green) or "- ₹ 60 ↓" (red)
  
  "Confirm & Update" button (amber, full-width, 52px)
  "Cancel" ghost button below
  
  Success state: green checkmark + "Price updated in Firebase ✓"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 7 — HISTORY + EARNINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESKTOP (1440px):
  Left sidebar: navigation (History tab active)
  Main content (full remaining width):
    TOP EARNINGS SUMMARY BANNER (teal gradient card, full width, 140px):
      Left: "This Month" label + "₹ 4,280" (white, 36px bold) + "38 pickups"
      Center divider
      Right: "This Week" label + "₹ 960" (white, 28px bold) + "9 pickups"
      Far right: small bar chart sparkline (white bars)
    
    FILTER ROW:
      Date range picker (Today / This Week / This Month / Custom)
      Status filter chips: All | Completed | Cancelled
    
    HISTORY TABLE (desktop only):
      Columns: Job ID | Date | Item | Area | Est. Price | Final Price | Status | Action
      Row alternating: white / #F9FAFB
      Status column: colored pills (Completed=green, Cancelled=red)
      Action column: "View Details" teal link
      Pagination: bottom, 10 rows per page
    
    HISTORY CARDS (mobile only, stacked):
      Each card: Job ID (small muted) + Item + Area + Final Price (bold green right) + Status pill

MOBILE (390px):
  Top earnings card (teal, full-width, 120px):
    "₹ 4,280 earned this month" (white, 24px bold, centered)
    "38 pickups · Avg ₹ 113 / pickup" (muted white, 13px)
  Filter chips (horizontal scroll)
  History cards (stacked, same as above)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE LABELS (add these as annotation overlays on each screen)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add small grey annotation sticky-note style labels on the right side of each screen
(for developer handoff clarity). Use this exact text:

  Login screen:       "Auth: Firebase Phone Auth → creates collectors/{uid}"
  Live Requests:      "Reads: orders collection, status == 'pending', within 10km"
  Accept button:      "Writes: orders/{id}/status='accepted', collector=uid"
  Job Detail:         "Reads: orders/{id} — address, phone, items, images[]"
  Status buttons:     "Writes: orders/{id}/status = [on_the_way | reached | completed]"
  Location banner:    "Writes: orders/{id}/collectorLocation = {lat, lng} every 5s"
  Final price input:  "Writes: orders/{id}/finalPrice = number"
  History screen:     "Reads: orders, collector==uid, status=='completed'"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT LIBRARY (design these as reusable components)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. JOB CARD (default, urgent, accepted variants)
2. STATUS STEPPER (4 state variants)
3. ACTION BUTTON (primary teal, amber accent, outline, ghost, danger)
4. INPUT FIELD (default, active, error, disabled)
5. STATUS BADGE / PILL (pending, accepted, on_the_way, reached, completed)
6. IMAGE THUMBNAIL (with lightbox trigger state)
7. LOCATION BANNER (active, paused, offline variants)
8. PRICE DISPLAY (estimate vs final, increase vs decrease variant)
9. EARNINGS CARD (daily, weekly, monthly variants)
10. FIREBASE SYNC INDICATOR (synced, syncing, offline)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIGMA FILE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organize into Figma pages:
  Page 1: 🎨 Design System (colors, typography, components)
  Page 2: 💻 Desktop Screens (1440px frames)
  Page 3: 📱 Mobile Screens (390px frames)
  Page 4: 🔄 Status Flow States (all 4 status variants)
  Page 5: 📋 Developer Handoff (annotated screens with Firebase labels)

Use Auto Layout on all components.
Use Figma Variables for color tokens.
All interactive elements must have Hover + Pressed states.
Desktop and Mobile screens must share the same component instances.