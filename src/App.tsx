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
  const [topPlayers, setTopPlayers] = useState<{ nickname: string; score: number }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Загрузка пользователя
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

      // Загрузка топа
      await loadTopPlayers();
      // Загрузка всех заданий
      await loadTasks();

      setLoading(false);
    };
    init();
  }, []);

  const loadTopPlayers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("nickname, score")
      .order("score", { ascending: false });

    if (error) console.error(error.message);
    else setTopPlayers(data || []);
  };

  const loadTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) console.error(error.message);
    else setTasks(data || []);
  };

  const handleSaveNick = async () => {
    if (!nickname.trim() || !tgUser) return;

    const { data } = await supabase
      .from("users")
      .insert([{ telegram_id: tgUser.id, nickname, score: 0 }])
      .select()
      .single();

    if (data) setSavedNick(data.nickname);
  };

  const nextTask = () => {
    if (tasks.length === 0) return;
    const remaining = tasks.filter(t => !t.used);
    if (remaining.length === 0) return alert("Все задания пройдены!");
    const t = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentTask(t);
  };

  const handleAnswered = async () => {
    // Увеличиваем очки
    const newScore = score + 1;
    await supabase.from("users").update({ score: newScore }).eq("telegram_id", tgUser.id);
    setScore(newScore);

    // Помечаем задание как использованное
    if (currentTask) {
      const updatedTasks = tasks.map(t => (t.id === currentTask.id ? { ...t, used: true } : t));
      setTasks(updatedTasks);
    }

    // Обновляем топ
    await loadTopPlayers();

    // Убираем задание
    setCurrentTask(null);
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      {savedNick && (
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <span>{savedNick} | ⭐ {score}</span>
        </div>
      )}

      {!savedNick && (
        <div>
          <h2>Введите ник</h2>
          <input value={nickname} onChange={e => setNickname(e.target.value)} />
          <button onClick={handleSaveNick}>Сохранить</button>
        </div>
      )}

      {savedNick && page === "home" && !currentTask && (
        <>
          <h1 style={{ fontSize: 48 }}>persikbattle</h1>
          <button onClick={() => { setPage("daily"); nextTask(); }} style={{ margin: 10, padding: "15px 40px", borderRadius: 25, fontSize: 20 }}>📘 Ежедневные задания</button>
          <br />
          <button onClick={() => setPage("battle")} style={{ margin: 10, padding: "15px 40px", borderRadius: 25, fontSize: 20 }}>⚔ Батл 2 на 2</button>

          <h2>🏆 Топ игроков</h2>
          <ol>
            {topPlayers.map((p, i) => (
              <li key={i}>{p.nickname} — {p.score}</li>
            ))}
          </ol>
        </>
      )}

      {currentTask && (
        <TaskComponent task={currentTask} onAnswered={handleAnswered} />
      )}

      {page === "battle" && <div><button onClick={() => setPage("home")}>⬅ Назад</button><h2>Поиск соперников...</h2></div>}
    </div>
  );
}
