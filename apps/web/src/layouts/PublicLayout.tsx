import { Outlet } from "react-router-dom";

import { LanguagePromptModal } from "../components/LanguagePromptModal";

export function PublicLayout() {
  return (
    <>
      <LanguagePromptModal />
      <Outlet />
    </>
  );
}
