/* ══════════════════════════════════════════════════════════════════════════════
   DATA.js  —  Debt Payoff Dashboard · Steve Gordon
   ══════════════════════════════════════════════════════════════════════════════

   ⚠  THIS FILE IS NOT COMMITTED TO GIT  (see .gitignore)
   It contains real balances and your Sequence API key. Keep it local.
   Use DATA.example.js as a reference if you ever need to rebuild.

   ── HOW TO UPDATE ─────────────────────────────────────────────────────────────

   After each paycheck (every ~2 weeks):
     1. Open Sequence — screenshot the Money Map or download the activity CSV.
     2. Update DEBTS balances (check each lender's app for the exact number).
     3. Update FLOW_DATA pod balances (match what Sequence shows in each bucket).
     4. Update the lastUpdated date at the top.

   When your Sequence rules change (new pod, killed pod, new allocation %):
     5. Add/remove/rename the relevant node in FLOW_DATA.

   When the avalanche cascade hits a milestone (debt paid off):
     6. Keep the paid-off debt in DEBTS with balance: 0 — the simulation handles it.
     7. Update DEBTS payment fields to reflect the new cascade amounts.

   ── WHAT CHANGES MOST OFTEN ───────────────────────────────────────────────────
   • DEBTS[*].balance          — drops a little every month
   • DEBTS[*].payment          — jumps up each time a debt is cleared (cascade)
   • Pod balances in FLOW_DATA — updates every paycheck
   • Emergency Fund balance    — grows each paycheck
   • Bachelor Party balance    — grows until Aug 2026, then hits 0

   ── WHAT RARELY CHANGES ───────────────────────────────────────────────────────
   • APRs, colors, priorities, labels, debt order
   • Sequence rule allocations (amount/paycheck per pod)
   • START_DATE

   ══════════════════════════════════════════════════════════════════════════════
   LAST UPDATED: April 12, 2026
   ══════════════════════════════════════════════════════════════════════════════ */


/* ── API ──────────────────────────────────────────────────────────────────────
   Sequence.io API key — used for optional live data fetch (currently stubbed).
   Rotate this key in your Sequence dashboard if it's ever compromised.       */
const SEQUENCE_API_KEY  = ''; // API not used — Sequence blocks browser CORS requests
const SEQUENCE_API_BASE = 'https://api.sequence.money/v1';


/* ── LOCK SCREEN PIN ─────────────────────────────────────────────────────────
   Change this to update your dashboard PIN. Face ID is set up separately
   via WebAuthn on the live site (sgordon1024.github.io/debt-payoff/).        */
const CORRECT_PIN = '5555';


/* ── SIMULATION START DATE ───────────────────────────────────────────────────
   The date the avalanche plan officially kicked off. Don't change this.      */
const START_DATE = new Date(2026, 3, 11); // April 11, 2026 (month is 0-indexed)


/* ══════════════════════════════════════════════════════════════════════════════
   DEBTS
   Update balance after every statement. Update payment when cascade changes.
   ══════════════════════════════════════════════════════════════════════════════ */
