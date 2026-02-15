import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export default function App() {
  const [tgUser, setTgUser] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [savedNick, setSavedNick] = useState("");

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    const user = WebApp.initDataUnsafe?.user;
    setTgUser(user);

    const storedNick = localStorage.getItem("nickname");
    if (storedNick) {
      setSavedNick(storedNick);
    }
  }, []);

  const handleSaveNick = () => {
    if (!nickname.trim()) return;

    localStorage.setItem("nickname", nickname);
    setSavedNick(nickname);
  };

  return (
    <div style={{ padding: 16 }}>
      
      {/* 🔝 Верхняя панель с аккаунтом */}
      {savedNick && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {tgUser?.photo_url && (
            <img
              src={tgUser.photo_url}
              alt="avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
              }}
            />
          )}
          <span>{savedNick}</span>
        </div>
      )}

      {/* 🆕 Ввод ника при первом входе */}
      {!savedNick && (
        <div>
          <h2>Введите ваш ник</h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ваш ник"
            style={{ padding: 10 }}
          />
          <br /><br />
          <button onClick={handleSaveNick}>
            Сохранить
          </button>
        </div>
      )}

      {/* 🎮 Основной экран */}
      {savedNick && (
        <>
          <h1>🎮 KL5 Battle</h1>
          <p>Тренажёр для учеников 5 класса</p>

          <h2>📊 Рейтинг</h2>
          <ul>
            <li>1. Аня — 120</li>
            <li>2. Петя — 95</li>
            <li>3. Миша — 80</li>
          </ul>

          <h2>Режимы</h2>
          <button>⚔️ Батл 1 на 1</button>
          <br /><br />
          <button>📘 Ежедневные задания</button>
          <br /><br />
          <button>👑 Королевская битва</button>
        </>
      )}
    </div>
  );
}
