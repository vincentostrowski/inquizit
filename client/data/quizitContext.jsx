// BookContext.js
import { createContext, useContext, useState } from 'react';

const QuizitContext = createContext();

export const QuizitProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Custom function to update selectedBook
  const addNewSession = (session) => {
    if (sessions.length > 2) {
      sessions.shift();
    }
    setSessions((prevSessions) => [...prevSessions, session]);
  };

  const updateCurrentSessionLRU = (session) => {
    setCurrentSession(session);
    setSessions((prevSessions) => {
      const updatedSessions = prevSessions.filter(s => s.id !== session.id);
      return [...updatedSessions, session];
    });
  }

  return (
    <QuizitContext.Provider 
      value={{ 
          sessions, 
          setSessions: addNewSession,
          currentSession, 
          setCurrentSession: updateCurrentSessionLRU,
      }}>
      {children}
    </QuizitContext.Provider>
  );
};

export const useQuizit = () => useContext(QuizitContext);
