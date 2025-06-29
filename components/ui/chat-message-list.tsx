import React from "react";

export const ChatMessageList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-3 w-full">{children}</div>
);

export default ChatMessageList; 