import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";

import {
  ProvaProvider,
  PaginaGabarito,
  PaginaAlunos,
  PaginaResultados,
} from "./App.tsx";

import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProvaProvider>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<PaginaGabarito />} />

          <Route path="/alunos" element={<PaginaAlunos />} />

          <Route path="/resultados" element={<PaginaResultados />} />
        </Routes>
      </ProvaProvider>
    </BrowserRouter>
  </StrictMode>
);
