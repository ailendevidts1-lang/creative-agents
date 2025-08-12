import React from "react";

const NotFound: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <a href="/" className="underline">Go home</a>
      </div>
    </main>
  );
};

export default NotFound;
