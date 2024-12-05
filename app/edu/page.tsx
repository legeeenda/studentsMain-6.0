"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

import Head from "next/head";
import "../edu/styl/style.css";

const supabase = createClient();

export default function Home() {
  const [studyPlan, setStudyPlan] = useState([]);
  const router = useRouter(); 
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("study_plan")
        .select("*");

      if (error) {
        console.error("Ошибка загрузки данных:", error);
      } else {
        setStudyPlan(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Head>
        <title>План Изучения Языков Программирования</title>
        <meta
          name="description"
          content="Мой план изучения языков программирования на год."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>План Изучения Языков Программирования</h1>

        <ul>
          {studyPlan.map((item) => (
            <li key={item.id}>
              <h2>{item.month}</h2>
              <h3>{item.language}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>

        {}
        <button
          onClick={() => router.push("/main")} 
          className="navigate-button"
        >
          Перейти на Главную страницу
        </button>
      </main>

      <footer></footer>
    </div>
  );
}
