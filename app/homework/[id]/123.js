import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iktisilotcfvpnccljxe.supabase.co";
const supabaseKey = "ваш_ключ"; // Замените на ваш ключ
const supabase = createClient(supabaseUrl, supabaseKey);

const homeworkData = [
  { id: 1, title: "Задание 1", description: "Определите значение Z при X = 10 и Y = 20", task: "Вычислите Z, если Z = X + Y", path: "/homework/1" },
  { id: 2, title: "Задание 2", description: "Упростите математическое выражение.", task: "Решите: 5 + 5 - 204 / 120", path: "/homework/2" },
  { id: 3, title: "Задание 3", description: "Описание блока 3.", task: "Напишите функцию для нахождения факториала числа.", path: "/homework/3" },
  { id: 4, title: "Задание 4", description: "Описание блока 4.", task: "Решите квадратное уравнение ax^2 + bx + c = 0.", path: "/homework/4" },
  { id: 5, title: "Задание 5", description: "Описание блока 5.", task: "Напишите программу для проверки, является ли строка палиндромом.", path: "/homework/5" },
  { id: 6, title: "Задание 6", description: "Описание блока 6.", task: "Решите задачу на сортировку массива методом пузырька.", path: "/homework/6" }
];

async function migrateHomeworkData() {
  for (const task of homeworkData) {
    const { data, error } = await supabase.from("homework_tasks").insert(task);
    if (error) {
      console.error("Ошибка при добавлении задания:", error);
    } else {
      console.log("Добавлено задание:", data);
    }
  }
}

migrateHomeworkData();
