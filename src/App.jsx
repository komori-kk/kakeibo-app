import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home,
  PlusCircle,
  ListOrdered,
  Settings,
  Wallet,
  PiggyBank,
  Building2,
  Flame,
  BookOpen,
  Smartphone,
  Car,
  Utensils,
  Store,
  Soup,
  Fuel,
  ShoppingBag,
  MoreHorizontal,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Delete,
  Calendar,
  ArrowRight,
  Coins,
  Gift,
  Briefcase,
  Award,
  Coffee,
  Shirt,
  HeartPulse,
  Sun,
  PartyPopper,
  Edit3,
  Check,
  X,
  Layers,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  LayoutGrid,
  PieChart,
  BarChart3,
} from 'lucide-react';

const STORAGE_KEYS = {
  SETTINGS: 'kakeibo_v2_settings',
  TRANSACTIONS: 'kakeibo_v2_transactions',
  SECURITY: 'kakeibo_v2_security',
};

const DEFAULT_SETTINGS = {
  income: 220000,
  savingsTarget: 30000,
  fixedCosts: {
    rent: 53000,
    utilities: 12000,
    studySub: 30000,
    communication: 7000,
    carMaintenance: 10000,
  },
};

const DEFAULT_SECURITY = {
  pinEnabled: false,
  pinCode: '',
  privacyMask: false,
};