const DEBTS = [

  /* ── Consumer debts — avalanche order (highest APR first) ── */

  {
    id: 'upstart', name: 'Upstart Personal Loan', short: 'Upstart',
    balance:  9737.51,   // ← UPDATE: check Upstart app
    apr:        31.75,
    payment:    2393,    // ← UPDATE when cascade hits (freed minimums pile here)
    minimum:     424.66,
    color: '#ef4444', priority: 1, type: 'loan',
    note: 'All freed minimums routed here — cascades to Amex when paid off',
  },
  {
    id: 'amex', name: 'American Express', short: 'Amex',
    balance: 10014.04,   // ← UPDATE: check Amex app
    apr:        29.99,
    payment:      396,
    minimum:      394.81,
    color: '#3b82f6', priority: 2, type: 'credit',
    note: 'Minimum only until Upstart is paid off',
  },
  {
    id: 'bestbuy', name: 'Best Buy (Citibank)', short: 'Best Buy',
    balance:  5026.07,   // ← UPDATE: check Citibank app
    apr:        29.10,
    payment:       70,
    minimum:       69,
    color: '#f97316', priority: 3, type: 'credit',
    note: 'Minimum only — stop new purchases',
  },
  {
    id: 'wellsfargo', name: 'Wells Fargo (Mattress)', short: 'Wells Fargo',
    balance:  1031.90,   // ← UPDATE: check Wells Fargo app
    apr:        28.99,
    payment:      150,
    minimum:       41.37,
    color: '#fbbf24', priority: 4, type: 'credit',
    danger: true, deferredDeadline: 'Jan 24, 2027',
    note: 'Paying above minimum to clear deferred interest before deadline',
  },
  {
    id: 'chase', name: 'Chase (Whole Foods Prime)', short: 'Chase',
    balance:  1998.39,   // ← UPDATE: check Chase app
    apr:        27.49,
    payment:       36,
    minimum:       35,
    color: '#22d3ee', priority: 5, type: 'credit',
    note: 'Minimum only',
  },
  {
    id: 'apple', name: 'Apple Card', short: 'Apple',
    balance:  1423.84,   // ← UPDATE: check Wallet app
    apr:        25.49,
    payment:       46,
    minimum:       46,
    color: '#a855f7', priority: 6, type: 'credit',
  },
  {
    id: 'upgrade', name: 'Upgrade Credit Card', short: 'Upgrade',
    balance:  3098.96,   // ← UPDATE: check Upgrade app
    apr:        20.99,
    payment:      208,
    minimum:      206.88,
    color: '#ec4899', priority: 7, type: 'credit',
  },
  {
    id: 'roadrunner', name: 'Roadrunner (Dirt Bike)', short: 'Moto',
    balance:  2428.91,   // ← UPDATE: check Roadrunner
    apr:        14.74,
    payment:      118,
    minimum:      117.30,
    color: '#14b8a6', priority: 8, type: 'loan',
  },
  {
    id: 'fidelity', name: 'Fidelity Visa (0% Promo)', short: 'Fidelity',
    balance:  2760.00,   // ← UPDATE: check Fidelity app
    apr:          0,
    payment:      170,
    minimum:      170,
    color: '#6366f1', priority: 9, type: 'credit',
    promoEnd: 'Sep 2027',
    note: 'True 0% until Sep 2027 — pay minimums only',
  },

  /* ── Long-term loans — minimums only, cascade hits here last ── */

  {
    id: 'van', name: 'Van (U.S. Bank)', short: 'Van',
    balance: 185793.08,  // ← UPDATE: check U.S. Bank app
    apr:          8.74,
    payment:      1700,
    minimum:      1690.71,
    color: '#78716c', priority: 10, type: 'loan', longTerm: true,
    note: 'REC loan, matures Jan 2045. $850 biweekly autopay (~$1,700/mo). Cascade hits here after Fidelity.',
  },
  {
    id: 'aidvantage', name: 'Aidvantage (Federal)', short: 'Federal',
    balance: 89000.00,   // ← UPDATE: check Aidvantage portal
    apr:          6.625,
    payment:       491,
    minimum:       491,
    color: '#64748b', priority: 11, type: 'loan', longTerm: true,
    note: 'Federal student loan — cascade hits after Van is paid off.',
  },
  {
    id: 'earnest', name: 'Earnest (Private Student)', short: 'Earnest',
    balance: 13060.97,   // ← UPDATE: check Earnest app
    apr:          5.65,
    payment:       194.18,
    minimum:       194.18,
    color: '#0ea5e9', priority: 12, type: 'loan', longTerm: true,
    note: 'Private student loan — final debt in the cascade.',
  },
];


/* ══════════════════════════════════════════════════════════════════════════════
   PAYCHECK FLOW DATA
   Mirrors your Sequence money map. Update balances after each paycheck.

   Fields to update regularly:
     balance       — current cash sitting in that Sequence pod/bucket
     goalPerPaycheck — if Sequence rule amount changes

   Fields that rarely change:
     amount        — per-paycheck Sequence rule allocation
     apr, payoffRef, dueDay — debt metadata for sorting
     color, emoji, type, label, note — visual/structural
   ══════════════════════════════════════════════════════════════════════════════ */
