import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

type Page = "home" | "daily" | "battle";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [tgUser, setTgUser] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState<number>(0);

  const CORRECT_ANSWER = "ЕЕИУ";

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    const user = WebApp.initDataUnsafe?.user;
    setTgUser(user);

    const storedNick = localStorage.getItem("nickname");
    const storedScore = localStorage.getItem("score");

    if (storedNick) setSavedNick(storedNick);
    if (storedScore) setScore(Number(storedScore));
  }, []);

  const handleSaveNick = () => {
    if (!nickname.trim()) return;
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("score", "0");
    setSavedNick(nickname);
    setScore(0);
  };

  const checkAnswer = () => {
    if (answer.toUpperCase() === CORRECT_ANSWER) {
      const newScore = score + 1;
      setScore(newScore);
      localStorage.setItem("score", newScore.toString());
      alert("Верно! +1 очко");
    } else {
      alert("Неверно, попробуй ещё");
    }
  };

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

      {/* 🔐 Авторизация */}
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

          <h2>🏆 Топ игроков (временно локальный)</h2>
          <ul>
            <li>{savedNick} — {score}</li>
          </ul>

          <button onClick={() => setPage("daily")}>
            📘 Ежедневные задания
          </button>

          <br /><br />

          <button onClick={() => setPage("battle")}>
            ⚔ Батл 2 на 2
          </button>
        </>
      )}

      {/* 📘 Ежедневное задание */}
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

      {/* ⚔ Баттл (заглушка) */}
      {page === "battle" && (
        <>
          <button onClick={() => setPage("home")}>⬅ Назад</button>
          <h2>Поиск соперников...</h2>
          <p>Система матчмейкинга будет добавлена позже.</p>
        </>
      )}

    </div>
  );
}
