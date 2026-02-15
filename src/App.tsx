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

  // Инициализация WebApp и пользователя
  useEffect(() => {
    const init = async () => {
      WebApp.ready();
      WebApp.expand();

      const user = WebApp.initDataUnsafe?.user;
      if (!user) return;
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
      await loadTasks(); // После этого nextTask вызовется внутри loadTasks

      setLoading(false);
    };
    init();
  }, []);

  // Загрузка топа игроков
  const loadTopPlayers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("nickname, score")
      .order("score", { ascending: false });

    if (error) console.error(error.message);
    else setTopPlayers(data || []);
  };

  // Загрузка всех заданий
  const loadTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) console.error(error.message);
    else {
      const cleaned = (data || []).map(t => ({
        ...t,
        words: t.words?.trim() || "",
        correct: t.correct?.trim() || "",
        used: t.used || false,
      }));
      setTasks(cleaned);

      // сразу выбираем первое задание
      nextTask(cleaned);
    }
  };

  // Сохраняем никнейм
  const handleSaveNick = async () => {
    if (!nickname.trim() || !tgUser) return;

    const { data } = await supabase
      .from("users")
      .insert([{ telegram_id: tgUser.id, nickname, score: 0 }])
      .select()
      .single();

    if (data) setSavedNick(data.nickname);
  };

  // Выбираем следующее задание
  const nextTask = (taskList: Task[] = tasks) => {
    const remaining = taskList.filter(t => !t.used);
    if (remaining.length === 0) return alert("Все задания пройдены!");
    const t = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentTask(t);
  };

  // Обработка ответа
  const handleAnswered = async () => {
    if (!tgUser || !currentTask) return;

    // Увеличиваем очки
    const newScore = score + 1;
    await supabase.from("users").update({ score: newScore }).eq("telegram_id", tgUser.id);
    setScore(newScore);

    // Помечаем задание как использованное
    await supabase.from("tasks").update({ used: true }).eq("id", currentTask.id);
    const updatedTasks = tasks.map(t => (t.id === currentTask.id ? { ...t, used: true } : t));
    setTasks(updatedTasks);

    // Обновляем топ
    await loadTopPlayers();

    // Переходим к следующему заданию
    nextTask(updatedTasks);
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
