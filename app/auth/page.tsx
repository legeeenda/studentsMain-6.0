"use client";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../auth/auth.css";



export default function TestPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();
    const supabase = createClient();





    // Функция для входа в систему
    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
    
        if (error) {
            setErrorMessage("Ошибка входа: " + error.message);
        } else {
            setErrorMessage("");
            console.log("Успешный вход:", data);
            
            // Получаем данные студента, используя идентификатор пользователя
            const { user } = data;
            const { data: studentData, error: studentError } = await supabase
                .from("students")
                .select("*")
                .eq("user_id", user.id); // Связка по user_id
    
            if (studentError) {
                console.error("Ошибка при получении данных студента:", studentError);
            } else {
                console.log("Данные студента:", studentData);
                router.push("/main"); // Перенаправление после получения данных
            }
        }
    };
    

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Вход в систему</h2>
                <input
                    type="email"
                    placeholder="Введите email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Войти</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
    
}
