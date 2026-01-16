const TelegramChatButton = () => {
  return (
    <>
      <style>{`
        #tg-chat-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background-color: #0088cc;
          border-radius: 50%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 9999;
          transition: transform 0.2s;
        }
        #tg-chat-btn:hover {
          transform: scale(1.1);
        }
        #tg-chat-btn img {
          width: 30px;
          height: 30px;
        }
        @media (max-width: 768px) {
          #tg-chat-btn {
            width: 70px;
            height: 70px;
          }
          #tg-chat-btn img {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>
      <div
        id="tg-chat-btn"
        title="Написать в Telegram"
        onClick={() => window.open('https://t.me/otvetzakaz_bot', '_blank')}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
          alt="Telegram"
        />
      </div>
    </>
  );
};

export default TelegramChatButton;