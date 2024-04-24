'use client';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ChatMessage from "./chatMessage";
import { ChatEntry } from "@/types";

export default function App() {
  // Setup initial Chat History
  const defaultInitialChatHistory: ChatEntry[] = [
    {
      contents: [
        {
          content: "Hi, what can I help you with today?",
          type: "text"
        },
        {
          content: "Type a/image for an image, b/video for a video, and anything else for a text response.",
          type: "text"
        }
      ],
      isChatbot: true
    }
  ]

  // load saved chatHistory if existent
  let initialChatHistory: any = localStorage.getItem('chatHistory');
  if (initialChatHistory) {
    initialChatHistory = JSON.parse(initialChatHistory);
  }
  else {
    initialChatHistory = defaultInitialChatHistory;
  }
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>(initialChatHistory);


  // Dealing with user prompt
  const [userPrompt, setUserPrompt] = useState('')

  const submitUserPrompt = () => {
    if (userPrompt === "") return;
    // append user prompt
    const newChatHistory = chatHistory.slice();
    newChatHistory.push({
      contents: [
        {
          content: userPrompt,
          type: "text"
        }
      ],
      isChatbot: false
    });
    setChatHistory(newChatHistory);

    if (['a', 'image'].includes(userPrompt)) {
      newChatHistory.push({
        contents: [
          {
            content: "Here is your image:",
            type: "text"
          },
          {
            content: "https://avatars.githubusercontent.com/u/74837144?v=4",
            type: "image"
          }
        ],
        isChatbot: true
      });
    }
    else if (['b', 'video'].includes(userPrompt)) {
      newChatHistory.push({
        contents: [
          {
            content: "Here is your video:",
            type: "text"
          },
          {
            content: "https://www.youtube.com/watch?v=kUs-fH1k-aM",
            type: "video"
          }
        ],
        isChatbot: true
      });
    }
    else {
      newChatHistory.push({
        contents: [
          {
            content: "This is my default response.",
            type: "text"
          }
        ],
        isChatbot: true
      });
    }

    setChatHistory(newChatHistory);
    setUserPrompt('')
  }

  // !!!! WITH BACKEND
  const [incomingMessage, setIncomingMessage] = useState('START: ')
  const submitUserPromptWithBackend = async () => {
    if (userPrompt === "") return;
    // append user prompt
    const newChatHistory = chatHistory.slice();
    newChatHistory.push({
      contents: [
        {
          content: userPrompt,
          type: "text"
        }
      ],
      isChatbot: false
    });
    setChatHistory(newChatHistory);

    // make sse request to the backend
    const response = await fetch(`http://localhost:8000/chat_stream/${encodeURIComponent(userPrompt)}`, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });

    // process the response from AI as it comes in
    if (!response.body) return;
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
    
    newChatHistory.push({
      contents: [
        {
          content: incomingMessage,
          type: "text"
        }
      ],
      isChatbot: true
    });

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      //console.log(value)
      const lines = value
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        const parsedMessage = JSON.parse(message).valor;
        setIncomingMessage((prevMessage) => prevMessage + parsedMessage);
      }
    }
    setChatHistory(() => newChatHistory);
  }

  // Save chat history in local storage
  useEffect(() => {
    //localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory])

  const clearChatHistory = () => {
    setChatHistory(defaultInitialChatHistory);
    localStorage.removeItem('chatHistory');
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <header className="flex flex-row gap-1 justify-between p-4 bg-slate-700">
        <div className="text-white font-semibold text-xl drop-shadow-lg">My Prototype</div>
      </header>
      <main className="h-full flex justify-center p-4">
        <div className="w-3/4 flex flex-col justify-between p-4 gap-4 rounded-lg bg-slate-100 border border-slate-300">
          <div className="flex-1 overflow-auto">
            <div className="grid gap-4">
              { chatHistory.map((chatEntry, index) => <ChatMessage key={index}  chatEntry={chatEntry} />) }
            </div>
            <div className="bg-red-300">{incomingMessage}</div>
          </div>
          <div className="flex gap-3">
            <Input type="text" placeholder="Insert your prompt here..." value={userPrompt} onChange={e => setUserPrompt(e.target.value)}/>
            <Button type="submit" onClick={submitUserPromptWithBackend}>Send</Button>
            <Button variant={'destructive'} onClick={clearChatHistory}>Delete chat history</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