const FIXED_COST_ITEMS = [
  { key: 'rent', label: '家賃', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', hex: '#3b82f6' },
  { key: 'utilities', label: '光熱費', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', hex: '#f97316' },
  { key: 'studySub', label: '勉強サブスク', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', hex: '#a855f7' },
  { key: 'communication', label: '通信費', icon: Smartphone, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', hex: '#06b6d4' },
  { key: 'carMaintenance', label: '車維持費', icon: Car, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', hex: '#10b981' },
];

// 1. 変動費カテゴリ（日々の支出） - hexカラー付き（グラフ描画用）
const EXPENSE_CATEGORIES = [
  { id: 'cooking', label: '自炊', icon: Soup, bg: 'bg-emerald-50', activeBg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600', bar: 'bg-emerald-500', hex: '#10b981' },
  { id: 'convenience', label: 'コンビニ', icon: Store, bg: 'bg-amber-50', activeBg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-600', bar: 'bg-amber-500', hex: '#f59e0b' },
  { id: 'dining', label: '外食', icon: Utensils, bg: 'bg-rose-50', activeBg: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-700', iconColor: 'text-rose-600', bar: 'bg-rose-500', hex: '#f43f5e' },
  { id: 'transport', label: 'ガソリン・交通費', icon: Fuel, bg: 'bg-sky-50', activeBg: 'bg-sky-500', border: 'border-sky-200', text: 'text-sky-700', iconColor: 'text-sky-600', bar: 'bg-sky-500', hex: '#0ea5e9' },
  { id: 'daily', label: '日用品', icon: ShoppingBag, bg: 'bg-indigo-50', activeBg: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-700', iconColor: 'text-indigo-600', bar: 'bg-indigo-500', hex: '#6366f1' },
  { id: 'cafe', label: 'カフェ・娯楽', icon: Coffee, bg: 'bg-orange-50', activeBg: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-700', iconColor: 'text-orange-600', bar: 'bg-orange-500', hex: '#f97316' },
  { id: 'fashion', label: '美容・衣服', icon: Shirt, bg: 'bg-pink-50', activeBg: 'bg-pink-500', border: 'border-pink-200', text: 'text-pink-700', iconColor: 'text-pink-600', bar: 'bg-pink-500', hex: '#ec4899' },
  { id: 'medical', label: '医療・健康', icon: HeartPulse, bg: 'bg-teal-50', activeBg: 'bg-teal-500', border: 'border-teal-200', text: 'text-teal-700', iconColor: 'text-teal-600', bar: 'bg-teal-500', hex: '#14b8a6' },
  { id: 'other', label: 'その他支出', icon: MoreHorizontal, bg: 'bg-slate-100', activeBg: 'bg-slate-600', border: 'border-slate-200', text: 'text-slate-700', iconColor: 'text-slate-600', bar: 'bg-slate-500', hex: '#64748b' },
];

// 2. 収入カテゴリ（すべての収入）
const INCOME_CATEGORIES = [
  { id: 'salary', label: '手取り月収', icon: Briefcase, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600', isBaseSalary: true },
  { id: 'sidejob', label: '副業・フリマ', icon: Coins, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-600' },
  { id: 'temporary', label: '臨時収入・お祝い', icon: Gift, bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', iconColor: 'text-pink-600' },
  { id: 'cashback', label: '還付・ポイント', icon: Sparkles, bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconColor: 'text-sky-600' },
  { id: 'bonus', label: '賞与・ボーナス', icon: Award, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconColor: 'text-purple-600' },
  { id: 'other_income', label: 'その他収入', icon: PlusCircle, bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', iconColor: 'text-teal-600' },
];

// 3. 固定費・貯蓄カテゴリ
const FIXED_AND_SAVINGS_CATEGORIES = [
  { id: 'savings_main', label: '先取り貯蓄', icon: PiggyBank, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-600', settingKey: 'savingsTarget', kind: 'savings' },
  { id: 'savings_extra', label: '追加貯金・投資', icon: TrendingUp, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600', kind: 'savings_extra' },
  { id: 'fixed_rent', label: '家賃', icon: Building2, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-600', fixedKey: 'rent', kind: 'fixed' },
  { id: 'fixed_utilities', label: '光熱費', icon: Flame, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconColor: 'text-orange-600', fixedKey: 'utilities', kind: 'fixed' },
  { id: 'fixed_studySub', label: '勉強サブスク', icon: BookOpen, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconColor: 'text-purple-600', fixedKey: 'studySub', kind: 'fixed' },
  { id: 'fixed_communication', label: '通信費', icon: Smartphone, bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', iconColor: 'text-cyan-600', fixedKey: 'communication', kind: 'fixed' },
  { id: 'fixed_carMaintenance', label: '車維持費', icon: Car, bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', iconColor: 'text-teal-600', fixedKey: 'carMaintenance', kind: 'fixed' },
  { id: 'fixed_other', label: 'その他固定費', icon: Layers, bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700', iconColor: 'text-slate-600', kind: 'fixed_extra' },
];

const ALL_CATEGORY_MAP = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...FIXED_AND_SAVINGS_CATEGORIES].reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {}
);

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

function formatYen(amount) {
  return new Intl.NumberFormat('ja-JP').format(Math.round(amount));
}

function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysAgoInfo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${day}`;
  const shortLabel = `${d.getMonth() + 1}/${d.getDate()}`;
  const weekday = WEEKDAY_JA[d.getDay()];
  return { dateStr, shortLabel, weekday };
}

function getDaysAgoString(daysAgo) {
  return getDaysAgoInfo(daysAgo).dateStr;
}

export default function App() {
  // 'top' | 'home' | 'input' | 'history' | 'settings'
  const [activeTab, setActiveTab] = useState('top');
  // Chart sub-tab on Dashboard: 'donut' | 'daily' | 'balance'
  const [chartMode, setChartMode] = useState('donut');
  const [selectedSliceId, setSelectedSliceId] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('kakeibo_v1_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          fixedCosts: { ...DEFAULT_SETTINGS.fixedCosts, ...(parsed.fixedCosts || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Security & Privacy State
  const [security, setSecurity] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECURITY);
      if (saved) {
        return { ...DEFAULT_SECURITY, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load security settings:', e);
    }
    return DEFAULT_SECURITY;
  });

  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECURITY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !(parsed.pinEnabled && parsed.pinCode);
      }
    } catch {
      return true;
    }
    return true;
  });
  const [pinInput, setPinInput] = useState('');
  const [newPinDraft, setNewPinDraft] = useState('');

  // Unified Transactions State
  const [transactions, setTransactions] = useState(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedV2) {
        return JSON.parse(savedV2);
      }
      const savedV1 = localStorage.getItem('kakeibo_v1_expenses');
      if (savedV1) {
        const parsedV1 = JSON.parse(savedV1);
        return parsedV1.map((item) => ({
          ...item,
          entryType: item.entryType || 'expense',
        }));
      }
    } catch (e) {
      console.error('Failed to load transactions:', e);
    }
    return [];
  });

  // Input Tab State
  const [entryType, setEntryType] = useState('expense');
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cooking');
  const [memo, setMemo] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayDateString());

  // Editing State in History Tab
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMemo, setEditMemo] = useState('');

  // History Filter State
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Persist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(security));
    } catch (e) {
      console.error('Failed to save security:', e);
    }
  }, [security]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  const displayYen = (amount) => {
    if (security.privacyMask) return '• • • • •';
    return formatYen(amount);
  };

  const navigateToTab = (targetTab) => {
    if (security.pinEnabled && security.pinCode && !isUnlocked && targetTab !== 'top') {
      setActiveTab('top');
      showToast('🔒 4桁のパスコードを入力してロックを解除してください');
      return;
    }
    setActiveTab(targetTab);
  };

  const handlePinKey = (digit) => {
    if (digit === 'BS') {
      setPinInput((prev) => prev.slice(0, -1));
      return;
    }
    if (pinInput.length >= 4) return;
    const next = pinInput + digit;
    setPinInput(next);
    if (next.length === 4) {
      if (next === security.pinCode) {
        setIsUnlocked(true);
        setPinInput('');
        setActiveTab('home');
        showToast('🔓 ロックを解除しました！');
      } else {
        setTimeout(() => {
          setPinInput('');
          showToast('⚠️ パスコードが違います');
        }, 250);
      }
    }
  };

  const handleSelectEntryType = (type) => {
    setEntryType(type);
    if (type === 'expense') {
      setSelectedCategory('cooking');
      setAmountStr('');
    } else if (type === 'income') {
      setSelectedCategory('sidejob');
      setAmountStr('');
    } else if (type === 'fixed_savings') {
      setSelectedCategory('fixed_utilities');
      setAmountStr(String(settings.fixedCosts.utilities || 12000));
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat.id);
    if (entryType === 'income' && cat.isBaseSalary) {
      setAmountStr(String(settings.income));
    } else if (entryType === 'fixed_savings') {
      if (cat.settingKey === 'savingsTarget') {
        setAmountStr(String(settings.savingsTarget));
      } else if (cat.fixedKey) {
        setAmountStr(String(settings.fixedCosts[cat.fixedKey] || 0));
      }
    }
  };

  // ==================== MONTHLY CALCULATIONS ====================
  const currentMonthPrefix = getTodayDateString().slice(0, 7);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(currentMonthPrefix));
  }, [transactions, currentMonthPrefix]);

  // 1. 今月の収入計算
  const { effectiveBaseSalary, extraIncomeTotal, totalMonthlyIncome } = useMemo(() => {
    const incomeEntries = currentMonthTransactions.filter((t) => t.entryType === 'income');
    const loggedSalary = incomeEntries
      .filter((t) => t.category === 'salary')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const loggedExtra = incomeEntries
      .filter((t) => t.category !== 'salary')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const base = loggedSalary > 0 ? loggedSalary : Number(settings.income) || 0;
    return {
      effectiveBaseSalary: base,
      extraIncomeTotal: loggedExtra,
      totalMonthlyIncome: base + loggedExtra,
    };
  }, [currentMonthTransactions, settings.income]);

  // 2. 今月の固定費計算
  const { effectiveFixedCosts, totalFixedCosts } = useMemo(() => {
    const fixedEntries = currentMonthTransactions.filter(
      (t) => t.entryType === 'fixed_savings' && t.category.startsWith('fixed_')
    );
    const result = { ...settings.fixedCosts };
    FIXED_COST_ITEMS.forEach((item) => {
      const catId = `fixed_${item.key}`;
      const loggedForCat = fixedEntries
        .filter((t) => t.category === catId)
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      if (loggedForCat > 0) {
        result[item.key] = loggedForCat;
      }
    });
    const extraFixed = fixedEntries
      .filter((t) => t.category === 'fixed_other')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const sumFixed =
      Object.values(result).reduce((acc, v) => acc + (Number(v) || 0), 0) + extraFixed;

    return {
      effectiveFixedCosts: result,
      totalFixedCosts: sumFixed,
    };
  }, [currentMonthTransactions, settings.fixedCosts]);

  // 3. 今月の貯蓄計算
  const { effectiveSavingsTotal } = useMemo(() => {
    const savingsEntries = currentMonthTransactions.filter(
      (t) => t.entryType === 'fixed_savings' && t.category.startsWith('savings_')
    );
    const loggedMainSavings = savingsEntries
      .filter((t) => t.category === 'savings_main')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const loggedExtraSavings = savingsEntries
      .filter((t) => t.category === 'savings_extra')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const baseSavings =
      loggedMainSavings > 0 ? loggedMainSavings : Number(settings.savingsTarget) || 0;
    return {
      effectiveSavingsTotal: baseSavings + loggedExtraSavings,
    };
  }, [currentMonthTransactions, settings.savingsTarget]);

  // 4. 月間の自由に使える予算
  const monthlyDisposableBudget = useMemo(() => {
    return totalMonthlyIncome - totalFixedCosts - effectiveSavingsTotal;
  }, [totalMonthlyIncome, totalFixedCosts, effectiveSavingsTotal]);

  // 5. 今月の日々の支出（変動費）合計
  const currentMonthVariableExpenses = useMemo(() => {
    return currentMonthTransactions.filter((t) => !t.entryType || t.entryType === 'expense');
  }, [currentMonthTransactions]);

  const totalMonthlySpent = useMemo(() => {
    return currentMonthVariableExpenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  }, [currentMonthVariableExpenses]);

  // 6. 今月あといくら使えるか
  const remainingBudget = monthlyDisposableBudget - totalMonthlySpent;
  const remainingRatio =
    monthlyDisposableBudget > 0
      ? Math.max(0, Math.min(100, (remainingBudget / monthlyDisposableBudget) * 100))
      : 0;

  // 7. 直近7日間の利用額と週基準予算（約1.8万円 = 18,000円）
  const weeklyStandardBudget = useMemo(() => {
    if (monthlyDisposableBudget === 78000) return 18000;
    return Math.max(0, Math.round(monthlyDisposableBudget / 4.333 / 100) * 100);
  }, [monthlyDisposableBudget]);

  const sevenDaysAgoStr = getDaysAgoString(6);
  const todayStr = getTodayDateString();

  // 直近7日間の日別データ（棒グラフ用）
  const last7DaysDailyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const info = getDaysAgoInfo(i);
      const dayTotal = transactions
        .filter((item) => (!item.entryType || item.entryType === 'expense') && item.date === info.dateStr)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      days.push({
        ...info,
        isToday: i === 0,
        amount: dayTotal,
      });
    }
    return days;
  }, [transactions]);

  const last7DaysSpent = useMemo(() => {
    return last7DaysDailyData.reduce((acc, d) => acc + d.amount, 0);
  }, [last7DaysDailyData]);

  const weeklyRatio =
    weeklyStandardBudget > 0 ? Math.min(100, (last7DaysSpent / weeklyStandardBudget) * 100) : 0;
  const weeklyDiff = weeklyStandardBudget - last7DaysSpent;

  const remainingDaysInMonth = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.max(1, lastDay - now.getDate() + 1);
  }, []);
  const dailyAllowance = Math.max(0, Math.floor(remainingBudget / remainingDaysInMonth));

  const categoryBreakdown = useMemo(() => {
    const map = {};
    EXPENSE_CATEGORIES.forEach((c) => {
      map[c.id] = 0;
    });
    currentMonthVariableExpenses.forEach((e) => {
      if (map[e.category] !== undefined) {
        map[e.category] += Number(e.amount) || 0;
      } else {
        map.other = (map.other || 0) + (Number(e.amount) || 0);
      }
    });
    return EXPENSE_CATEGORIES.map((c) => ({
      ...c,
      total: map[c.id] || 0,
      rawRatio: totalMonthlySpent > 0 ? (map[c.id] || 0) / totalMonthlySpent : 0,
      percent: totalMonthlySpent > 0 ? Math.round(((map[c.id] || 0) / totalMonthlySpent) * 100) : 0,
    }));
  }, [currentMonthVariableExpenses, totalMonthlySpent]);

  // Donut Chart Segments (SVG stroke-dasharray calculation)
  const donutSegments = useMemo(() => {
    const activeCats = categoryBreakdown.filter((c) => c.total > 0);
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let accumulatedRatio = 0;

    return activeCats.map((cat) => {
      const strokeLength = cat.rawRatio * circumference;
      const strokeOffset = -accumulatedRatio * circumference;
      accumulatedRatio += cat.rawRatio;
      return {
        ...cat,
        radius,
        circumference,
        strokeLength,
        strokeOffset,
      };
    });
  }, [categoryBreakdown]);

  // Keypad handlers
  const handleKeypadPress = (key) => {
    if (key === 'C') {
      setAmountStr('');
      return;
    }
    if (key === 'BS') {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '00') {
      if (!amountStr) return;
      if (amountStr.length >= 6) return;
      setAmountStr((prev) => prev + '00');
      return;
    }
    if (amountStr === '0') {
      setAmountStr(key);
      return;
    }
    if (amountStr.length >= 7) return;
    setAmountStr((prev) => prev + key);
  };

  const handleQuickAddAmount = (addVal) => {
    const current = Number(amountStr) || 0;
    const next = Math.min(9999999, current + addVal);
    setAmountStr(String(next));
  };

  const previewRemainingBudget = useMemo(() => {
    const num = Number(amountStr) || 0;
    if (!num) return remainingBudget;
    if (entryType === 'expense') {
      return remainingBudget - num;
    }
    if (entryType === 'income') {
      if (selectedCategory === 'salary') {
        return remainingBudget + (num - effectiveBaseSalary);
      }
      return remainingBudget + num;
    }
    if (entryType === 'fixed_savings') {
      const cat = ALL_CATEGORY_MAP[selectedCategory];
      if (cat?.settingKey === 'savingsTarget') {
        return remainingBudget - (num - settings.savingsTarget);
      }
      if (cat?.fixedKey) {
        return remainingBudget - (num - (effectiveFixedCosts[cat.fixedKey] || 0));
      }
      return remainingBudget - num;
    }
    return remainingBudget;
  }, [
    amountStr,
    entryType,
    selectedCategory,
    remainingBudget,
    effectiveBaseSalary,
    settings.savingsTarget,
    effectiveFixedCosts,
  ]);

  const handleAddTransaction = (e) => {
    if (e) e.preventDefault();
    const numAmount = Number(amountStr);
    if (!numAmount || numAmount <= 0) {
      showToast('金額を入力してください✨');
      return;
    }
    const catObj = ALL_CATEGORY_MAP[selectedCategory] || EXPENSE_CATEGORIES[0];

    if (entryType === 'income' && selectedCategory === 'salary') {
      setSettings((prev) => ({ ...prev, income: numAmount }));
    } else if (entryType === 'fixed_savings') {
      if (catObj.settingKey === 'savingsTarget') {
        setSettings((prev) => ({ ...prev, savingsTarget: numAmount }));
      } else if (catObj.fixedKey) {
        setSettings((prev) => ({
          ...prev,
          fixedCosts: { ...prev.fixedCosts, [catObj.fixedKey]: numAmount },
        }));
      }
    }

    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entryType,
      amount: numAmount,
      category: selectedCategory,
      memo: memo.trim() || catObj.label,
      date: entryDate || getTodayDateString(),
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newEntry, ...prev]);
    setAmountStr('');
    setMemo('');

    if (entryType === 'income') {
      showToast(`🎉 収入 +¥${formatYen(numAmount)}（${catObj.label}）を記録しました！`);
    } else if (entryType === 'fixed_savings') {
      showToast(`✨ ${catObj.label} ¥${formatYen(numAmount)} を記録しました！`);
    } else {
      showToast(`👏 ¥${formatYen(numAmount)}（${catObj.label}）を記帳しました！`);
    }
    setActiveTab('home');
  };

  const handleRegisterMonthlyBaseItems = () => {
    const today = getTodayDateString();
    const baseItems = [
      {
        id: `base-salary-${Date.now()}`,
        entryType: 'income',
        amount: settings.income,
        category: 'salary',
        memo: '今月の手取り月収',
        date: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: `base-savings-${Date.now() + 1}`,
        entryType: 'fixed_savings',
        amount: settings.savingsTarget,
        category: 'savings_main',
        memo: '今月の先取り貯蓄',
        date: today,
        createdAt: new Date().toISOString(),
      },
      ...FIXED_COST_ITEMS.map((item, idx) => ({
        id: `base-fixed-${item.key}-${Date.now() + idx + 2}`,
        entryType: 'fixed_savings',
        amount: settings.fixedCosts[item.key],
        category: `fixed_${item.key}`,
        memo: `${item.label}（固定費）`,
        date: today,
        createdAt: new Date().toISOString(),
      })),
    ];

    setTransactions((prev) => {
      const filtered = prev.filter(
        (t) =>
          !(
            t.date?.startsWith(currentMonthPrefix) &&
            (t.category === 'salary' ||
              t.category === 'savings_main' ||
              t.category.startsWith('fixed_'))
          )
      );
      return [...baseItems, ...filtered];
    });
    showToast('🎉 今月の給与・固定費・先取り貯蓄を明細に一括登録しました！');
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    showToast('明細を1件削除しました');
  };

  const startEditTransaction = (item) => {
    setEditingId(item.id);
    setEditAmount(String(item.amount));
    setEditMemo(item.memo || '');
  };

  const saveEditTransaction = (item) => {
    const num = Number(editAmount);
    if (!num || num <= 0) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, amount: num, memo: editMemo.trim() || t.memo } : t))
    );
    setEditingId(null);
    showToast('✨ 明細を更新しました！');
  };

  const handleLoadSampleData = () => {
    const today = getTodayDateString();
    const sample = [
      {
        id: 'sample-inc-1',
        entryType: 'income',
        amount: 220000,
        category: 'salary',
        memo: '今月の手取り給与',
        date: getDaysAgoString(5),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-inc-2',
        entryType: 'income',
        amount: 4500,
        category: 'sidejob',
        memo: 'メルカリ不用品売上',
        date: getDaysAgoString(2),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-sav-1',
        entryType: 'fixed_savings',
        amount: 30000,
        category: 'savings_main',
        memo: '先取り貯蓄（自動振替）',
        date: getDaysAgoString(5),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-exp-1',
        entryType: 'expense',
        amount: 2480,
        category: 'cooking',
        memo: 'スーパーまとめ買い（鶏むね肉・野菜・卵）',
        date: today,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-exp-2',
        entryType: 'expense',
        amount: 680,
        category: 'convenience',
        memo: 'アイスコーヒー・スイーツ',
        date: getDaysAgoString(1),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-exp-3',
        entryType: 'expense',
        amount: 1650,
        category: 'dining',
        memo: 'お気に入りカフェでランチ',
        date: getDaysAgoString(2),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-exp-4',
        entryType: 'expense',
        amount: 1200,
        category: 'daily',
        memo: 'ドラッグストア日用品',
        date: getDaysAgoString(3),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-exp-5',
        entryType: 'expense',
        amount: 3400,
        category: 'transport',
        memo: 'レギュラーガソリン給油',
        date: getDaysAgoString(4),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sample-exp-6',
        entryType: 'expense',
        amount: 950,
        category: 'cafe',
        memo: '休日の読書カフェ',
        date: getDaysAgoString(5),
        createdAt: new Date().toISOString(),
      },
    ];
    setTransactions(sample);
    showToast('🌈 サンプル収支データを読み込みました！グラフをご覧ください✨');
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    showToast('初期設定（手取り22万・固定費11.2万・貯蓄3万）に戻しました');
  };

  const handleExportBackup = () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings,
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `happy-kakeibo-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📦 バックアップファイルを保存しました！');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.settings) setSettings(parsed.settings);
        if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        showToast('🎉 バックアップデータを復元しました！');
      } catch {
        showToast('⚠️ ファイルの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const itemType = item.entryType || 'expense';
      if (filterType !== 'all' && itemType !== filterType) return false;
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      return true;
    });
  }, [transactions, filterType, filterCategory]);

  const currentCategoryOptions =
    entryType === 'expense'
      ? EXPENSE_CATEGORIES
      : entryType === 'income'
      ? INCOME_CATEGORIES
      : FIXED_AND_SAVINGS_CATEGORIES;

  // Bar Chart max height calculation
  const dailyTargetLine = Math.round(weeklyStandardBudget / 7);
  const maxDailyChartVal = useMemo(() => {
    const highestDay = Math.max(...last7DaysDailyData.map((d) => d.amount), 0);
    return Math.max(highestDay, dailyTargetLine * 1.4, 4000);
  }, [last7DaysDailyData, dailyTargetLine]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-sky-50/70 text-slate-800 flex justify-center">
      {/* Mobile-first App Frame */}
      <div className="w-full max-w-md min-h-screen bg-slate-50/90 border-x border-emerald-100/80 flex flex-col relative shadow-xl shadow-emerald-950/5">
        {/* Top Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-white/90 border-b border-emerald-100 px-3.5 py-2.5 flex items-center justify-between shadow-sm">
          <div
            onClick={() => setActiveTab('top')}
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-400/30">
              <Sun className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold tracking-tight text-slate-800 leading-none">
                  ハッピー家計簿
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {currentMonthTransactions.length}件✨
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                タップでトップ画面へ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setSecurity((prev) => ({ ...prev, privacyMask: !prev.privacyMask }))
              }
              title="金額の目隠し切替"
              className={`p-2 rounded-full border transition active:scale-95 ${
                security.privacyMask
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {security.privacyMask ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            {security.pinEnabled && security.pinCode && isUnlocked && (
              <button
                onClick={() => {
                  setIsUnlocked(false);
                  setActiveTab('top');
                  showToast('🔒 画面をロックしました');
                }}
                title="画面をロック"
                className="p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition active:scale-95"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => navigateToTab('input')}
              className="text-xs font-bold px-3 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:brightness-105 active:scale-95 transition flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>入力</span>
            </button>
          </div>
        </header>

        {/* Joyful Toast Notification */}
        {toast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-xs w-[92%] bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 animate-bounce">
            <PartyPopper className="w-4 h-4 shrink-0" />
            <span className="truncate">{toast}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4">
          {/* ==================== TAB 0: TOP PAGE ==================== */}
          {activeTab === 'top' && (
            <div className="space-y-4 pb-4">
              <section className="rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white p-6 shadow-xl shadow-emerald-500/20 relative overflow-hidden text-center">
                <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-300/25 rounded-full blur-2xl pointer-events-none" />

                <div className="w-16 h-16 rounded-3xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Sun className="w-9 h-9 text-amber-200 stroke-[2.2]" />
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-[11px] font-extrabold text-white mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  手取り22万円の一人暮らし専用設計
                </span>

                <h2 className="text-2xl font-black tracking-tight text-white leading-snug">
                  今日も気持ちよく、
                  <br />
                  お金と仲良くなろう✨
                </h2>
                <p className="text-xs text-emerald-50 mt-2 font-medium leading-relaxed">
                  先取り貯蓄3万円と固定費を自動で守って、
                  <br />
                  「今月あといくら使えるか」がグラフと数字で1秒でわかる！
                </p>

                {security.pinEnabled && security.pinCode && !isUnlocked ? (
                  <div className="mt-5 bg-white/95 text-slate-800 rounded-3xl p-4 shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-emerald-700 mb-2">
                      <Lock className="w-4 h-4" />
                      <span>4桁のパスコードを入力</span>
                    </div>
                    <div className="flex justify-center gap-3 my-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full transition-all ${
                            pinInput.length > i ? 'bg-emerald-500 scale-110' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'BS'].map(
                        (k, idx) =>
                          k === '' ? (
                            <div key={idx} />
                          ) : (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handlePinKey(k)}
                              className="h-11 rounded-2xl bg-slate-100 hover:bg-emerald-50 active:scale-95 font-black text-base text-slate-800 flex items-center justify-center transition"
                            >
                              {k === 'BS' ? <Delete className="w-4 h-4 text-rose-500" /> : k}
                            </button>
                          )
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30 flex items-center justify-between text-left">
                      <div>
                        <p className="text-[11px] font-bold text-emerald-50">
                          今月あと使えるお金
                        </p>
                        <p className="text-2xl font-black text-white tabular-nums">
                          ¥{displayYen(remainingBudget)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-emerald-50">1日あたり目安</p>
                        <p className="text-sm font-black text-amber-200 tabular-nums">
                          ¥{displayYen(dailyAllowance)} / 日
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <button
                        onClick={() => navigateToTab('input')}
                        className="w-full py-3.5 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-900 font-black text-sm shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
                      >
                        <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                        <span>スマホで今すぐ収支を入力する</span>
                      </button>

                      <button
                        onClick={() => navigateToTab('home')}
                        className="w-full py-3 rounded-2xl bg-white/95 hover:bg-white text-emerald-700 font-extrabold text-xs shadow-md active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                      >
                        <PieChart className="w-4 h-4" />
                        <span>ダッシュボード＆グラフを見る</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-3xl bg-white border border-emerald-100 p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  スマホで快適に使う3つのポイント
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        片手3秒！親指テンキー＆直接入力対応
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        レジ前や移動中でも片手でサッと金額と費目をタップするだけ。収入・固定費・貯蓄もすべて入力できます。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        3種類のカラフルなグラフで自動可視化
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        「費目別ドーナツグラフ」「直近7日間の日別推移棒グラフ」「月間収支バランス」がリアルタイムに描かれます。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        安心の端末内保存＆プライバシー保護
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        家計データは外部サーバーへ送信されず、あなたのスマホ内にのみ保存されます。上の「👁️」ボタンで金額の目隠しや、4桁PINロックも設定可能です。
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ==================== TAB 1: HOME (DASHBOARD & CHARTS) ==================== */}
          {activeTab === 'home' && (
            <>
              {/* Sunny Hero Card: 今月あといくら使えるか */}
              <section className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white p-5 shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-8 -bottom-10 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-1 relative z-10">
                  <span className="text-xs font-bold text-emerald-50 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    今月あといくら使えるか
                  </span>
                  <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/30">
                    自由予算 ¥{displayYen(monthlyDisposableBudget)}
                  </span>
                </div>

                <div className="my-3 flex items-baseline gap-1 relative z-10">
                  <span className="text-2xl font-extrabold text-emerald-100">¥</span>
                  <span
                    className={`text-5xl font-black tracking-tight tabular-nums drop-shadow-sm ${
                      remainingBudget < 0 ? 'text-rose-200' : 'text-white'
                    }`}
                  >
                    {displayYen(remainingBudget)}
                  </span>
                </div>

                {extraIncomeTotal > 0 && (
                  <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-300/95 text-slate-900 text-[11px] font-extrabold shadow-sm">
                    <Gift className="w-3.5 h-3.5" />
                    副収入・臨時収入 +¥{displayYen(extraIncomeTotal)} プラス中！
                  </div>
                )}

                <div className="space-y-1.5 mt-2 relative z-10">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-50">
                      今月の変動費支出:{' '}
                      <strong className="text-white font-extrabold">
                        ¥{displayYen(totalMonthlySpent)}
                      </strong>
                    </span>
                    <span className="font-extrabold text-amber-200">
                      残り {Math.round(remainingRatio)}%
                    </span>
                  </div>

                  <div className="w-full h-4 bg-slate-900/25 rounded-full overflow-hidden p-0.5 border border-white/25">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        remainingBudget < 0
                          ? 'bg-rose-400'
                          : remainingRatio <= 25
                          ? 'bg-amber-300'
                          : 'bg-gradient-to-r from-amber-200 via-white to-emerald-100'
                      }`}
                      style={{
                        width: `${remainingBudget < 0 ? 100 : Math.max(4, remainingRatio)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/20 grid grid-cols-3 gap-2 text-center relative z-10">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                    <p className="text-[10px] text-emerald-50 font-medium">今月の総収入</p>
                    <p className="text-xs font-extrabold text-white mt-0.5 tabular-nums">
                      ¥{displayYen(totalMonthlyIncome)}
                    </p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                    <p className="text-[10px] text-emerald-50 font-medium">固定費+貯蓄</p>
                    <p className="text-xs font-extrabold text-white mt-0.5 tabular-nums">
                      -¥{displayYen(totalFixedCosts + effectiveSavingsTotal)}
                    </p>
                  </div>
                  <div className="bg-amber-300/95 rounded-2xl p-2 shadow-sm text-slate-900">
                    <p className="text-[10px] font-bold text-slate-700">1日あたり目安</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5 tabular-nums">
                      ¥{displayYen(dailyAllowance)}/日
                    </p>
                  </div>
                </div>
              </section>

              {/* ==================== INTERACTIVE VISUAL CHARTS SECTION ==================== */}
              <section className="rounded-3xl bg-white border border-emerald-100/90 p-4 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-500" />
                    家計の見える化グラフ
                  </h2>
                  {transactions.length === 0 && (
                    <button
                      onClick={handleLoadSampleData}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      サンプルでグラフを見る
                    </button>
                  )}
                </div>

                {/* 3 Chart Mode Switcher Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setChartMode('donut')}
                    className={`py-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                      chartMode === 'donut'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    費目別円グラフ
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('daily')}
                    className={`py-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                      chartMode === 'daily'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    7日間推移
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('balance')}
                    className={`py-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                      chartMode === 'balance'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    収支バランス
                  </button>
                </div>

                {/* CHART 1: DONUT CHART (費目別円グラフ) */}
                {chartMode === 'donut' && (
                  <div className="pt-1">
                    {totalMonthlySpent === 0 ? (
                      <div className="py-6 text-center space-y-2">
                        <div className="w-28 h-28 rounded-full border-[14px] border-slate-100 flex flex-col items-center justify-center mx-auto">
                          <span className="text-[10px] font-bold text-slate-400">今月の支出</span>
                          <span className="text-sm font-black text-slate-400">¥0</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium pt-1">
                          支出を入力するか「サンプルでグラフを見る」を押すとカラフルな円グラフが表示されます✨
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* SVG Donut */}
                        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
                            <circle
                              cx="70"
                              cy="70"
                              r="56"
                              fill="transparent"
                              stroke="#f1f5f9"
                              strokeWidth="20"
                            />
                            {donutSegments.map((seg) => {
                              const isSelected = selectedSliceId === seg.id;
                              return (
                                <circle
                                  key={seg.id}
                                  cx="70"
                                  cy="70"
                                  r={seg.radius}
                                  fill="transparent"
                                  stroke={seg.hex}
                                  strokeWidth={isSelected ? '24' : '20'}
                                  strokeDasharray={`${seg.strokeLength} ${seg.circumference}`}
                                  strokeDashoffset={seg.strokeOffset}
                                  className="transition-all duration-500 cursor-pointer"
                                  onClick={() =>
                                    setSelectedSliceId((prev) =>
                                      prev === seg.id ? null : seg.id
                                    )
                                  }
                                />
                              );
                            })}
                          </svg>
                          {/* Donut Center Label */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                            {selectedSliceId ? (
                              (() => {
                                const sel = categoryBreakdown.find(
                                  (c) => c.id === selectedSliceId
                                );
                                return sel ? (
                                  <>
                                    <span className="text-[10px] font-extrabold text-slate-500">
                                      {sel.label} ({sel.percent}%)
                                    </span>
                                    <span className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
                                      ¥{displayYen(sel.total)}
                                    </span>
                                  </>
                                ) : null;
                              })()
                            ) : (
                              <>
                                <span className="text-[10px] font-bold text-slate-400">
                                  変動費合計
                                </span>
                                <span className="text-base font-black text-slate-800 tabular-nums">
                                  ¥{displayYen(totalMonthlySpent)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Ranking Bars Legend */}
                        <div className="w-full flex-1 space-y-2">
                          {categoryBreakdown
                            .filter((c) => c.total > 0)
                            .sort((a, b) => b.total - a.total)
                            .map((cat) => (
                              <div
                                key={cat.id}
                                onClick={() =>
                                  setSelectedSliceId((prev) =>
                                    prev === cat.id ? null : cat.id
                                  )
                                }
                                className={`p-1.5 rounded-xl cursor-pointer transition ${
                                  selectedSliceId === cat.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: cat.hex }}
                                    />
                                    {cat.label}
                                  </span>
                                  <span className="font-extrabold text-slate-900 tabular-nums">
                                    ¥{displayYen(cat.total)}{' '}
                                    <span className="text-[10px] text-slate-400 font-bold">
                                      ({cat.percent}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.max(4, cat.percent)}%`,
                                      backgroundColor: cat.hex,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CHART 2: 7-DAY BAR CHART (直近7日間の日別支出推移グラフ) */}
                {chartMode === 'daily' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        1日あたり基準目安:{' '}
                        <strong className="text-emerald-600 font-extrabold">
                          約¥{displayYen(dailyTargetLine)}/日
                        </strong>
                      </span>
                      <span className="text-slate-600 font-bold">
                        7日間計: ¥{displayYen(last7DaysSpent)}
                      </span>
                    </div>

                    {/* Bar Chart Container */}
                    <div className="relative h-44 bg-slate-50/90 rounded-2xl border border-slate-100 pt-6 pb-2 px-3 flex items-end justify-between gap-2">
                      {/* Reference Dashed Line for Daily Standard */}
                      <div
                        className="absolute left-2 right-2 border-t-2 border-dashed border-emerald-400/80 pointer-events-none flex justify-end"
                        style={{
                          bottom: `${Math.min(
                            82,
                            Math.max(15, (dailyTargetLine / maxDailyChartVal) * 75 + 14)
                          )}%`,
                        }}
                      >
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded -mt-2.5">
                          目安 ¥{formatYen(dailyTargetLine)}
                        </span>
                      </div>

                      {last7DaysDailyData.map((day) => {
                        const heightPct =
                          day.amount > 0
                            ? Math.max(8, Math.round((day.amount / maxDailyChartVal) * 100))
                            : 4;
                        const isOverDaily = day.amount > dailyTargetLine;
                        return (
                          <div
                            key={day.dateStr}
                            className="flex-1 flex flex-col items-center h-full justify-end z-10"
                          >
                            <span className="text-[9px] font-extrabold text-slate-600 tabular-nums mb-1">
                              {day.amount > 0
                                ? security.privacyMask
                                  ? '•••'
                                  : `¥${formatYen(day.amount)}`
                                : '-'}
                            </span>
                            <div className="w-full max-w-[28px] h-28 flex items-end justify-center">
                              <div
                                className={`w-full rounded-t-xl transition-all duration-500 ${
                                  day.amount === 0
                                    ? 'bg-slate-200'
                                    : isOverDaily
                                    ? 'bg-gradient-to-t from-amber-500 to-rose-400 shadow-sm'
                                    : 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-sm'
                                }`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                            <div className="mt-1.5 text-center">
                              <p
                                className={`text-[10px] font-extrabold leading-none ${
                                  day.isToday ? 'text-emerald-600' : 'text-slate-600'
                                }`}
                              >
                                {day.isToday ? '今日' : day.shortLabel}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                ({day.weekday})
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CHART 3: MONTHLY CASHFLOW ALLOCATION (月間収支バランス構成グラフ) */}
                {chartMode === 'balance' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">
                        今月の総収入に対する配分バランス
                      </span>
                      <span className="font-black text-emerald-700 tabular-nums">
                        総収入 ¥{displayYen(totalMonthlyIncome)}
                      </span>
                    </div>

                    {/* Stacked Horizontal Bar */}
                    {(() => {
                      const base = Math.max(1, totalMonthlyIncome);
                      const fixedPct = Math.min(100, Math.round((totalFixedCosts / base) * 100));
                      const savingsPct = Math.min(
                        100 - fixedPct,
                        Math.round((effectiveSavingsTotal / base) * 100)
                      );
                      const spentPct = Math.min(
                        100 - fixedPct - savingsPct,
                        Math.round((totalMonthlySpent / base) * 100)
                      );
                      const remainPct = Math.max(0, 100 - fixedPct - savingsPct - spentPct);

                      return (
                        <>
                          <div className="w-full h-7 rounded-2xl overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200 gap-0.5">
                            {fixedPct > 0 && (
                              <div
                                style={{ width: `${fixedPct}%` }}
                                className="h-full bg-sky-500 first:rounded-l-xl last:rounded-r-xl flex items-center justify-center text-[10px] font-black text-white overflow-hidden"
                              >
                                {fixedPct >= 12 ? `${fixedPct}%` : ''}
                              </div>
                            )}
                            {savingsPct > 0 && (
                              <div
                                style={{ width: `${savingsPct}%` }}
                                className="h-full bg-amber-400 first:rounded-l-xl last:rounded-r-xl flex items-center justify-center text-[10px] font-black text-slate-900 overflow-hidden"
                              >
                                {savingsPct >= 10 ? `${savingsPct}%` : ''}
                              </div>
                            )}
                            {spentPct > 0 && (
                              <div
                                style={{ width: `${spentPct}%` }}
                                className="h-full bg-rose-500 first:rounded-l-xl last:rounded-r-xl flex items-center justify-center text-[10px] font-black text-white overflow-hidden"
                              >
                                {spentPct >= 10 ? `${spentPct}%` : ''}
                              </div>
                            )}
                            {remainPct > 0 && (
                              <div
                                style={{ width: `${remainPct}%` }}
                                className="h-full bg-emerald-400 first:rounded-l-xl last:rounded-r-xl flex items-center justify-center text-[10px] font-black text-slate-900 overflow-hidden"
                              >
                                {remainPct >= 10 ? `${remainPct}%` : ''}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                            <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                              <span className="font-bold text-sky-800 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                固定費 ({fixedPct}%)
                              </span>
                              <span className="font-extrabold text-sky-900 tabular-nums">
                                ¥{displayYen(totalFixedCosts)}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                貯蓄 ({savingsPct}%)
                              </span>
                              <span className="font-extrabold text-amber-900 tabular-nums">
                                ¥{displayYen(effectiveSavingsTotal)}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                              <span className="font-bold text-rose-800 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                変動費 ({spentPct}%)
                              </span>
                              <span className="font-extrabold text-rose-900 tabular-nums">
                                ¥{displayYen(totalMonthlySpent)}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                残高 ({remainPct}%)
                              </span>
                              <span className="font-extrabold text-emerald-900 tabular-nums">
                                ¥{displayYen(Math.max(0, remainingBudget))}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </section>

              {/* Weekly Pace Card: 直近7日間の利用額 vs 週基準予算（約1.8万円） */}
              <section className="rounded-3xl bg-white border border-emerald-100/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      {weeklyDiff >= 0 ? (
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-rose-500" />
                      )}
                      直近7日間の利用ペース
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      週基準予算（約1.8万円 = ¥{displayYen(weeklyStandardBudget)}）との比較
                    </p>
                  </div>

                  {last7DaysSpent > weeklyStandardBudget ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      使いすぎ注意
                    </span>
                  ) : last7DaysSpent > weeklyStandardBudget * 0.8 ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      あと少しで週予算
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      バッチリ順調✨
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-xs text-slate-500 mr-1.5">直近7日間:</span>
                    <span className="text-2xl font-black text-slate-800 tabular-nums">
                      ¥{displayYen(last7DaysSpent)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    週基準 <span className="font-bold text-slate-700">¥{displayYen(weeklyStandardBudget)}</span>
                  </div>
                </div>

                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      last7DaysSpent > weeklyStandardBudget
                        ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                        : last7DaysSpent > weeklyStandardBudget * 0.8
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    }`}
                    style={{ width: `${Math.max(3, weeklyRatio)}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  {weeklyDiff >= 0 ? (
                    <p className="text-emerald-700 font-bold">
                      週基準予算まであと <strong>¥{displayYen(weeklyDiff)}</strong> 余裕があります🌱
                    </p>
                  ) : (
                    <p className="text-rose-600 font-bold">
                      週基準予算を <strong>¥{displayYen(Math.abs(weeklyDiff))}</strong> オーバーしています
                    </p>
                  )}
                  <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                    {Math.round((last7DaysSpent / (weeklyStandardBudget || 1)) * 100)}%
                  </span>
                </div>
              </section>

              {/* Category Summary & Quick Action */}
              <section className="rounded-3xl bg-white border border-emerald-100/90 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800">
                      費目別クイック入力（タップで即記帳）
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      アイコンを押すとその費目ですぐに入力できます
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {categoryBreakdown.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setEntryType('expense');
                          setSelectedCategory(cat.id);
                          setActiveTab('input');
                        }}
                        className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 active:scale-95 transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-7 h-7 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center`}
                          >
                            <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{cat.percent}%</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-[11px] font-bold text-slate-700 truncate">{cat.label}</p>
                          <p className="text-xs font-extrabold text-slate-900 tabular-nums">
                            ¥{displayYen(cat.total)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* ==================== TAB 2: INPUT (ALL INCOME & EXPENSES) ==================== */}
          {activeTab === 'input' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-3 gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleSelectEntryType('expense')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                    entryType === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>日々の支出</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectEntryType('income')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                    entryType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>収入を入力</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectEntryType('fixed_savings')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                    entryType === 'fixed_savings'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>固定費・貯蓄</span>
                </button>
              </div>

              <div className="rounded-2xl bg-white border border-emerald-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
                <span className="text-xs font-bold text-slate-600">
                  {entryType === 'income' ? '🎉 入力後の使えるお金' : '💡 入力後の今月残金プレビュー'}
                </span>
                <span
                  className={`text-sm font-black tabular-nums ${
                    previewRemainingBudget < 0
                      ? 'text-rose-600'
                      : entryType === 'income'
                      ? 'text-emerald-600'
                      : 'text-teal-700'
                  }`}
                >
                  ¥{formatYen(previewRemainingBudget)}
                </span>
              </div>

              <div
                className={`rounded-3xl bg-white border-2 p-4 shadow-md transition ${
                  entryType === 'expense'
                    ? 'border-rose-300 shadow-rose-500/5'
                    : entryType === 'income'
                    ? 'border-emerald-300 shadow-emerald-500/5'
                    : 'border-sky-300 shadow-sky-500/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>
                    {entryType === 'expense'
                      ? '💸 支出金額（円）'
                      : entryType === 'income'
                      ? '💰 収入金額（円）'
                      : '🏠 固定費・貯蓄額（円）'}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="bg-transparent text-slate-700 font-bold text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-baseline justify-between my-1 gap-2">
                  <span
                    className={`text-2xl font-black shrink-0 ${
                      entryType === 'expense'
                        ? 'text-rose-500'
                        : entryType === 'income'
                        ? 'text-emerald-500'
                        : 'text-sky-500'
                    }`}
                  >
                    {entryType === 'income' ? '+¥' : '¥'}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value.slice(0, 7))}
                    placeholder="0"
                    className="w-full text-right text-4xl font-black tracking-tight text-slate-900 tabular-nums bg-transparent focus:outline-none placeholder-slate-300"
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                  {(entryType === 'expense'
                    ? [100, 300, 500, 1000]
                    : [1000, 5000, 10000, 30000]
                  ).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAddAmount(val)}
                      className="py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-xs font-extrabold text-amber-800 border border-amber-200 transition"
                    >
                      +{formatYen(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    {entryType === 'expense'
                      ? '支出の費目を選択'
                      : entryType === 'income'
                      ? '収入の種類を選択'
                      : '固定費・貯蓄の項目を選択（基本額が自動入力されます）'}
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {currentCategoryOptions.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`p-2.5 rounded-2xl border text-left transition flex flex-col items-center justify-center gap-1 active:scale-95 ${
                          isSelected
                            ? `${cat.bg} ${cat.border} ring-2 ring-emerald-500 shadow-md`
                            : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                        <span
                          className={`text-[11px] font-extrabold text-center leading-tight ${
                            isSelected ? 'text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder={
                    entryType === 'income'
                      ? 'メモ（例：10月分給与、メルカリ売上、臨時ボーナスなど）'
                      : entryType === 'fixed_savings'
                      ? 'メモ（例：10月電気・ガス代、先取り貯蓄など）'
                      : 'メモ（任意：スーパーまとめ買い、カフェ、ガソリンなど）'
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '00', 'BS'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className={`h-12 rounded-2xl font-extrabold text-lg active:scale-95 transition flex items-center justify-center shadow-sm ${
                      key === 'BS'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                        : 'bg-white hover:bg-emerald-50/50 text-slate-800 border border-slate-200/90'
                    }`}
                  >
                    {key === 'BS' ? <Delete className="w-5 h-5" /> : key}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleKeypadPress('C')}
                  className="px-4 py-3.5 rounded-2xl bg-slate-200/80 hover:bg-slate-200 text-slate-700 font-extrabold text-xs active:scale-95 transition"
                >
                  クリア
                </button>
                <button
                  type="button"
                  onClick={handleAddTransaction}
                  className={`flex-1 py-3.5 rounded-2xl text-white font-black text-base shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2 ${
                    entryType === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-500/25'
                      : entryType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-500 shadow-sky-500/25'
                  }`}
                >
                  <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    {entryType === 'expense'
                      ? '支出を楽しく記帳する✨'
                      : entryType === 'income'
                      ? '収入をプラス記帳する🎉'
                      : '固定費・貯蓄を記録する🏠'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: HISTORY ==================== */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-white border border-emerald-100 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800">すべての収支明細</h2>
                    <p className="text-xs text-slate-500">
                      金額やメモの編集・削除、固定費の一括登録もできます
                    </p>
                  </div>
                  <button
                    onClick={handleRegisterMonthlyBaseItems}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold transition active:scale-95 shrink-0"
                  >
                    + 今月の基本収支を一括登録
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-2">
                    <p className="text-[10px] font-bold text-emerald-700">今月の総収入</p>
                    <p className="text-xs font-black text-emerald-800 mt-0.5 tabular-nums">
                      +¥{displayYen(totalMonthlyIncome)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sky-50/70 border border-sky-100 p-2">
                    <p className="text-[10px] font-bold text-sky-700">固定費＋貯蓄</p>
                    <p className="text-xs font-black text-sky-800 mt-0.5 tabular-nums">
                      -¥{displayYen(totalFixedCosts + effectiveSavingsTotal)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-2">
                    <p className="text-[10px] font-bold text-rose-700">日々の支出計</p>
                    <p className="text-xs font-black text-rose-800 mt-0.5 tabular-nums">
                      -¥{displayYen(totalMonthlySpent)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: `すべて (${transactions.length})` },
                  { id: 'expense', label: '🛒 日々の支出' },
                  { id: 'income', label: '💰 収入' },
                  { id: 'fixed_savings', label: '🏠 固定費・貯蓄' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setFilterType(t.id);
                      setFilterCategory('all');
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shrink-0 transition ${
                      filterType === t.id
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="rounded-3xl bg-white border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-700">
                    まだ収支の記録がありません
                  </p>
                  <p className="text-xs text-slate-500">
                    「収支入力」タブから日々の支出や収入を記帳するか、サンプルデータで試せます✨
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('input')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      収支を入力する
                    </button>
                    <button
                      onClick={handleLoadSampleData}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold"
                    >
                      <Sparkles className="w-4 h-4" />
                      サンプルを入れる
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTransactions.map((item) => {
                    const cat = ALL_CATEGORY_MAP[item.category] || EXPENSE_CATEGORIES[8];
                    const Icon = cat.icon || MoreHorizontal;
                    const itemType = item.entryType || 'expense';
                    const isEditing = editingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white border border-slate-200/80 px-3.5 py-3 shadow-sm"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editMemo}
                                onChange={(e) => setEditMemo(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                                placeholder="メモ"
                              />
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-28 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-extrabold text-right text-slate-900 tabular-nums"
                              />
                            </div>
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> キャンセル
                              </button>
                              <button
                                onClick={() => saveEditTransaction(item)}
                                className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> 保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-2xl ${cat.bg} border ${cat.border} flex items-center justify-center shrink-0`}
                              >
                                <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-extrabold text-slate-800 truncate">
                                    {item.memo || cat.label}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${cat.bg} ${cat.text}`}
                                  >
                                    {cat.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5 tabular-nums">
                                  {item.date}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-base font-black tabular-nums mr-1 ${
                                  itemType === 'income'
                                    ? 'text-emerald-600'
                                    : itemType === 'fixed_savings'
                                    ? 'text-sky-600'
                                    : 'text-slate-800'
                                }`}
                              >
                                {itemType === 'income' ? '+' : '-'}¥{displayYen(item.amount)}
                              </span>
                              <button
                                onClick={() => startEditTransaction(item)}
                                aria-label="編集"
                                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200/80 transition active:scale-90"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(item.id)}
                                aria-label="削除"
                                className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200/80 transition active:scale-90"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 4: SETTINGS & SECURITY ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">
                    基本設定・セキュリティ
                  </h2>
                  <p className="text-xs text-slate-500">
                    収支の初期設定とパスコード保護・バックアップ
                  </p>
                </div>
                <button
                  onClick={handleResetSettings}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold flex items-center gap-1 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  初期値に戻す
                </button>
              </div>

              <div className="rounded-3xl bg-white border border-emerald-100 p-4 space-y-3.5 shadow-sm">
                <h3 className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  1. セキュリティ・データ保護設定
                </h3>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        {security.pinEnabled ? (
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        アプリ起動時の4桁PINロック
                      </p>
                      <p className="text-[11px] text-slate-500">
                        スマホを他人に貸した際の覗き見を防止します
                      </p>
                    </div>
                    {security.pinEnabled && (
                      <button
                        onClick={() => {
                          setSecurity((prev) => ({ ...prev, pinEnabled: false, pinCode: '' }));
                          setIsUnlocked(true);
                          showToast('🔓 PINロックを解除しました');
                        }}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200"
                      >
                        OFFにする
                      </button>
                    )}
                  </div>

                  {!security.pinEnabled && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={newPinDraft}
                        onChange={(e) =>
                          setNewPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        placeholder="4桁の数字 (例: 1234)"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPinDraft.length !== 4) {
                            showToast('⚠️ 4桁の数字を入力してください');
                            return;
                          }
                          setSecurity((prev) => ({
                            ...prev,
                            pinEnabled: true,
                            pinCode: newPinDraft,
                          }));
                          setIsUnlocked(true);
                          setNewPinDraft('');
                          showToast('🔒 4桁PINロックを設定しました！');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-extrabold shadow-sm active:scale-95 transition"
                      >
                        ロックを設定
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                  <p className="text-xs font-extrabold text-slate-800">
                    データのバックアップ（機種変更・キャッシュ消去対策）
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ブラウザ内のデータをファイルとしてスマホに保存・復元できます
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>書き出し保存</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ファイル復元</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-emerald-100 p-4 space-y-3.5 shadow-sm">
                <h3 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                  2. 月収・先取り貯蓄のベース設定
                </h3>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-500" />
                      基本の手取り月収
                    </span>
                    <span className="text-slate-400">初期値: 220,000円</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold">
                      ¥
                    </span>
                    <input
                      type="number"
                      value={settings.income}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          income: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold tabular-nums focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <PiggyBank className="w-4 h-4 text-amber-500" />
                      先取り貯蓄目標
                    </span>
                    <span className="text-slate-400">初期値: 30,000円</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold">
                      ¥
                    </span>
                    <input
                      type="number"
                      value={settings.savingsTarget}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          savingsTarget: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold tabular-nums focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-emerald-100 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-sky-600 uppercase tracking-wider">
                    3. 固定費内訳
                  </h3>
                  <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    計 ¥{formatYen(totalFixedCosts)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {FIXED_COST_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 min-w-[125px]">
                          <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          {item.label}
                        </label>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                            ¥
                          </span>
                          <input
                            type="number"
                            value={settings.fixedCosts[item.key]}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                fixedCosts: {
                                  ...prev.fixedCosts,
                                  [item.key]: Math.max(0, Number(e.target.value) || 0),
                                },
                              }))
                            }
                            className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-extrabold text-right tabular-nums focus:outline-none focus:border-emerald-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Mobile Native Tab Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 bg-white/95 backdrop-blur-lg border-t border-emerald-100 px-2 py-1.5 pb-safe shadow-lg shadow-slate-900/5">
          <div className="grid grid-cols-5 gap-1">
            {[
              { id: 'top', label: 'トップ', icon: LayoutGrid },
              { id: 'home', label: 'ホーム', icon: Home },
              { id: 'input', label: '収支入力', icon: PlusCircle },
              { id: 'history', label: '明細', icon: ListOrdered },
              { id: 'settings', label: '設定・保護', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateToTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition active:scale-95 ${
                    isActive
                      ? 'text-emerald-600 bg-emerald-50 font-extrabold'
                      : 'text-slate-400 hover:text-slate-600 font-semibold'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[10px] mt-0.5">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
