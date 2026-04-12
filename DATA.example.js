/* ══════════════════════════════════════════════════════════════════════════════
   DATA.example.js  —  Debt Payoff Dashboard · Template / Reference
   ══════════════════════════════════════════════════════════════════════════════

   This file is committed to git as a reference template.
   The real data lives in DATA.js (gitignored).

   To get started:
     1. Copy this file to DATA.js
     2. Fill in your real balances, API key, and PIN
     3. Never commit DATA.js

   ══════════════════════════════════════════════════════════════════════════════ */


/* ── API ──────────────────────────────────────────────────────────────────── */
const SEQUENCE_API_KEY  = 'YOUR_SEQUENCE_API_KEY_HERE';
const SEQUENCE_API_BASE = 'https://api.sequence.money/v1';


/* ── LOCK SCREEN PIN ─────────────────────────────────────────────────────── */
const CORRECT_PIN = '0000';  // ← Change to your 4-digit PIN


/* ── SIMULATION START DATE ──────────────────────────────────────────────── */
const START_DATE = new Date(2026, 3, 11); // April 11, 2026 (month is 0-indexed)


/* ══════════════════════════════════════════════════════════════════════════════
   DEBTS
   ══════════════════════════════════════════════════════════════════════════════ */
const DEBTS = [

  /* ── Consumer debts — avalanche order (highest APR first) ── */

  {
    id: 'upstart', name: 'Upstart Personal Loan', short: 'Upstart',
    balance:  0,        // ← UPDATE: check Upstart app
    apr:      31.75,
    payment:  0,        // ← UPDATE when cascade hits
    minimum:  0,
    color: '#ef4444', priority: 1, type: 'loan',
    note: 'All freed minimums routed here — cascades to Amex when paid off',
  },
  {
    id: 'amex', name: 'American Express', short: 'Amex',
    balance:  0,        // ← UPDATE: check Amex app
    apr:      29.99,
    payment:  0,
    minimum:  0,
    color: '#3b82f6', priority: 2, type: 'credit',
    note: 'Minimum only until Upstart is paid off',
  },
  {
    id: 'bestbuy', name: 'Best Buy (Citibank)', short: 'Best Buy',
    balance:  0,        // ← UPDATE: check Citibank app
    apr:      29.10,
    payment:  0,
    minimum:  0,
    color: '#f97316', priority: 3, type: 'credit',
    note: 'Minimum only — stop new purchases',
  },
  {
    id: 'wellsfargo', name: 'Wells Fargo (Mattress)', short: 'Wells Fargo',
    balance:  0,        // ← UPDATE: check Wells Fargo app
    apr:      28.99,
    payment:  0,
    minimum:  0,
    color: '#fbbf24', priority: 4, type: 'credit',
    danger: true, deferredDeadline: 'Jan 24, 2027',
    note: 'Paying above minimum to clear deferred interest before deadline',
  },
  {
    id: 'chase', name: 'Chase (Whole Foods Prime)', short: 'Chase',
    balance:  0,        // ← UPDATE: check Chase app
    apr:      27.49,
    payment:  0,
    minimum:  0,
    color: '#22d3ee', priority: 5, type: 'credit',
    note: 'Minimum only',
  },
  {
    id: 'apple', name: 'Apple Card', short: 'Apple',
    balance:  0,        // ← UPDATE: check Wallet app
    apr:      25.49,
    payment:  0,
    minimum:  0,
    color: '#a855f7', priority: 6, type: 'credit',
  },
  {
    id: 'upgrade', name: 'Upgrade Credit Card', short: 'Upgrade',
    balance:  0,        // ← UPDATE: check Upgrade app
    apr:      20.99,
    payment:  0,
    minimum:  0,
    color: '#ec4899', priority: 7, type: 'credit',
  },
  {
    id: 'roadrunner', name: 'Roadrunner (Dirt Bike)', short: 'Moto',
    balance:  0,        // ← UPDATE: check Roadrunner
    apr:      14.74,
    payment:  0,
    minimum:  0,
    color: '#14b8a6', priority: 8, type: 'loan',
  },
  {
    id: 'fidelity', name: 'Fidelity Visa (0% Promo)', short: 'Fidelity',
    balance:  0,        // ← UPDATE: check Fidelity app
    apr:      0,
    payment:  0,
    minimum:  0,
    color: '#6366f1', priority: 9, type: 'credit',
    promoEnd: 'Sep 2027',
    note: 'True 0% until Sep 2027 — pay minimums only',
  },

  /* ── Long-term loans — minimums only, cascade hits here last ── */

  {
    id: 'van', name: 'Van (U.S. Bank)', short: 'Van',
    balance:  0,        // ← UPDATE: check U.S. Bank app
    apr:      8.74,
    payment:  0,
    minimum:  0,
    color: '#78716c', priority: 10, type: 'loan', longTerm: true,
    note: 'REC loan, matures Jan 2045. $850 biweekly autopay (~$1,700/mo). Cascade hits here after Fidelity.',
  },
  {
    id: 'aidvantage', name: 'Aidvantage (Federal)', short: 'Federal',
    balance:  0,        // ← UPDATE: check Aidvantage portal
    apr:      6.625,
    payment:  0,
    minimum:  0,
    color: '#64748b', priority: 11, type: 'loan', longTerm: true,
    note: 'Federal student loan — cascade hits after Van is paid off.',
  },
  {
    id: 'earnest', name: 'Earnest (Private Student)', short: 'Earnest',
    balance:  0,        // ← UPDATE: check Earnest app
    apr:      5.65,
    payment:  0,
    minimum:  0,
    color: '#0ea5e9', priority: 12, type: 'loan', longTerm: true,
    note: 'Private student loan — final debt in the cascade.',
  },
];