const FLOW_DATA = {
  id: 'paycheck', label: 'Paycheck', emoji: '💰',
  sublabel: 'Biweekly direct deposit — every dollar is allocated automatically via Sequence',
  color: '#22c55e', type: 'income',
  children: [

    /* ── NEEDS POD (90% of paycheck) ── */
    {
      id: 'needs', label: 'Needs Pod', emoji: '🔧',
      sublabel: 'Full paycheck flows into Needs first, then distributes to every bucket below',
      color: '#6366f1', type: 'pod',
      payoffRef: ['upstart','amex','bestbuy','wellsfargo','chase','apple','upgrade','roadrunner','fidelity'],
      children: [

        /* Student Loans — $350/paycheck */
        {
          id: 'student-loans-pod', label: 'Student Loans', emoji: '🍎',
          amount: 350, balance: 0,           // ← balance: rarely has leftover
          color: '#8b5cf6', type: 'pod',
          apr: 6.1,
          payoffRef: ['aidvantage','earnest'],
          sublabel: '$350/paycheck split between Aidvantage and Earnest',
          children: [
            { id: 'aidvantage', label: 'Aidvantage', emoji: '🎓', amount: 250, color: '#a78bfa', type: 'account', apr: 6.625, payoffRef: ['aidvantage'], note: 'Monthly minimum payment' },
            { id: 'earnest',    label: 'Earnest',     emoji: '🎓', amount: 100, color: '#a78bfa', type: 'account', apr: 5.65,  payoffRef: ['earnest'],    note: 'Monthly minimum · $194.18/mo · 5.65% APR' },
          ],
        },

        /* Loans — $940/paycheck */
        {
          id: 'loans-pod', label: 'Loans', emoji: '🏦',
          amount: 940, balance: 100,          // ← UPDATE: Sequence loans pod balance
          color: '#ef4444', type: 'pod',
          apr: 31.75,
          payoffRef: ['upstart','wellsfargo','fidelity'],
          sublabel: '$940/paycheck — paid in strict priority order',
          children: [
            { id: 'wf-loan',         label: 'Wells Fargo',         emoji: '⚠️', amount: 75,   color: '#f87171', type: 'account', apr: 28.99, payoffRef: ['wellsfargo'], note: 'Paid FIRST — deferred interest ends Jan 24, 2027' },
            { id: 'fidelity-loan',   label: 'Fidelity',            emoji: '🏦', amount: null, amountLabel: 'Fixed',          color: '#f87171', type: 'account', apr: 0,     payoffRef: ['fidelity'], note: '0% promo rate — paid before Upstart' },
            { id: 'upstart-fixed',   label: 'Upstart (fixed)',     emoji: '🎯', amount: null, amountLabel: 'Fixed',          color: '#ef4444', type: 'account', apr: 31.75, payoffRef: ['upstart'],   note: 'Fixed monthly allocation' },
            { id: 'upstart-loans-r', label: 'Upstart (remainder)', emoji: '🔥', amount: null, amountLabel: '100% remainder', color: '#dc2626', type: 'account', apr: 31.75, payoffRef: ['upstart'],   note: 'Every leftover dollar → avalanche target' },
          ],
        },

        /* Credit Cards — $1,000/paycheck */
        {
          id: 'cc-pod', label: 'Credit Cards', emoji: '💳',
          amount: 1000, balance: 0,           // ← UPDATE: Sequence CC pod balance
          color: '#3b82f6', type: 'pod',
          apr: 29.99,
          payoffRef: ['amex','bestbuy','chase','apple','upgrade'],
          sublabel: '$1,000/paycheck — minimums first, overflow held in pod',
          children: [
            { id: 'amex-card',    label: 'Amex',       emoji: '💳', amount: 396,  color: '#60a5fa', type: 'account', apr: 29.99, payoffRef: ['amex'],    note: 'Minimum ~$395 · balance $10,014 · 29.99% APR' },
            { id: 'bestbuy-card', label: 'Best Buy',   emoji: '💳', amount: 70,   color: '#60a5fa', type: 'account', apr: 29.10, payoffRef: ['bestbuy'], note: 'Minimum ~$70 · balance $5,026 · 29.10% APR' },
            { id: 'cc-buffer',    label: 'Pod buffer', emoji: '💰', amount: null, amountLabel: 'Remainder', color: '#3b82f6', type: 'account', note: 'Held in pod — cascades to Upstart after Amex is paid off' },
          ],
        },

        /* ── Bills & Recurring (update balance after each paycheck) ── */
        { id: 'bills',        label: 'Bills',                  emoji: '🧾', amount: 235,   balance: 124.00, color: '#f59e0b', type: 'leaf', dueDay: 15, note: 'Fixed recurring bills' },
        { id: 'van-maint',    label: 'Van Maintenance',        emoji: '🚐', amount: 60,    balance: 300.00, color: '#10b981', type: 'leaf', note: 'Van repairs & upkeep fund' },
        { id: 'groceries',    label: 'Groceries / Food / Bar', emoji: '🍔', amount: 200,   balance: 273.05, color: '#10b981', type: 'leaf', note: 'Food & dining' },
        { id: 'diesel',       label: 'Diesel / Van Misc',      emoji: '⛽', amount: 150,   balance: 338.92, color: '#10b981', type: 'leaf', note: 'Fuel & van miscellaneous' },
        { id: 'progressive',  label: 'Progressive',            emoji: '🛡️', amount: 75,    balance: 11.52,  color: '#10b981', type: 'leaf', dueDay: 20, note: 'Auto insurance' },
        { id: 'tmobile',      label: 'T-Mobile',               emoji: '📱', amount: 100,   balance: 0.15,   color: '#10b981', type: 'leaf', dueDay: 10, note: 'Phone plan' },
        { id: 'pub-storage',  label: 'Public Storage',         emoji: '📦', amount: 150,   balance: 10.00,  color: '#10b981', type: 'leaf', dueDay: 1,  note: 'Storage unit' },
        { id: 'starlink',     label: 'Starlink',               emoji: '🛰️', amount: 2.50,  balance: 1.04,   color: '#64748b', type: 'leaf', dueDay: 14, note: '⏸ Paused — $2.50 placeholder · $85 when active' },
        { id: 'subscriptions',label: 'Subscriptions',          emoji: '📺', amount: 125,   balance: 57.49,  color: '#8b5cf6', type: 'leaf', dueDay: 3,  note: 'Netflix, HBO, Spotify, Claude.ai & more · earliest charge 3rd' },
        { id: 'tt-dues',      label: 'Thousand Trails',        emoji: '🏕️', amount: 55,    balance: 17.46,  color: '#10b981', type: 'leaf', dueDay: 23, note: 'Campground membership dues' },
        { id: 'upstart-needs',label: 'Upstart (100% remainder)', emoji: '🔥', amount: null, amountLabel: "100% of what's left", balance: 0, color: '#ef4444', type: 'account', apr: 31.75, payoffRef: ['upstart'], note: '🎯 Avalanche engine — every unallocated dollar destroys this loan' },
      ],
    },

    /* ── WANTS POD (50% of 10% remainder) ── */
    {
      id: 'wants', label: 'Wants Pod', emoji: '🎁',
      sublabel: 'Discretionary spending, savings goals, and van upgrade funds',
      color: '#a855f7', type: 'pod',
      children: [
        {
          id: 'checking', label: 'Checking', emoji: '🏦',
          balance: 27.52,                    // ← UPDATE: Sequence checking balance
          color: '#6366f1', type: 'pod',
          sublabel: 'Main spending account — distributes to lifestyle and van upgrade buckets',
          children: [
            { id: 'vacations',  label: 'Vacations',          emoji: '🌴', balance: 98.42, color: '#10b981', type: 'leaf', note: 'Travel savings goal' },
            { id: 'weed',       label: 'Weed',               emoji: '🌿', balance: 0,     color: '#10b981', type: 'leaf', note: '20% of 10% paycheck remainder — direct from Sequence rule' },
            { id: 'suspension', label: 'Suspension Upgrade', emoji: '🔩', balance: 32.38, color: '#f59e0b', type: 'leaf', note: 'Van upgrade fund' },
            { id: 'bumper',     label: 'Bumper / Winch',     emoji: '🚐', balance: 0,     color: '#f59e0b', type: 'leaf', note: 'Van upgrade fund' },
            { id: 'rear-door',  label: 'Rear Door Storage',  emoji: '🗄️', balance: 0,     color: '#f59e0b', type: 'leaf', note: 'Van upgrade fund' },
          ],
        },
        { id: 'pay-autosave', label: 'Pay Autosave', emoji: '💸',  balance: 0.99, color: '#10b981', type: 'leaf', note: 'Automatic savings rule' },
        { id: 'growth',       label: 'Growth',       emoji: '📈',  balance: 0,    color: '#22c55e', type: 'leaf', note: 'Investing / long-term growth' },
        { id: 'spend',        label: 'Spend',        emoji: '💳',  balance: 0.07, color: '#6366f1', type: 'leaf', note: 'General discretionary spend' },
        { id: 'to-expense',   label: 'To Expense',   emoji: '🧾',  balance: 0,    color: '#6366f1', type: 'leaf', note: 'Work expense reimbursement tracking' },
        { id: 'reserve',      label: 'Reserve',      emoji: '🛡️',  balance: 0,    color: '#10b981', type: 'leaf', note: 'Emergency / rainy day reserve' },
        { id: 'affirm',       label: 'Affirm',       emoji: '💳',  balance: 0,    color: '#f59e0b', type: 'account', note: 'Buy now, pay later account' },
        { id: 'capital-one',  label: 'Capital One',  emoji: '💳',  balance: 0,    color: '#ef4444', type: 'account', note: 'Credit card' },
        { id: 'dad',          label: 'Dad',          emoji: '👨‍👦', color: '#64748b', type: 'leaf', note: 'Manually linked external account' },
      ],
    },

    /* ── OVERFLOW CAN ── */
    {
      id: 'overflow', label: 'Overflow Can', emoji: '🪣',
      sublabel: 'Catches any unallocated excess from Needs — flows into Blow It',
      balance: 0.79,                         // ← UPDATE: Sequence overflow balance
      color: '#f59e0b', type: 'pod',
      children: [
        { id: 'blow-it', label: 'Blow It', emoji: '🎉', balance: 0, color: '#f97316', type: 'leaf', note: 'Guilt-free discretionary — no rules, no tracking' },
      ],
    },

    /* ── EMERGENCY FUND (30% of 10% remainder → One Finance HYSA) ── */
    {
      id: 'emergency-fund', label: 'Emergency Fund', emoji: '🆘',
      balance: 0,                            // ← UPDATE: check One Finance balance
      goal: 1000, goalDate: 'Dec 31, 2026',
      amountLabel: '30% of 10% remainder',
      color: '#22c55e', type: 'leaf',
      sublabel: '30% of the 10% Paycheck remainder routes directly to One Finance HYSA — $1k goal for 2026',
      note: 'One Finance High Yield Savings Account · PNC as backup',
    },

    /* ── JUSTIN'S BACHELOR PARTY ── */
    {
      id: 'bachelor', label: "Justin's Bachelor Party", emoji: '🎊',
      balance: 176.70,                       // ← UPDATE: check Sequence bachelor pod
      goal: 600, goalDate: 'Aug 31, 2026', goalPerPaycheck: 45,
      color: '#8b5cf6', type: 'leaf',
      note: '$176.70 seed moved in · $45/paycheck until Aug 31',
    },

  ],
};
