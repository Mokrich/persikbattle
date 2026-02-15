import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { supabase } from "./supabase";

// Типы
type Page = "home" | "daily" | "battle";

type Task = {
  id: number;
  text: string[];       // слова без ударений
  correct: string[];    // слова с ударениями
};

type Player = { nickname: string; score: number };

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [tgUser, setTgUser] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState("");
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]); // выбранные буквы для каждого слова
  const [checked, setChecked] = useState(false); // нажата кнопка проверка

  // --- Инициализация WebApp и Supabase ---
  useEffect(() => {
    const init = async () => {
      WebApp.ready();
      WebApp.expand();

      const user = WebApp.initDataUnsafe?.user;
      if (!user) return;
      setTgUser(user);

      // Проверяем пользователя в базе
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .single();

      if (data) {
        setSavedNick(data.nickname);
        setScore(data.score);
      }

      // Загружаем топ игроков
      await loadTopPlayers();

      // Загружаем задания из базы
      const { data: taskData } = await supabase.from("tasks").select("*");
      if (taskData) setTasks(taskData);

      setLoading(false);
    };

    init();
  }, []);

  // --- Загрузка топа ---
  const loadTopPlayers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("nickname, score")
      .order("score", { ascending: false });

    if (error) console.error(error.message);
    else setTopPlayers(data);
  };

  // --- Сохранение ника ---
  const handleSaveNick = async () => {
    if (!nickname.trim() || !tgUser) return;

    const { data } = await supabase
      .from("users")
      .insert([{ telegram_id: tgUser.id, nickname, score: 0 }])
      .select()
      .single();

    if (data) {
      setSavedNick(data.nickname);
      setScore(data.score);
    }
  };

  // --- Выбор нового задания ---
  const pickTask = () => {
    if (!tasks.length) return;

    // получаем список уже показанных заданий
    const shownTasks = JSON.parse(localStorage.getItem("shownTasks") || "[]");
    const remaining = tasks.filter(t => !shownTasks.includes(t.id));
    if (!remaining.length) {
      localStorage.removeItem("shownTasks");
      return pickTask();
    }

    const task = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentTask(task);
    setSelectedIndexes(Array(task.text.length).fill(-1));
    setChecked(false);

    // сохраняем id задания
    localStorage.setItem(
      "shownTasks",
      JSON.stringify([...shownTasks, task.id])
    );
  };

  // --- Проверка ответа ---
  const checkAnswer = async () => {
    if (!tgUser || !currentTask) return;
    setChecked(true);

    // подсчет очков за правильные ответы
    let points = 0;
    currentTask.text.forEach((word, i) => {
      const correctWord = currentTask.correct[i];
      const selectedIndex = selectedIndexes[i];
      if (selectedIndex === -1) return;
      const correctIndex = Array.from(word).findIndex(
        (_, idx) => Array.from(correctWord)[idx] === correctWord[idx] && Array.from(correctWord)[idx].match(/[АЕЁИОУЫЭЮЯ]/)
      );
      if (selectedIndex === correctIndex) points += 1;
    });

    const newScore = score + points;

    await supabase
      .from("users")
      .update({ score: newScore })
      .eq("telegram_id", tgUser.id);

    setScore(newScore);
    await loadTopPlayers();
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;

  // --- Компонент слова для выбора ударения ---
  const TaskWord = ({ word, index }: { word: string; index: number }) => {
    const letters = Array.from(word);
    return (
      <div style={{ marginBottom: 10 }}>
        {letters.map((letter, i) => (
          <button
            key={i}
            style={{
              margin: 2,
              padding: 5,
              minWidth: 25,
              backgroundColor:
                checked
                  ? Array.from(currentTask!.correct[index])[i] === letter
                    ? "lightgreen"
                    : i === selectedIndexes[index]
                    ? "salmon"
                    : "#eee"
                  : i === selectedIndexes[index]
                  ? "#add8e6"
                  : "#eee",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
            }}
            disabled={checked}
            onClick={() =>
              setSelectedIndexes(si =>
                si.map((v, idx) => (idx === index ? i : v))
              )
            }
          >
            {letter}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>PersikBattle</h1>

      {/* Верхняя панель */}
      {savedNick && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 20,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          {tgUser?.photo_url && (
            <img
              src={tgUser.photo_url}
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            />
          )}
          <span>
            {savedNick} | ⭐ {score}
          </span>
        </div>
      )}

      {/* Регистрация */}
      {!savedNick && (
        <div>
          <h2>Введите ник</h2>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
          <button
            onClick={handleSaveNick}
            style={{ marginLeft: 10, padding: "5px 15px", borderRadius: 20 }}
          >
            Сохранить
          </button>
        </div>
      )}

      {/* Главная страница */}
      {savedNick && page === "home" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <button
            style={{
              padding: "15px 50px",
              borderRadius: 50,
              fontSize: 18,
              cursor: "pointer",
            }}
            onClick={() => {
              pickTask();
              setPage("daily");
            }}
          >
            📘 Ежедневные задания
          </button>

          <button
            style={{
              padding: "15px 50px",
              borderRadius: 50,
              fontSize: 18,
              cursor: "pointer",
            }}
            onClick={() => setPage("battle")}
          >
            ⚔ Батл 2 на 2
          </button>

          {/* Топ игроков */}
          <div style={{ marginTop: 30 }}>
            <h2>🏆 Топ игроков</h2>
            <ol>
              {topPlayers.map((p, idx) => (
                <li key={idx}>
                  {p.nickname} — {p.score}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Задание */}
      {page === "daily" && currentTask && (
        <div style={{ maxWidth: 600 }}>
          <button onClick={() => setPage("home")}>⬅ Назад</button>

          <h2>Поставьте знак ударения в следующих словах</h2>
          <p>
            (в поле ответа нажимайте на гласную букву, чтобы выбрать ударение)
          </p>

          {currentTask.text.map((word, i) => (
            <TaskWord word={word} index={i} key={i} />
          ))}

          {!checked && (
            <button
              onClick={checkAnswer}
              style={{
                marginTop: 10,
                padding: "10px 30px",
                borderRadius: 20,
                cursor: "pointer",
              }}
            >
              Проверить
            </button>
          )}

          {checked && (
            <div style={{ marginTop: 20 }}>
              <h3>Правильные ответы:</h3>
              {currentTask.correct.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
              <button
                style={{
                  marginTop: 10,
                  padding: "10px 30px",
                  borderRadius: 20,
                  cursor: "pointer",
                }}
                onClick={() => pickTask()}
              >
                Следующее задание
              </button>
            </div>
          )}
        </div>
      )}

      {/* Баттл */}
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
