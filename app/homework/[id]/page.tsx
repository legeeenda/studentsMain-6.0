
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client"; // Укажите путь к вашему клиенту Supabase
import "../[id]/page.css";

const supabase = createClient();

export default function HomeworkTask() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [role, setRole] = useState(null);
  const [studentResponses, setStudentResponses] = useState([]);
  const [savedAnswer, setSavedAnswer] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("Пользователь не авторизован");
        router.push("/auth");
        return;
      }

      const userId = authData.user.id;
      const { data: roleData, error: roleError } = await supabase
        .from("students")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleError) {
        console.error("Ошибка получения роли пользователя:", roleError);
      } else {
        setRole(roleData?.role || "student");
      }
    };

    checkAuthAndRole();
  }, [router]);

  useEffect(() => {
    const fetchTaskAndResponses = async () => {
      setIsLoading(true);

      const { data: taskData, error: taskError } = await supabase
        .from("homework_tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (taskError) {
        console.error("Ошибка загрузки задания:", taskError);
      } else {
        setTask(taskData);
      }

      if (role === "student") {
        const { data: authData } = await supabase.auth.getUser();
        const { data: responseData, error: responseError } = await supabase
          .from("respon")
          .select("response, grade, calculated_points, status")
          .eq("task_id", id)
          .eq("user_id", authData.user.id)
          .single();

        if (responseError) {
          console.error("Ошибка загрузки ответа студента:", responseError);
        } else {
          setSavedAnswer(responseData?.response || null);
          setStudentResponses(responseData); // Сохраняем данные об оценке
        }
      } else if (role === "teacher") {
        const { data: responsesData, error: responsesError } = await supabase
          .from("respon")
          .select("user_id, response, grade, calculated_points, status")
          .eq("task_id", id);

        if (responsesError) {
          console.error("Ошибка загрузки ответов студентов:", responsesError);
        } else {
          const enrichedResponses = await Promise.all(
            responsesData.map(async (resp) => {
              const { data: studentData } = await supabase
                .from("students")
                .select("name")
                .eq("user_id", resp.user_id)
                .single();

              return {
                ...resp,
                name: studentData?.name || "Неизвестно",
              };
            })
          );
          setStudentResponses(enrichedResponses);
        }
      }

      setIsLoading(false);
    };

    fetchTaskAndResponses();
  }, [id, role]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Введите ваш ответ.");
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error("Пользователь не авторизован:", authError);
      return;
    }

    const userId = authData.user.id;

    const { data: existingResponse, error: fetchError } = await supabase
      .from("respon")
      .select("*")
      .eq("user_id", userId)
      .eq("task_id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Ошибка проверки существующего ответа:", fetchError);
      return;
    }

    let saveError;

    if (existingResponse) {
      const { error } = await supabase
        .from("respon")
        .update({ response: answer, status: "Ожидание проверки" })
        .eq("user_id", userId)
        .eq("task_id", id);
      saveError = error;
    } else {
      const { error } = await supabase
        .from("respon")
        .insert({
          user_id: userId,
          task_id: id,
          response: answer,
          status: "Ожидание проверки",
        });
      saveError = error;
    }

    if (saveError) {
      console.error("Ошибка сохранения ответа:", saveError);
    } else {
      setSavedAnswer(answer);
      console.log("Ваш ответ успешно сохранен и ожидает проверки!");
    }
  };

  const handleGradeSubmit = async (userId, grade) => {
    if (grade < 2 || grade > 5) {
      alert("Оценка должна быть от 2 до 5.");
      return;
    }

    const points = Math.round((task.points / 5) * grade);

    const { error } = await supabase
      .from("respon")
      .update({ grade, calculated_points: points, status: "Сдано" })
      .eq("user_id", userId)
      .eq("task_id", id);

    if (error) {
      console.error("Ошибка сохранения оценки:", error);
    } else {
      alert("Оценка успешно сохранена!");

      setStudentResponses((prevResponses) =>
        prevResponses.map((resp) =>
          resp.user_id === userId
            ? { ...resp, grade, calculated_points: points, status: "Сдано" }
            : resp
        )
      );
    }
  };

  if (isLoading || !task) return <p>Загрузка задания...</p>;

  return (
    <div className="homework-container">
      <h1>{task.title}</h1>
      <button onClick={() => router.push("/Task")} className="redirect-button">
        Вернуться к заданиям
      </button>
      <p>{task.description}</p>
      <h3>Задание:</h3>
      <p>{task.task}</p>
      <p>
        <strong>Баллы за задание:</strong> {task.points || 0}
      </p>
      {role === "student" ? (
        <div>
          {savedAnswer ? (
            <>
              <p>
                <strong>Ваш ответ:</strong> {savedAnswer}
              </p>
              <p>
                <strong>Статус:</strong>{" "}
                {studentResponses?.status === "Сдано"
                  ? "Сдано"
                  : "Ожидание проверки"}
              </p>
              {studentResponses?.grade ? (
                <>
                  <p>
                    <strong>Оценка:</strong> {studentResponses.grade}
                  </p>
                  <p>
                    <strong>Баллы:</strong>{" "}
                    {studentResponses.calculated_points}
                  </p>
                </>
              ) : (
                <p>Ожидается оценка</p>
              )}
            </>
          ) : (
            <div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Введите ваш ответ"
              />
              <button onClick={handleSubmitAnswer}>Отправить ответ</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Ответы студентов:</h3>
          <table>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Ответ</th>
                <th>Оценка</th>
                <th>Баллы</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {studentResponses.map((resp) => (
                <tr key={resp.user_id}>
                  <td>{resp.name}</td>
                  <td>{resp.response}</td>
                  <td>
                    {resp.grade !== null ? (
                      `Оценено: ${resp.grade}`
                    ) : (
                      <input
                        type="number"
                        min="2"
                        max="5"
                        onBlur={(e) =>
                          handleGradeSubmit(
                            resp.user_id,
                            parseInt(e.target.value, 10)
                          )
                        }
                        placeholder="Оценка"
                      />
                    )}
                  </td>
                  <td>{resp.calculated_points || "—"}</td>
                  <td>{resp.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
