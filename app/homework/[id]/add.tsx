"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

const supabase = createClient();

export default function AddHomework() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(0);
  const [deadline, setDeadline] = useState("");
  const router = useRouter();

  const handleAddTask = async () => {
    const { data, error } = await supabase.from("homework_tasks").insert([
      {
        title,
        description,
        points,
        deadline,
      },
    ]);

    if (error) {
      console.error("Ошибка добавления задания:", error);
    } else {
      alert("Задание успешно добавлено!");
      router.push("/homework");
    }
  };

  return (
    <div className="add-task-container">
      <h1>Добавить новое задание</h1>
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
      <button onClick={handleAddTask}>Добавить задание</button>
    </div>
  );
}
