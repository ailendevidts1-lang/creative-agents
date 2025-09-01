import React, { useState } from "react";
import { Navigation } from "./Navigation";
import { HomePage } from "@/pages/HomePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StudioPage } from "@/pages/StudioPage";

type Page = "home" | "projects" | "settings" | "studio";

export function MainLayout() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const navigateToStudio = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentPage("studio");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigateToStudio={navigateToStudio} />;
      case "projects":
        return <ProjectsPage onNavigateToStudio={navigateToStudio} />;
      case "settings":
        return <SettingsPage />;
      case "studio":
        return currentProjectId ? <StudioPage projectId={currentProjectId} onNavigateBack={() => setCurrentPage("home")} /> : <HomePage onNavigateToStudio={navigateToStudio} />;
      default:
        return <HomePage onNavigateToStudio={navigateToStudio} />;
    }
  };

  return (
    <div className="flex h-screen">
      {currentPage !== "studio" && <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />}
      <main className={`flex-1 overflow-auto ${currentPage === "studio" ? "w-full" : ""}`}>
        {renderPage()}
      </main>
    </div>
  );
}