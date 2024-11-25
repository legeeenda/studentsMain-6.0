"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import "../Task/homework.css"; // Подключение CSS
const supabase = createClient();

interface Task {
  id?: number;
  title: string;
  description: string;
  points: number;
  deadline: string;
}

export default function HomeworkList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: tasksData, error } = await supabase
        .from("homework_tasks")
        .select("*");

      if (error) {
        console.error("Ошибка получения заданий:", error);
      } else {
        setTasks(tasksData || []);
      }
    };

    const fetchCompletedTasks = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("Ошибка получения данных пользователя:", authError);
        return;
      }

      const userId = authData.user.id;

      const { data: completedData, error: completedError } = await supabase
        .from("homework_progress")
        .select("task_id")
        .eq("user_id", userId)
        .eq("completed", true);

      if (completedError) {
        console.error("Ошибка получения выполненных заданий:", completedError);
      } else {
        setCompletedTasks(completedData?.map((item) => item.task_id) || []);
      }
    };

    const fetchRole = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("Ошибка получения данных пользователя:", authError);
        return;
      }

      const userId = authData.user.id;

      const { data, error } = await supabase
        .from("students")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Ошибка получения роли пользователя:", error);
      } else {
        setIsTeacher(data?.role === "teacher");
      }
    };

    fetchTasks();
    fetchCompletedTasks();
    fetchRole();
  }, []);

  const isTaskExpired = (deadline: string): boolean => {
    const now = new Date();
    return new Date(deadline) < now;
  };

  const handleAddTask = async (newTask: Task) => {
    const { data, error } = await supabase
      .from("homework_tasks")
      .insert([newTask]);
  
    if (error) {
      console.error("Ошибка добавления задания:", error);
    } else {
      setTasks((prevTasks) => [...prevTasks, ...data]);
      setShowAddForm(false);
    }
  };
  

  return (
    <div className="homework-container">
      <h1>Список домашних заданий</h1>
      {isTeacher && (
        <button
          className="add-task-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Отменить" : "Добавить задание"}
        </button>
      )}
      {showAddForm && <AddTaskForm onAddTask={handleAddTask} />}
      <div className="task-list">
      {tasks.length === 0 ? (
        <p>Заданий пока нет!</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card ${
              completedTasks.includes(task.id) ? "completed" : ""
            }`}
          >
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>Баллы: {task.points}</p>
            <p>Дедлайн: {new Date(task.deadline).toLocaleString()}</p>
            <p className="status">
              Статус:{" "}
              {completedTasks.includes(task.id)
                ? "Сдано"
                : isTaskExpired(task.deadline)
                ? "Просрочено"
                : "Не сдано"}
            </p>
            {isTaskExpired(task.deadline) && !completedTasks.includes(task.id) ? (
              <p style={{ color: "red" }}>Задание просрочено</p>
            ) : (
              <button
                onClick={() => router.push(`/homework/${task.id}`)}
                className="task-button"
              >
                {completedTasks.includes(task.id) ? "Просмотреть" : "Выполнить"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
    </div>
  );
}

function AddTaskForm({ onAddTask }: { onAddTask: (task: Task) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskContent, setTaskContent] = useState(""); 
  const [points, setPoints] = useState(0);
  const [deadline, setDeadline] = useState("");

  const handleSubmit = () => {
    if (!title || !taskContent || !deadline) {
      alert("Пожалуйста, заполните все обязательные поля!");
      return;
    }

    const newTask: Task = {
      title,
      description,
      points,
      deadline,
      task: taskContent, // Передача текста задания
    };
    onAddTask(newTask);
  };

  return (
    <div className="add-task-form">
      <h2>Добавить новое задание</h2>
      <input
        type="text"
        placeholder="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <textarea
        placeholder="Текст задания"
        value={taskContent}
        onChange={(e) => setTaskContent(e.target.value)}
      />
      <input
        type="number"
        placeholder="Баллы"
        value={points}
        onChange={(e) => setPoints(Number(e.target.value))}
      />
      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <button onClick={handleSubmit}>Добавить</button>
    </div>
  );
}