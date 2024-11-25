"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);


export default function Statistics() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetchStudents();
    }, []);
  
    async function fetchStudents() {
      try {
        setLoading(true);
        // Получаем студентов, отсортированных по баллам
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("scores", { ascending: false }); // Сортировка по убыванию
        if (error) throw error;
        setStudents(data);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error.message);
      } finally {
        setLoading(false);
      }
    }
  
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Статистика студентов</h1>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Имя</th>
                <th style={styles.th}>Баллы</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{student.name}</td>
                  <td style={styles.td}>{student.scores}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
  
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
      padding: "20px",
    },
    header: {
      fontSize: "2rem",
      marginBottom: "20px",
    },
    table: {
      width: "100%",
      maxWidth: "600px",
      borderCollapse: "collapse",
      backgroundColor: "#fff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    th: {
      backgroundColor: "#0070f3",
      color: "#fff",
      padding: "10px",
      textAlign: "left",
      fontWeight: "bold",
    },
    tr: {
      borderBottom: "1px solid #ddd",
    },
    td: {
      padding: "10px",
      textAlign: "left",
      fontSize: "1rem",
    },
    trHover: {
      backgroundColor: "#f1f1f1",
    },
  };