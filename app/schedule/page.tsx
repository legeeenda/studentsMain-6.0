"use client";

import { createClient } from "./supabase/client";
import { useEffect, useState } from "react";
import styles from "./schedule.module.css"; 

const supabase = createClient();

interface ScheduleItem {
  time: string;
  subject: string;
  description?: string; 
}

interface ScheduleData {
  [day: string]: ScheduleItem[];
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('schedule').select('*');
      
      if (error) {
        console.error("Ошибка при получении расписания:", error);
      } else {
        console.log("Полученные данные из БД:", data); // Проверка данных
        const groupedSchedule = data.reduce((acc: ScheduleData, item: any) => {
          const day = item.day.trim(); // Убираем пробелы
          if (!acc[day]) acc[day] = [];
          acc[day].push({ 
            time: item.time, 
            subject: item.subject,
            description: item.description 
          });
          return acc;
        }, {});
        console.log("Сгруппированные данные расписания:", groupedSchedule); // Проверка группировки
        setSchedule(groupedSchedule);
      }
      setIsLoading(false);
    };
    fetchSchedule();
  }, []);

  return (
    <div>
      <h1>Расписание студента</h1>
      {isLoading ? (
        <p>Загрузка расписания...</p>
      ) : (
        <div className={styles.scheduleContainer}>
          {["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"].map((day) => (
            <div key={day} className={styles.dayBlock}>
              <h2>{day}</h2>
              <ul>
                {schedule[day]?.length ? (
                  schedule[day].map((item, index) => (
                    <li key={index}>
                      <strong>{item.time}</strong> - {item.subject}
                      {item.description && <div>{item.description}</div>}
                    </li>
                  ))
                ) : (
                  <li>Нет занятий</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
