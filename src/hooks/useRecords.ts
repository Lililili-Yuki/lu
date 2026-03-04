import { useState, useEffect, useCallback } from 'react';
import type { DeerRecord, DayData, MonthlyStats } from '@/types';

const STORAGE_KEY = 'deer-records';

export function useRecords() {
  const [records, setRecords] = useState<DeerRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load records from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecords(parsed);
      } catch (e) {
        console.error('Failed to parse records:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }, [records, isLoaded]);

  const addRecord = useCallback((record: Omit<DeerRecord, 'id'>) => {
    const newRecord: DeerRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setRecords((prev) => [...prev, newRecord]);
    return newRecord;
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<DeerRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getRecordsByDate = useCallback(
    (date: string): DeerRecord[] => {
      return records.filter((r) => r.date === date);
    },
    [records]
  );

  const getDayData = useCallback(
    (date: string): DayData => {
      const dayRecords = records.filter((r) => r.date === date);
      return {
        date,
        records: dayRecords,
        totalDuration: dayRecords.reduce((sum, r) => sum + r.duration, 0),
      };
    },
    [records]
  );

  const getMonthlyStats = useCallback(
    (year: number, month: number): MonthlyStats => {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const monthRecords = records.filter((r) => r.date.startsWith(monthStr));
      
      const totalCount = monthRecords.length;
      const totalDuration = monthRecords.reduce((sum, r) => sum + r.duration, 0);
      
      // Get unique days in the month with records
      const daysWithRecords = new Set(monthRecords.map((r) => r.date)).size;
      
      return {
        month: monthStr,
        totalCount,
        totalDuration,
        averageDuration: totalCount > 0 ? totalDuration / totalCount : 0,
        dailyAverage: daysWithRecords > 0 ? totalCount / daysWithRecords : 0,
      };
    },
    [records]
  );

  const getAllTimeStats = useCallback(() => {
    const totalCount = records.length;
    const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
    const daysWithRecords = new Set(records.map((r) => r.date)).size;
    
    return {
      totalCount,
      totalDuration,
      averageDuration: totalCount > 0 ? totalDuration / totalCount : 0,
      daysWithRecords,
    };
  }, [records]);

  return {
    records,
    isLoaded,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordsByDate,
    getDayData,
    getMonthlyStats,
    getAllTimeStats,
  };
}
