"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client"; // Укажите путь к вашему клиенту Supabase
import "../[id]/page.css";
const supabase = createClient();

export default function HomeworkTask() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answer, setAnswer] = useState(""); // Ответ пользователя
  const [status, setStatus] = useState("Не сдано"); // Статус задания
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("Пользователь не авторизован");
        router.push("/auth"); // Перенаправление на страницу входа
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("homework_tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Ошибка загрузки задания:", error);
      } else {
        setTask(data);
      }
      setLoading(false);
    };

    const checkCompletion = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("Ошибка получения данных пользователя:", authError);
        return;
      }
      const userId = authData.user.id;

      const { data, error } = await supabase
        .from("homework_progress")
        .select("completed")
        .eq("user_id", userId)
        .eq("task_id", id);

      if (error) {
        console.error("Ошибка проверки выполнения:", error);
      } else if (data?.length > 0 && data[0].completed) {
        setIsCompleted(true);
        setStatus("Сдано");
      }
    };

    fetchTask();
    checkCompletion();
  }, [id]);

  const updateScores = async (userId, points) => {
    const { data, error } = await supabase
      .from("students")
      .select("scores")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Ошибка получения текущих баллов:", error);
      return;
    }

    const newScores = (data?.scores || 0) + points;

    const { error: updateError } = await supabase
      .from("students")
      .update({ scores: newScores })
      .eq("user_id", userId);

    if (updateError) {
      console.error("", updateError);
    } else {
      console.log(`Баллы успешно обновлены: ${newScores}`);
    }
  };

  const handleCompleteTask = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error("Ошибка получения данных пользователя:", authError);
      return;
    }
    const userId = authData.user.id;

    const { error } = await supabase
      .from("homework_progress")
      .upsert({ user_id: userId, task_id: id, completed: true });

    if (error) {
      console.error("Ошибка обновления статуса:", error);
    } else {
      setIsCompleted(true);
      setStatus("Сдано");
      if (task?.points) await updateScores(userId, task.points);
    }
  };

  const handleNextTask = async () => {
    const { data, error } = await supabase
      .from("homework_tasks")
      .select("id")
      .gt("id", id)
      .order("id", { ascending: true })
      .limit(1);

    if (error) {
      console.error("Ошибка загрузки следующего задания:", error);
    } else if (data?.length > 0) {
      router.push(`/homework/${data[0].id}`);
    } else {
      alert("Это было последнее задание!");
    }
  };

  if (loading || !task) return <p>Загрузка задания...</p>;

  return (
    <div className="homework-container">
      <h1>{task.title}</h1>
      <p>{task.description}</p>
      <h3>Задание:</h3>
      <p>{task.task}</p>
      <p className="status"> {}</p>
      {!isCompleted && (
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ваш ответ"
          />
          <button onClick={handleCompleteTask}>Завершить задание</button>
        </div>
      )}
      {isCompleted && (
        <div>
          <p>Задание выполнено!</p>
          <button onClick={handleNextTask}>Перейти к следующему заданию</button>
        </div>
      )}
    </div>
  );
}
