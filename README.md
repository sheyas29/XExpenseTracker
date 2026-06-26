# XExpense Tracker

A premium, glassmorphic personal finance dashboard built with React. This application allows users to effortlessly track their income and expenses, providing visual insights into their spending habits through interactive charts.

This project was built to meet specific End-to-End (E2E) assessment constraints while delivering a state-of-the-art UI/UX.

## ✨ Features

- **Wallet Management**: Track your total balance with real-time updates. Prevent overspending with built-in validation.
- **Expense Tracking**: Add, edit, and delete expenses categorized by Food, Travel, Entertainment, Shopping, Utilities, and more.
- **Visual Analytics**: Interactive pie and bar charts powered by Recharts provide immediate insights into spending distribution and trends.
- **Data Persistence**: All transactions and wallet balances are automatically saved to `localStorage`, ensuring your data remains intact across sessions.
- **Premium UI/UX**: 
  - Glassmorphic design with a dark theme.
  - Smooth micro-animations and hover effects.
  - Custom scrollbars, sticky headers, and responsive layouts.
  - Material-UI (MUI) modal dialogs with gradient accents and backdrop blur.
- **Pagination**: Browse transaction history easily with built-in pagination (5 items per page).
- **Notifications**: Toast notifications (via `notistack`) provide immediate feedback for all user actions.

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System)
- **Components & Icons**: [@mui/material](https://mui.com/) & [@mui/icons-material](https://mui.com/components/material-icons/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [notistack](https://iamhosseindhv.com/notistack)
- **Font**: [Inter](https://fonts.google.com/specimen/Inter)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd XExpenseTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create a production-ready build, run:
```bash
npm run build
```
The optimized files will be generated in the `dist` directory.

## 📋 Assessment Compatibility

This project strictly adheres to specific E2E test requirements:
- Exact `<h1>` text match ("Expense Tracker").
- Specific button text matches (`+ Add Income`, `+ Add Expense`).
- Proper form `<input>` name attributes (`title`, `price`, `category`, `date`).
- Correct button types (`type="button"` for triggers, `type="submit"` for forms).
- Persistent state exactly mapped to `localStorage` keys `balance` and `expenses`.

## 🤝 Contributing

Feel free to fork this project and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
