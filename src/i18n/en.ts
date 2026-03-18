export default {
    // General
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    error: 'Error',
    success: 'Success',
    date: 'Date',
    description: 'Description',
    amount: 'Amount',
    category: 'Category',

    // Navigation
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    stats: 'Stats',
    debts: 'Debts',
    settings: 'Settings',
    addTransaction: 'Add Transaction',
    transactionDetail: 'Transaction Detail',
    addDebt: 'Add Debt/Receivable',
    reminders: 'Bill Reminders',

    // Transaction Types
    income: 'Income',
    expense: 'Expense',
    debt: 'Debt',
    receivable: 'Receivable',

    // Add Transaction Screen
    installment: 'Installment',
    installmentCount: 'Number of Installments',
    descriptionOptional: 'Description (Optional)',
    amountRequired: 'Amount is required',
    validAmountRequired: 'Please enter a valid amount',
    categoryRequired: 'Please select a category',
    minInstallment: 'Number of installments must be at least 2',
    saveSuccess: '%{type} added successfully',
    saveError: 'An error occurred while saving the transaction',

    // Dashboard
    welcome: 'Welcome,',
    upcomingPayments: 'Upcoming Payments',
    viewAll: 'All',
    noUpcomingPayments: 'No upcoming payments.',
    day: 'DAY',
    everyMonthDay: 'Every %{day}th of the month',
    netBalance: 'Net Balance',
    todaysSpending: "Today's Spending",
    recentTransactions: 'Recent Transactions',
    seeAll: 'See All',
    noTransactionsYet: 'No transactions yet.',

    // Transactions
    search: 'Search...',
    all: 'All',
    noTransactionsFound: 'No transactions found.',

    // Categories
    salary: 'Salary',
    extraIncome: 'Extra Income',
    investment: 'Investment',
    gift: 'Gift',
    otherIncome: 'Other Income',

    market: 'Groceries',
    bills: 'Bills',
    rent: 'Rent',
    transport: 'Transport',
    health: 'Health',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    education: 'Education',
    tech: 'Technology',
    otherExpense: 'Other Expense',

    // Legacy Categories
    food: 'Food',
    bill: 'Bill',
    clothing: 'Clothing',
    technology: 'Technology',
    other: 'Other',

    // Settings
    dataManagement: 'Data Management',
    exportExcel: 'Download as Excel',
    exportExcelDesc: 'Export all data in .xlsx format',
    general: 'General',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark color theme',
    notifications: 'Notifications',
    aboutApp: 'About App',
    version: 'Version',
    privacyPolicy: 'Privacy Policy',
    footerLove: 'Made with ❤️ for Your Financial Freedom',
    exportSuccessTitle: 'Success',
    exportSuccessMessage: 'Data exported successfully.',
    exportErrorTitle: 'Error',
    exportErrorMessage: 'An error occurred during export.',

    // Stats & Data
    createBackup: 'Create Backup (JSON)',
    createBackupDesc: 'Export all data in JSON format',
    restoreBackup: 'Restore Backup',
    restoreBackupDesc: 'Import data from a JSON file',
    analysis: 'Analysis',
    monthly: 'Monthly',
    daily: 'Daily',
    expenses: 'Expenses',
    incomes: 'Incomes',
    last30Days: 'Last 30 Days Spending',
    noData: 'No data found.',
    restoreConfirmTitle: 'Restore Data',
    restoreConfirmMessage: 'All current data will be deleted and replaced with backup data. Do you want to continue?',
    continue: 'Continue',
    restoreSuccess: 'Data restored successfully ✓',
    backupSuccess: 'Backup created successfully ✓',
    financialStatus: 'Financial Status',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    totalDebt: 'Total Debt',
    payment: 'Payment',
    info: 'Info',

    // Debts
    myDebts: 'My Debts',
    debtsDesc: 'Debts you need to pay',
    noDebts: 'No debts yet',
    addDebtAction: 'Add Debt',
    addDebtHint: 'Press + to add',
    dueDate: 'Due: %{date}',
    personNameRequired: 'Person/Company name is required',
    personNameLabel: 'Person/Company I Owe',
    dueDateLabel: 'Due Date: %{date}',
    debtAddError: 'An error occurred while adding the debt',
    paid: 'Paid',
    waiting: 'Pending',
    remaining: 'remaining',
    addPayment: 'Add Payment',
    paymentAmount: 'Payment Amount',
    currentDebt: 'Remaining Debt',

    // Reminders
    remindersTitle: 'Bill Reminders',
    remindersDesc: 'Track your recurring payments',
    noReminders: 'No reminders yet',
    addReminderHint: 'Press + to add',
    newReminder: 'New Reminder',
    reminderTitlePlaceholder: 'Title (e.g. Electricity Bill)',
    dayOfMonthPlaceholder: 'Day of Month (1-31)',
    reminderDate: 'Reminder Date',
    reminderTime: 'Reminder Time',
    add: 'Add',
    deleteReminderTitle: 'Delete Reminder',
    deleteReminderMessage: 'Are you sure you want to delete this reminder?',
    reminderAdded: 'Reminder added!',
    reminderDeleted: 'Reminder deleted',
    reminderAddError: 'An error occurred while adding the reminder.',
    warning: 'Warning',
    fillAllFields: 'Please fill in all fields.',
    daysLeft: '%{days} days left',
    today: 'Today!',

    // Transaction Detail
    editTransaction: 'Edit Transaction',
    transactionUpdated: 'Transaction updated',
    updateError: 'An error occurred during update',
    deleteTransactionMessage: 'Are you sure you want to delete this transaction?',
    noDescription: 'No description',
    deleteTransaction: 'Delete Transaction',
    transactionDeleted: 'Transaction deleted',

    // Notifications
    notificationPermissionError: 'Notification permission denied',
    notificationTitle: 'Bill Reminder 🔔',
    notificationBody: 'Time to pay %{title}! Amount: %{amount}₺',

    // Statistics
    statistics: 'Statistics',
    ratio: 'Ratio',
    dailyAverage: 'Daily Avg.',
    spending: 'Spending',

    // Missing keys used in SettingsScreen
    restoreConfirm: 'All current data will be deleted and replaced with backup data. Do you want to continue?',
    yes: 'Yes',

    // Validation
    invalidDay: 'Day must be between 1-31',
    setReminder: 'Set Reminder',

    // Onboarding
    onboardingTitle1: 'Welcome to Your\nFinancial Freedom',
    onboardingDesc1: 'Easily track your income, expenses, and debts',
    onboardingTitle2: 'Analyze Your\nSpending',
    onboardingDesc2: 'See your financial status with charts and reports',
    onboardingTitle3: 'Never Miss\nYour Payments',
    onboardingDesc3: 'Pay on time with bill reminders',
    skip: 'Skip',
    next: 'Next',
    start: 'Start',
    permissionRequired: 'Notification Permission Required ⚠️',
    permissionDesc: 'Notification permission is required for the app to work properly and for you to receive bill reminders on time.',
    grantPermission: 'Grant Permission',
    permissionDeniedTitle: 'Permission Required',
    permissionDeniedMessage: 'You cannot continue without granting notification permission. Please enable it in settings.',
    goToSettings: 'Go to Settings',
    tryAgain: 'Try Again',
    thankYou: 'Thank You! 🎉',
    letsKnowYou: 'Let Us Know You',
    yourName: 'Your Name',
    enterYourName: 'Enter your name',
    welcomeUser: 'Welcome, %{name}! 👋',
    genericError: 'Something went wrong. Please try again.',

    // ErrorBoundary
    errorOccurred: 'An Error Occurred',
    errorMessage: 'Sorry, an unexpected error occurred. Please restart the app.',
    retry: 'Try Again',

    // Stats
    totalShort: 'Tot.',

    // Backup errors
    backupError: 'Backup creation error',
    dataLoadError: 'Error loading data',
    restoreFailed: 'Restore failed.',

    // Quick Reminder (Dashboard)
    quickReminder: 'Add Bill Reminder',
    quickReminderDesc: 'Set an alarm for the due date',
    billName: 'Bill Name',
    alarmTime: 'Alarm Time',
    titleRequired: 'Title is required',
    reminderSaved: 'Reminder saved! 🔔',

    // Notifications toggle
    notificationsEnabled: 'Notifications enabled',
    notificationPermissionDenied: 'Notification permission denied',
    notificationsDisabled: 'Notifications disabled',
    receivables: 'Receivables',

    // Daily Notifications
    dailyMorningTitle: 'Good Morning! ☀️',
    dailyMorningBody: 'Watch your spending today! Keep your budget under control. 💰',
    dailyNoonTitle: 'Noon Reminder 📊',
    dailyNoonBody: 'Don\'t forget to check today\'s expenses! Open the app and see your status.',
    dailyEveningTitle: 'Daily Summary 🎯',
    dailyEveningBody: 'Review today\'s spending and plan for tomorrow! 📈',

    // Tags
    tags: 'Tags',
    noTags: 'No tags',

    // Date Grouping
    dateGroupToday: 'Today',
    dateGroupYesterday: 'Yesterday',
    dateGroupThisWeek: 'This Week',
    dateGroupThisMonth: 'This Month',
    dateGroupOlder: 'Older',

    // Intro Animation
    appName: 'MY FINANCE',
    appTagline: 'Premium Finance Tracker',

    // Debts & Delete
    deleteDebtTitle: 'Delete Debt',
    deleteDebtMessage: 'Are you sure you want to delete this record?',
};
