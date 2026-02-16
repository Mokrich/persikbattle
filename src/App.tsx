import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { supabase } from "./supabase";
import TaskComponent, { Task } from "./TaskComponent";

type Page = "home" | "daily" | "battle";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [tgUser, setTgUser] = useState<any>(null);

  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState("");
  const [score, setScore] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState<
    { nickname: string; score: number }[]
  >([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // ===== INIT =====
  useEffect(() => {
    const init = async () => {
      WebApp.ready();
      WebApp.expand();

      const user = WebApp.initDataUnsafe?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      setTgUser(user);

      // Загружаем пользователя
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .single();

      if (userData) {
        setSavedNick(userData.nickname);
        setScore(userData.score);
      }

      await loadTopPlayers();
      await loadTasks();

      setLoading(false);
    };

    init();
  }, []);

  // ===== LOAD TOP =====
  const loadTopPlayers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("nickname, score")
      .order("score", { ascending: false });

    if (!error && data) {
      setTopPlayers(data);
    }
  };

  // ===== LOAD TASKS =====
  const loadTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");

    console.log("TASKS FROM DB:", data);
    console.log("ERROR:", error);

    if (!error && data) {
      const cleaned = data.map((t) => ({
        ...t,
        words: t.words?.trim() || "",
        correct: t.correct?.trim() || "",
      }));

      setTasks(cleaned);
    }
  };

  // ===== SAVE NICK =====
  const handleSaveNick = async () => {
    if (!nickname.trim() || !tgUser) return;

    const { data } = await supabase
      .from("users")
      .insert([{ telegram_id: tgUser.id, nickname, score: 0 }])
      .select()
      .single();

    if (data) {
      setSavedNick(data.nickname);
      setScore(0);
    }
  };

  // ===== NEXT TASK =====
  const nextTask = () => {
    if (!tasks || tasks.length === 0) {
      alert("В базе нет заданий");
      return;
    }

    const random =
      tasks[Math.floor(Math.random() * tasks.length)];

    setCurrentTask(random);
    setPage("daily");
  };

  // ===== AFTER ANSWER =====
  const handleAnswered = async (isCorrect: boolean) => {
  if (!tgUser) return;

  if (isCorrect) {
    const newScore = score + 1;

    await supabase
      .from("users")
      .update({ score: newScore })
      .eq("telegram_id", tgUser.id);

    setScore(newScore);
  }

  await loadTopPlayers();

  nextTask();
};
;

  // ===== LOADING =====
  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      {savedNick && (
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          {savedNick} | ⭐ {score}
        </div>
      )}

      {!savedNick && (
        <div>
          <h2>Введите ник</h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <br />
          <button onClick={handleSaveNick}>Сохранить</button>
        </div>
      )}

      {savedNick && page === "home" && (
        <>
          <h1 style={{ fontSize: 42 }}>persikbattle</h1>

          <button
            onClick={nextTask}
            style={{
              margin: 10,
              padding: "15px 40px",
              borderRadius: 25,
              fontSize: 20,
            }}
          >
            📘 Ежедневные задания
          </button>

          <br />

          <button
            onClick={() => setPage("battle")}
            style={{
              margin: 10,
              padding: "15px 40px",
              borderRadius: 25,
              fontSize: 20,
            }}
          >
            ⚔ Батл 2 на 2
          </button>

          <h2>🏆 Топ игроков</h2>
          <ol>
            {topPlayers.map((p, i) => (
              <li key={i}>
                {p.nickname} — {p.score}
              </li>
            ))}
          </ol>
        </>
      )}

      {currentTask && (
        <TaskComponent
          task={currentTask}
          onAnswered={handleAnswered}
        />
      )}

      {page === "battle" && (
        <div>
          <button onClick={() => setPage("home")}>
            ⬅ Назад
          </button>
          <h2>Поиск соперников...</h2>
        </div>
      )}
    </div>
  );
}