/* ══════════════════════════════════════════════════════════════════════════════
   PAYCHECK FLOW DATA
   Mirrors your Sequence money map. Update balances after each paycheck.
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

        { id: 'student-loans-pod', label: 'Student Loans', emoji: '🍎',
          amount: 350, balance: 0, color: '#8b5cf6', type: 'pod', apr: 6.1,
          payoffRef: ['aidvantage','earnest'],
          sublabel: '$350/paycheck split between Aidvantage and Earnest',
          children: [
            { id: 'aidvantage', label: 'Aidvantage', emoji: '🎓', amount: 250, color: '#a78bfa', type: 'account', apr: 6.625, payoffRef: ['aidvantage'], note: 'Monthly minimum payment' },
            { id: 'earnest',    label: 'Earnest',     emoji: '🎓', amount: 100, color: '#a78bfa', type: 'account', apr: 5.65,  payoffRef: ['earnest'],    note: 'Monthly minimum' },
          ],
        },

        { id: 'loans-pod', label: 'Loans', emoji: '🏦',
          amount: 940, balance: 0, color: '#ef4444', type: 'pod', apr: 31.75,
          payoffRef: ['upstart','wellsfargo','fidelity'],
          sublabel: '$940/paycheck — paid in strict priority order',
          children: [
            { id: 'wf-loan',         label: 'Wells Fargo',         emoji: '⚠️', amount: 75,   color: '#f87171', type: 'account', apr: 28.99, payoffRef: ['wellsfargo'], note: 'Paid FIRST — deferred interest' },
            { id: 'fidelity-loan',   label: 'Fidelity',            emoji: '🏦', amount: null, amountLabel: 'Fixed', color: '#f87171', type: 'account', apr: 0, payoffRef: ['fidelity'], note: '0% promo rate' },
            { id: 'upstart-fixed',   label: 'Upstart (fixed)',     emoji: '🎯', amount: null, amountLabel: 'Fixed', color: '#ef4444', type: 'account', apr: 31.75, payoffRef: ['upstart'], note: 'Fixed monthly allocation' },
            { id: 'upstart-loans-r', label: 'Upstart (remainder)', emoji: '🔥', amount: null, amountLabel: '100% remainder', color: '#dc2626', type: 'account', apr: 31.75, payoffRef: ['upstart'], note: 'Every leftover dollar → avalanche target' },
          ],
        },

        { id: 'cc-pod', label: 'Credit Cards', emoji: '💳',
          amount: 1000, balance: 0, color: '#3b82f6', type: 'pod', apr: 29.99,
          payoffRef: ['amex','bestbuy','chase','apple','upgrade'],
          sublabel: '$1,000/paycheck — minimums first, overflow held in pod',
          children: [
            { id: 'amex-card',    label: 'Amex',       emoji: '💳', amount: 396, color: '#60a5fa', type: 'account', apr: 29.99, payoffRef: ['amex'],    note: 'Minimum payment' },
            { id: 'bestbuy-card', label: 'Best Buy',   emoji: '💳', amount: 70,  color: '#60a5fa', type: 'account', apr: 29.10, payoffRef: ['bestbuy'], note: 'Minimum payment' },
            { id: 'cc-buffer',    label: 'Pod buffer', emoji: '💰', amount: null, amountLabel: 'Remainder', color: '#3b82f6', type: 'account', note: 'Held in pod — cascades when Amex is paid off' },
          ],
        },

        { id: 'bills',         label: 'Bills',                     emoji: '🧾', amount: 235,  balance: 0, color: '#f59e0b', type: 'leaf', dueDay: 15, note: 'Fixed recurring bills' },
        { id: 'van-maint',     label: 'Van Maintenance',           emoji: '🚐', amount: 60,   balance: 0, color: '#10b981', type: 'leaf', note: 'Van repairs & upkeep fund' },
        { id: 'groceries',     label: 'Groceries / Food / Bar',    emoji: '🍔', amount: 200,  balance: 0, color: '#10b981', type: 'leaf', note: 'Food & dining' },
        { id: 'diesel',        label: 'Diesel / Van Misc',         emoji: '⛽', amount: 150,  balance: 0, color: '#10b981', type: 'leaf', note: 'Fuel & van miscellaneous' },
        { id: 'progressive',   label: 'Progressive',               emoji: '🛡️', amount: 75,   balance: 0, color: '#10b981', type: 'leaf', dueDay: 20, note: 'Auto insurance' },
        { id: 'tmobile',       label: 'T-Mobile',                  emoji: '📱', amount: 100,  balance: 0, color: '#10b981', type: 'leaf', dueDay: 10, note: 'Phone plan' },
        { id: 'pub-storage',   label: 'Public Storage',            emoji: '📦', amount: 150,  balance: 0, color: '#10b981', type: 'leaf', dueDay: 1,  note: 'Storage unit' },
        { id: 'starlink',      label: 'Starlink',                  emoji: '🛰️', amount: 2.50, balance: 0, color: '#64748b', type: 'leaf', dueDay: 14, note: '⏸ Paused — $2.50 placeholder' },
        { id: 'subscriptions', label: 'Subscriptions',             emoji: '📺', amount: 125,  balance: 0, color: '#8b5cf6', type: 'leaf', dueDay: 3,  note: 'Netflix, HBO, Spotify, Claude.ai & more' },
        { id: 'tt-dues',       label: 'Thousand Trails',           emoji: '🏕️', amount: 55,   balance: 0, color: '#10b981', type: 'leaf', dueDay: 23, note: 'Campground membership dues' },
        { id: 'upstart-needs', label: 'Upstart (100% remainder)',  emoji: '🔥', amount: null, amountLabel: "100% of what's left", balance: 0, color: '#ef4444', type: 'account', apr: 31.75, payoffRef: ['upstart'], note: '🎯 Avalanche engine' },
      ],
    },

    /* ── WANTS POD (50% of 10% remainder) ── */
    {
      id: 'wants', label: 'Wants Pod', emoji: '🎁',
      sublabel: 'Discretionary spending, savings goals, and van upgrade funds',
      color: '#a855f7', type: 'pod',
      children: [
        { id: 'checking', label: 'Checking', emoji: '🏦',
          balance: 0, color: '#6366f1', type: 'pod',
          sublabel: 'Main spending account',
          children: [
            { id: 'vacations',  label: 'Vacations',          emoji: '🌴', balance: 0, color: '#10b981', type: 'leaf', note: 'Travel savings goal' },
            { id: 'weed',       label: 'Weed',               emoji: '🌿', balance: 0, color: '#10b981', type: 'leaf', note: '20% of 10% paycheck remainder' },
            { id: 'suspension', label: 'Suspension Upgrade', emoji: '🔩', balance: 0, color: '#f59e0b', type: 'leaf', note: 'Van upgrade fund' },
            { id: 'bumper',     label: 'Bumper / Winch',     emoji: '🚐', balance: 0, color: '#f59e0b', type: 'leaf', note: 'Van upgrade fund' },
            { id: 'rear-door',  label: 'Rear Door Storage',  emoji: '🗄️', balance: 0, color: '#f59e0b', type: 'leaf', note: 'Van upgrade fund' },
          ],
        },
        { id: 'pay-autosave', label: 'Pay Autosave', emoji: '💸', balance: 0, color: '#10b981', type: 'leaf', note: 'Automatic savings rule' },
        { id: 'growth',       label: 'Growth',       emoji: '📈', balance: 0, color: '#22c55e', type: 'leaf', note: 'Investing / long-term growth' },
        { id: 'spend',        label: 'Spend',        emoji: '💳', balance: 0, color: '#6366f1', type: 'leaf', note: 'General discretionary spend' },
        { id: 'to-expense',   label: 'To Expense',   emoji: '🧾', balance: 0, color: '#6366f1', type: 'leaf', note: 'Work expense reimbursement tracking' },
        { id: 'reserve',      label: 'Reserve',      emoji: '🛡️', balance: 0, color: '#10b981', type: 'leaf', note: 'Emergency / rainy day reserve' },
        { id: 'affirm',       label: 'Affirm',       emoji: '💳', balance: 0, color: '#f59e0b', type: 'account', note: 'Buy now, pay later account' },
        { id: 'capital-one',  label: 'Capital One',  emoji: '💳', balance: 0, color: '#ef4444', type: 'account', note: 'Credit card' },
        { id: 'dad',          label: 'Dad',          emoji: '👨‍👦', color: '#64748b', type: 'leaf', note: 'Manually linked external account' },
      ],
    },

    /* ── OVERFLOW CAN ── */
    {
      id: 'overflow', label: 'Overflow Can', emoji: '🪣',
      sublabel: 'Catches any unallocated excess from Needs — flows into Blow It',
      balance: 0, color: '#f59e0b', type: 'pod',
      children: [
        { id: 'blow-it', label: 'Blow It', emoji: '🎉', balance: 0, color: '#f97316', type: 'leaf', note: 'Guilt-free discretionary — no rules, no tracking' },
      ],
    },

    /* ── EMERGENCY FUND (30% of 10% remainder → One Finance HYSA) ── */
    {
      id: 'emergency-fund', label: 'Emergency Fund', emoji: '🆘',
      balance: 0,
      goal: 1000, goalDate: 'Dec 31, 2026',
      amountLabel: '30% of 10% remainder',
      color: '#22c55e', type: 'leaf',
      sublabel: '30% of the 10% Paycheck remainder routes directly to One Finance HYSA — $1k goal for 2026',
      note: 'One Finance High Yield Savings Account · PNC as backup',
    },

    /* ── BACHELOR PARTY ── */
    {
      id: 'bachelor', label: "Justin's Bachelor Party", emoji: '🎊',
      balance: 0,
      goal: 600, goalDate: 'Aug 31, 2026', goalPerPaycheck: 45,
      color: '#8b5cf6', type: 'leaf',
      note: '$45/paycheck until Aug 31',
    },

  ],
};
