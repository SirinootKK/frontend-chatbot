/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import ChatInputForm from "./ChatInputForm.jsx";
import ChatMessages from "./ChatMessages.jsx";
import ExampleList from "./ExampleList.jsx";
import TopResponsesSection from "./TopResponsesSection.jsx";
import Navbar from "./Navbar.jsx";

const readSessionDataFromSession = () => {
  const storedSessionData = sessionStorage.getItem("sessionData");

  if (storedSessionData) {
    const sessionData = JSON.parse(storedSessionData);

    return sessionData;
  }

  return [];
};

const readResponseDataFromSession = () => {
  const storedResponseData = sessionStorage.getItem("responseData");

  if (storedResponseData) {
    const responseData = JSON.parse(storedResponseData);

    return responseData;
  }

  return [];
};

function WangchanBERTa() {
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [botResponses, setBotResponses] = useState(() =>
    readSessionDataFromSession()
  );
  const [contextResponses, setContextResponses] = useState(() =>
    readResponseDataFromSession()
  );
  const [selectedChatType, setSelectedChatType] = useState("ChatWangchanBERTa");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [botResponses]);

  const handleChatTypeChange = (chatType) => {
    setUserMessage("");
    setSelectedChatType(chatType);

    if (chatType === "ChatmDeBERTa") {
      window.location.href = "/chatmdeberta";
    } else if (chatType === "ChatWangchanBERTa") {
      window.location.href = "/chatwangchanberta";
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage) return;
    setIsLoading(true);

    const apiEndpoint = "/api/get_response_wc";

    const sessionData = {
      message: userMessage,
      isUserMessage: true,
    };

    setBotResponses((prevResponses) => {
      const currentData = [...prevResponses, sessionData];
      sessionStorage.setItem("sessionData", JSON.stringify(currentData));
      return currentData;
    });

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();

      console.log("API Response:", data);

      const responseData = {
        message: data.wc_response,
        isUserMessage: false,
        wc_similar_context: data.wc_similar_context,
        wc_distance: data.wc_distance,
        wc_allDistance: data.wc_ls_dis,
      };

      setContextResponses((prevResponses) => {
        const currentData = [...prevResponses, responseData];
        sessionStorage.setItem("responseData", JSON.stringify(currentData));
        return currentData;
      });
      setBotResponses((prevResponses) => {
        const currentData = [...prevResponses, responseData];
        sessionStorage.setItem("sessionData", JSON.stringify(currentData));
        return currentData;
      });
    } catch (error) {
      console.error("Error fetching response:", error);
      window.alert("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-primary flex p-4 justify-center items-center">
      <div className="w-full md:max-w-5xl max-w-4xl h-[95dvh] bg-secondary md:rounded-xl rounded-lg shadow-xl flex flex-col">
        <Navbar
          selectedChatType={selectedChatType}
          handleChatTypeChange={handleChatTypeChange}
        />

        <ChatMessages
          botResponses={botResponses}
          chatContainerRef={chatContainerRef}
          userMessage={userMessage}
          selectedChatType={selectedChatType}
        />

        <ExampleList
          isLoading={isLoading}
          handleExampleClick={handleExampleClick}
          handleScroll={handleScroll}
        />

        <ChatInputForm
          userMessage={userMessage}
          isLoading={isLoading}
          onChange={(e) => setUserMessage(e.target.value)}
          onSubmit={handleSubmit}
        />
      </div>

      <TopResponsesSection
        botResponses={contextResponses}
        selectedChatType={selectedChatType}
      />
    </div>
  );
}

export default WangchanBERTa;
