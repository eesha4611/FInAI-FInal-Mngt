import React, { createContext, useState, useContext } from "react";

type FilterContextType = {
  selectedMonth: number | null;
  selectedYear: number | null;
  setSelectedMonth: (month: number | null) => void;
  setSelectedYear: (year: number | null) => void;
};

const ExpenseFilterContext = createContext<FilterContextType | undefined>(undefined);

export const ExpenseFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());

  return (
    <ExpenseFilterContext.Provider
      value={{ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }}
    >
      {children}
    </ExpenseFilterContext.Provider>
  );
};

export const useExpenseFilter = () => {
  const context = useContext(ExpenseFilterContext);
  if (!context) {
    throw new Error("useExpenseFilter must be used inside ExpenseFilterProvider");
  }
  return context;
};
