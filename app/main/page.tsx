"use client";
import { createClient } from "../../utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../main/TestPage.css";


export default function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true); // Добавляем состояние загрузки
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Получаем данные текущего пользователя (студента)
        const fetchStudentData = async () => {
            const { data: user, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error("Ошибка при получении пользователя:", userError);
                router.push("/auth");
                return;
            }

            if (user && user.user) {
                const { data, error } = await supabase
                    .from("students") // Проверь, что таблица "students" действительно существует
                    .select("*")
                    .eq("user_id", user.user.id)
                    .maybeSingle(); // Используем maybeSingle для безопасного получения данных

                if (error) {
                    console.error("Ошибка при получении данных студента:", error);
                } else if (!data) {
                    console.log("Данные студента не найдены.");
                } else {
                    setStudent(data); // Устанавливаем данные студента
                }
            } else {
                // Перенаправление на страницу входа, если пользователь не авторизован
                router.push("/auth");
            }

            setLoading(false); // Останавливаем состояние загрузки
        };

        fetchStudentData();
    }, []);

    if (loading) {
        return <p>Loading...</p>; // Пока данные загружаются
    }

    if (!student) {
        return <p>Данные студента не найдены</p>; // Если данных студента нет
    }
    

    return (
      <div className="dashboard-container">
          {/* Верхний правый угол: Аватар и имя */}
          <div className="header">
            <div className="namecomp">
              <h1>НАЗВАНИЕ ПРОЕКТА. THE LEGEEENDSSSS</h1>
            </div>
              <div className="user-info">
                  <img className="avatar"  alt="" />
                  <span className="student-name">{student.name}</span>
              </div>
          </div>

          <div className="main-content">
              {}
              <div className="left-menu">
                  <ul>
                      <li><a href="Task">Домашние задания</a></li>
                      <li><a href="schedule">Расписание студента</a></li>
                      <li><a href="edu">Программа Обучения</a></li>
                      <li><a href="stats">Статистика студентов</a></li>
                  </ul>
              </div>

              {}
              <div className="right-content">
                  <h2>Мои курсы</h2>
                  <div className="course-grid">
                      {Array(8).fill(0).map((_, index) => (
                          <div className="course-card" key={index}>
                              <h3>Основы Git и GitHub</h3>
                              <p>Введение в систему контроля версий</p>
                              <p>6 вводных уроков</p>
                              <button>Открыть</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
}
