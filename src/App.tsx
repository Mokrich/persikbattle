import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { supabase } from "./supabase";

type Page = "home" | "daily" | "battle";

interface Player {
  nickname: string;
  score: number;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [tgUser, setTgUser] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState<number>(0);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const CORRECT_ANSWER = "ЕЕИУ";

  // -------------------------------
  // Инициализация
  // -------------------------------
  useEffect(() => {
    const init = async () => {
      WebApp.ready();
      WebApp.expand();

      const user = WebApp.initDataUnsafe?.user;
      if (!user) return;

      setTgUser(user);

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .single();

      if (data) {
        setSavedNick(data.nickname);
        setScore(data.score);
      }

      await loadTopPlayers();
      setLoading(false);
    };

    init();

    // автообновление топа каждые 10 секунд
    const interval = setInterval(() => loadTopPlayers(), 10000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------
  // Функция загрузки топа
  // -------------------------------
  const loadTopPlayers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("nickname, score")
      .order("score", { ascending: false });

    if (error) console.error("Ошибка загрузки топа:", error.message);
    else setTopPlayers(data);
  };

  // -------------------------------
  // Регистрация
  // -------------------------------
  const handleSaveNick = async () => {
    if (!nickname.trim() || !tgUser) return;

    const { data } = await supabase
      .from("users")
      .upsert({
        telegram_id: tgUser.id,
        nickname,
        score: 0,
      })
      .select()
      .single();

    if (data) {
      setSavedNick(data.nickname);
      setScore(data.score);
      await loadTopPlayers();
    }
  };

  // -------------------------------
  // Проверка ответа
  // -------------------------------
  const checkAnswer = async () => {
    if (!tgUser || showResult) return;

    const correct = answer.toUpperCase() === CORRECT_ANSWER;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const newScore = score + 1;
      await supabase
        .from("users")
        .update({ score: newScore })
        .eq("telegram_id", tgUser.id);
      setScore(newScore);
      await loadTopPlayers();
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;

  // -------------------------------
  // Стили
  // -------------------------------
  const centerStyle = { display: "flex", flexDirection: "column", alignItems: "center" };
  const buttonStyle = {
    padding: "12px 24px",
    borderRadius: 30,
    border: "none",
    margin: "10px 0",
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
    background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
    color: "white",
    width: "220px",
    textAlign: "center",
    transition: "transform 0.2s",
  } as const;

  return (
    <div style={{ padding: 20, minHeight: "100vh", ...centerStyle, background: "linear-gradient(135deg, #ffffff, #f3e8ff, #e9d5ff, #d8b4fe)" }}>
      
      {/* Верхняя панель */}
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
            <img src={tgUser.photo_url} style={{ width: 40, height: 40, borderRadius: "50%" }} />
          )}
          <span>{savedNick} | ⭐ {score}</span>
        </div>
      )}

      {/* Регистрация */}
      {!savedNick && (
        <div style={centerStyle}>
          <h2>Введите ник</h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ padding: "10px", fontSize: 16, borderRadius: 8, marginBottom: 10 }}
          />
          <button style={buttonStyle} onClick={handleSaveNick}>Сохранить</button>
        </div>
      )}

      {/* Главная */}
      {savedNick && page === "home" && (
        <div style={centerStyle}>
          <h1 style={{ fontSize: 36, marginBottom: 30 }}>persikbattle</h1>

          <button style={buttonStyle} onClick={() => { setPage("daily"); setShowResult(false); setAnswer(""); }}>📘 Ежедневные задания</button>
          <button style={buttonStyle} onClick={() => setPage("battle")}>⚔ Батл 2 на 2</button>

          {/* Топ игроков */}
          <h2 style={{ marginTop: 30 }}>🏆 Рейтинг игроков</h2>
          <div style={{ width: "100%", maxWidth: 400 }}>
            {topPlayers.map((player, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                background: "#ffffffaa",
                padding: "8px 12px",
                borderRadius: 8,
                margin: "4px 0",
                fontWeight: "bold",
              }}>
                <span>{index + 1}. {player.nickname}</span>
                <span>⭐ {player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ежедневное задание */}
      {page === "daily" && (
        <div style={centerStyle}>
          <button style={{ ...buttonStyle, width: 120 }} onClick={() => setPage("home")}>⬅ Назад</button>

          <h2>Ежедневное задание</h2>
          <p style={{ textAlign: "center" }}>
            Поставьте знак ударения в следующих словах
            (в поле ответа запишите последовательность полученных ударных букв без знаков препинания, например: ЕОИ)
          </p>

          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Введите ответ"
            style={{ padding: "10px", fontSize: 16, borderRadius: 8, marginTop: 10 }}
          />

          {!showResult && <button style={buttonStyle} onClick={checkAnswer}>Проверить</button>}

          {showResult && (
            <div style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 12,
              background: "#ffffffaa",
              minWidth: 200,
              textAlign: "center"
            }}>
              {isCorrect ? (
                <p style={{ color: "green" }}>✅ Верно! +1 очко</p>
              ) : (
                <p style={{ color: "red" }}>❌ Неверно. Правильный ответ: {CORRECT_ANSWER}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Батл */}
      {page === "battle" && (
        <div style={centerStyle}>
          <button style={{ ...buttonStyle, width: 120 }} onClick={() => setPage("home")}>⬅ Назад</button>
          <h2>Поиск соперников...</h2>
          <p>Система баттлов скоро появится.</p>
        </div>
      )}

    </div>
  );
}
