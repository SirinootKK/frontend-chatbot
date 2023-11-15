import { useState, useEffect, useRef } from "react";
import { Input } from "@material-tailwind/react";
import { userImg, botImg } from "./images/index.js";
import SendIcon from "@mui/icons-material/Send";

function ChatBox() {
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [botResponses, setBotResponses] = useState([]);
  const [examples] = useState([
    "NCX ครอบคลุมแหล่งข้อมูลอะไรบ้าง",
    "NCX ครอบคลุมแหล่งอะไร",
    "ระบบไม่สามารถเข้าใช้งานได้",
    "ระบบใช้งานไม่ได้",
    "บริษัทฯ ให้บริการอะไรบ้าง",
    "DXT360 มีข้อมูลจากแหล่งข้อมูลอะไรบ้าง",
    "มีบริการฐานข้อมูลราคาพิเศษสำหรับนักศึกษาเพื่อใช้ทำวิจัยหรือไม่",
    "Page Rank ของ Online Media คืออะไร",
  ]);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [botResponses]);

  const handleScroll = (e) => {
    const strength = Math.abs(e.deltaY);

    if (e.deltaY === 0) return;

    const el = e.currentTarget;

    el.scrollTo({
      left: el.scrollLeft + e.deltaY,
      behavior: strength > 70 ? "auto" : "smooth",
    });
  };

  const handleExampleClick = (e) => {
    setUserMessage(e);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!userMessage) return;
  //   setUserMessage("");
  //   setIsLoading(true);

  //   setBotResponses((prevResponses) => [
  //     ...prevResponses,
  //     { message: userMessage, isUserMessage: true },
  //   ]);

  //   try {
  //     const response = await fetch("/api/get_response_mde", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ message: userMessage }),
  //     });
  //     const data = await response.json();

  //     setBotResponses((prevResponses) => [
  //       ...prevResponses,
  //       { message: data.response, isUserMessage: false },
  //     ]);
  //   } catch (error) {
  //     console.error("Error fetching response:", error);
  //     window.alert("Server error. Please try again later.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage) return;
    setUserMessage("");
    setIsLoading(true);

    setBotResponses((prevResponses) => [
      ...prevResponses,
      { message: userMessage, isUserMessage: true },
    ]);

    try {
      const response = await fetch("/api/get_response_mde", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();

      console.log("API Response:", data);

      setBotResponses((prevResponses) => [
        ...prevResponses,
        {
          message: data.response,
          isUserMessage: false,
          simitar_context: data.simitar_context,
          probability: data.probability,
        },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      window.alert("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full w-full bg-primary">
      <div className="w-full max-w-5xl h-full md:m-2 md:h-[70vh] bg-secondary md:rounded-xl shadow-xl flex flex-col flex-shrink-0">
        <h1 className="text-center font-semibold text-secondaryLight mb-2 mt-3 text-lg h-16 flex items-center justify-center">
          {isLoading ? (
            <h1 className="text-lightPurple">Loading...</h1>
          ) : (
            "ChatmDeBERTa"
          )}
        </h1>
        <div className="h-[2px] bg-primary border-0 w-full shadow-xl" />
        <div
          className="flex-grow overflow-auto vertical-scrollbar h-full"
          ref={chatContainerRef}
        >
          {botResponses.length === 0 && !userMessage && (
            <div className="flex flex-col justify-center items-center h-full">
              <h1 className="text-gray-500 opacity-60 text-2xl">
                Welcome to ChatmDeBERTa
              </h1>
            </div>
          )}
          {botResponses.map((response, index) => (
            <div
              key={index}
              className={`flex flex-row md:items-center space-x-2 px-[40px] md:px-[72px] py-6 text-white ${
                response.isUserMessage ? "bg-secondary" : "bg-purple "
              }`}
            >
              <img
                src={response.isUserMessage ? userImg : botImg}
                className="object-cover h-[48px] w-[48px]"
                alt={response.isUserMessage ? "User" : "Bot"}
              />
              <div className="px-4">
                {response.message}
                <div className="text-sm">
                  {response.probability && (
                    <p className="text-xs mt-1">
                      Probability = {response.probability}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <ul
          className={`flex h-[85px] px-8 w-full overflow-y-hidden items-center gap-x-2 select-none ${
            !isLoading
              ? "horizontal-scrollbar overflow-x-scroll sm:overflow-x-hidden hover:overflow-x-scroll"
              : "overflow-x-hidden"
          }`}
          onWheel={!isLoading ? (e) => handleScroll(e) : undefined}
        >
          {examples.map((example, index) => (
            <h1
              key={index}
              className={`bg-primaryLight bg-opacity-50 whitespace-nowrap text-white text-sm py-2 px-4 rounded-xl flex items-center flex-nowrap w-full h-fit cursor-pointer ${
                !isLoading ? "hover:bg-secondaryLight hover:bg-opacity-50" : ""
              }`}
              onClick={
                !isLoading ? () => handleExampleClick(example) : undefined
              }
            >
              {example}
            </h1>
          ))}
        </ul>

        <div className="h-28 w-full flex items-center bg pb-2">
          <form
            onSubmit={handleSubmit}
            className="flex w-full h-fit relative px-12"
          >
            <Input
              type="text"
              value={userMessage}
              className="w-full flex rounded-xl p-4 bg-primaryLight shadow-2xl text-white outline-none"
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder={isLoading ? "Loading..." : "Send a message..."}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="z-20 w-fit h-fit text-secondaryLight absolute right-16 top-1/2 -translate-y-1/2"
              disabled={isLoading}
            >
              {!isLoading ? <SendIcon fontSize="small" /> : null}
            </button>
          </form>
        </div>
      </div>
      <div className="w-full max-w-5xl h-full md:m- md:h-[35vh] bg-secondary md:rounded-xl shadow-xl overflow-auto vertical-scrollbar">
        {botResponses.map((response, index) => (
          <div
            key={index}
            className={
              "flex flex-col items-start px-[40px] md:px-[72px] py-1 text-white"
            }
          >
            {response.simitar_context &&
              response.simitar_context.map((item, idx) => (
                <div
                  key={idx}
                  className={`pt-2 ${
                    item.includes("          ") ? "mb-2" : ""
                  }`}
                >
                  {item.split(/\s{2,}/).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))}
            {response.simitar_context && (
              <div className="h-[1px] bg-white border-0 w-full shadow-xl" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatBox;
