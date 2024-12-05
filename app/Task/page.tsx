
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
  const [completedStatuses, setCompletedStatuses] = useState<Record<number, string>>({});
  const [isTeacher, setIsTeacher] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTasksAndStatuses = async () => {
      const { data: tasksData, error: tasksError } = await supabase
        .from("homework_tasks")
        .select("*");

      if (tasksError) {
        console.error("Ошибка получения заданий:", tasksError);
        return;
      }

      setTasks(tasksData || []);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("Ошибка получения данных пользователя:", authError);
        return;
      }

      const userId = authData.user.id;

      const { data: statusesData, error: statusesError } = await supabase
        .from("respon")
        .select("task_id, status, grade")
        .eq("user_id", userId);

      if (statusesError) {
        console.error("Ошибка получения статусов заданий:", statusesError);
        return;
      }

      const now = new Date();
      const statuses: Record<number, string> = {};
      tasksData.forEach((task) => {
        const response = statusesData?.find((res) => res.task_id === task.id);
        if (response?.status === "Сдано") {
          statuses[task.id] = response.grade
            ? `Оценено: ${response.grade}`
            : "Сдано";
        } else if (response?.status === "Ожидание проверки") {
          statuses[task.id] = "Ожидание проверки";
        } else if (new Date(task.deadline) < now) {
          statuses[task.id] = "Просрочено";
        } else {
          statuses[task.id] = "Не сдано";
        }
      });

      setCompletedStatuses(statuses);
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

    fetchTasksAndStatuses();
    fetchRole();
  }, []);

  const handleAddTask = async (newTask: Task) => {
    const { data, error } = await supabase.from("homework_tasks").insert([newTask]);
    if (error) {
      console.error("Ошибка добавления задания:", error);
    } else {
      setTasks((prevTasks) => [...prevTasks, newTask]);
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
      <button
        className="redirect-button"
        onClick={() => router.push("/main")}
      >
        Вернуться на главную
      </button>
      {showAddForm && <AddTaskForm onAddTask={handleAddTask} />}
      <div className="task-list">
        {tasks.length === 0 ? (
          <p>Заданий пока нет!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${
                completedStatuses[task.id]?.startsWith("Сдано") ? "completed" : ""
              }`}
            >
              <h2>{task.title}</h2>
              <p>{task.description}</p>
              <p>Баллы: {task.points}</p>
              <p>Дедлайн: {new Date(task.deadline).toLocaleString()}</p>
              <p className="status">Статус: {completedStatuses[task.id]}</p>
              <button
                onClick={() => router.push(`/homework/${task.id}`)}
                className="task-button"
              >
                {completedStatuses[task.id]?.startsWith("Сдано")
                  ? "Просмотреть"
                  : "Выполнить"}
              </button>
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
      task: taskContent,
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


