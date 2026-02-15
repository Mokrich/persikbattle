import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { supabase } from "./supabase";

type Page = "home" | "daily" | "battle";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [tgUser, setTgUser] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const CORRECT_ANSWER = "ЕЕИУ";

  useEffect(() => {
    const init = async () => {
      WebApp.ready();
      WebApp.expand();

      const user = WebApp.initDataUnsafe?.user;
      if (!user) return;

      setTgUser(user);

      // Проверяем есть ли пользователь в базе
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .single();

      if (data) {
        setSavedNick(data.nickname);
        setScore(data.score);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleSaveNick = async () => {
    if (!nickname.trim() || !tgUser) return;

    const { data } = await supabase
      .from("users")
      .insert([
        {
          telegram_id: tgUser.id,
          nickname: nickname,
          score: 0,
        },
      ])
      .select()
      .single();

    if (data) {
      setSavedNick(data.nickname);
      setScore(data.score);
    }
  };

  const checkAnswer = async () => {
    if (!tgUser) return;

    if (answer.toUpperCase() === CORRECT_ANSWER) {
      const newScore = score + 1;

      await supabase
        .from("users")
        .update({ score: newScore })
        .eq("telegram_id", tgUser.id);

      setScore(newScore);
      alert("Верно! +1 очко");
    } else {
      alert("Неверно, попробуй ещё");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;

  return (
    <div style={{ padding: 20 }}>

      {/* 🔝 Верхняя панель */}
      {savedNick && (
        <div style={{
          position: "absolute",
          top: 10,
          right: 20,
          display: "flex",
          gap: 10,
          alignItems: "center"
        }}>
          {tgUser?.photo_url && (
            <img
              src={tgUser.photo_url}
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            />
          )}
          <span>{savedNick} | ⭐ {score}</span>
        </div>
      )}

      {/* 🔐 Регистрация */}
      {!savedNick && (
        <div>
          <h2>Введите ник</h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleSaveNick}>Сохранить</button>
        </div>
      )}

      {/* 🏠 Главная */}
      {savedNick && page === "home" && (
        <>
          <h1>🎮 KL5 Battle</h1>

          <button onClick={() => setPage("daily")}>
            📘 Ежедневные задания
          </button>

          <br /><br />

          <button onClick={() => setPage("battle")}>
            ⚔ Батл 2 на 2
          </button>
        </>
      )}

      {/* 📘 Задание */}
      {page === "daily" && (
        <>
          <button onClick={() => setPage("home")}>⬅ Назад</button>

          <h2>Ежедневное задание</h2>

          <p>
            Укажите, поставьте знак ударения в следующих словах
            (в поле ответа запишите последовательность полученных
            ударных букв без знаков препинания, например: ЕОИ)
          </p>

          <p style={{ fontWeight: "bold" }}>
            документ, цемент, руководить, каучук
          </p>

          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ответ"
          />

          <button onClick={checkAnswer}>Проверить</button>
        </>
      )}

      {/* ⚔ Баттл */}
      {page === "battle" && (
        <>
          <button onClick={() => setPage("home")}>⬅ Назад</button>
          <h2>Поиск соперников...</h2>
          <p>Система баттлов скоро появится.</p>
        </>
      )}
    </div>
  );
}
