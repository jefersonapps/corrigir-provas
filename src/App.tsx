import React, {
  useState,
  useRef,
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { useNavigate, useLocation } from "react-router";
import jsPDF from "jspdf";
import autoTable, {
  type FontStyle,
  type HAlignType,
  type HookData,
} from "jspdf-autotable";
import Papa from "papaparse";
import { toast } from "sonner";
import PDF from "./components/icons/pdf";
import CSV from "./components/icons/csv";
import Upload from "./components/icons/upload";
import Edit from "./components/icons/edit";
import Trash from "./components/icons/trash";
import { Github } from "lucide-react";

const OPCOES_RESPOSTA = ["A", "B", "C", "D", "E"];

interface Aluno {
  nome: string;
  respostas: string[];
}

interface ProvaContextType {
  numQuestoes: number;
  gabarito: string[];
  alunos: Aluno[];
  disciplina: string;
  serie: string;
  setDisciplina: (value: string) => void;
  setSerie: (value: string) => void;

  setNumQuestoes: (value: number) => void;
  setGabarito: (value: string[]) => void;
  setAlunos: (value: Aluno[]) => void;

  adicionarQuestao: () => void;
  removerQuestao: () => void;
  handleGabaritoChange: (index: number, value: string) => void;
  adicionarAlunoNaLista: (nome: string, respostas: string[]) => void;
  editarAluno: (index: number, aluno: Aluno) => void;
  removerAluno: (index: number) => void;
  limparAlunos: () => void;
  resetarProva: () => void;
}

const ProvaContext = createContext<ProvaContextType | undefined>(undefined);

const useProva = () => {
  const context = useContext(ProvaContext);
  if (!context) {
    throw new Error("useProva deve ser usado dentro de um ProvaProvider");
  }
  return context;
};

const Stepper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { disciplina, serie } = useProva();

  const steps = [
    { path: "/", label: "Gabarito" },
    { path: "/alunos", label: "Alunos" },
    { path: "/resultados", label: "Resultados" },
  ];

  const currentIndex = steps.findIndex((s) => s.path === location.pathname);

  const getStepStatus = (stepIndex: number) => {
    if (currentIndex === stepIndex) return "active";
    return stepIndex < currentIndex ? "completed" : "inactive";
  };

  const handleStepClick = (stepIndex: number, stepPath: string) => {
    if (stepIndex < currentIndex) {
      navigate(stepPath);
      return;
    }

    if (stepIndex === currentIndex + 1) {
      if (currentIndex === 0) {
        if (disciplina.trim() === "" || serie.trim() === "") {
          toast.error(
            "Por favor, preencha o nome da disciplina e a série para continuar."
          );
          return;
        }
      }

      navigate(stepPath);
    }
  };

  return (
    <nav className="flex items-center justify-center mb-8 flex-wrap">
      {steps.map((step, index) => {
        const status = getStepStatus(index);

        const isClickable = index < currentIndex || index === currentIndex + 1;

        return (
          <React.Fragment key={step.path}>
            <div
              className={`flex items-center p-2 transition-transform transform hover:scale-105 ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={() => isClickable && handleStepClick(index, step.path)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all
                  ${
                    status === "active"
                      ? "bg-indigo-600 text-white scale-110 shadow-lg"
                      : ""
                  }
                  ${status === "completed" ? "bg-emerald-500 text-white" : ""}
                  ${
                    status === "inactive" ? "bg-slate-200 text-slate-500" : ""
                  }`}
              >
                {index + 1}
              </div>
              <span
                className={`hidden sm:block ml-3 font-semibold ${
                  status === "active" ? "text-indigo-700" : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-auto border-t-2 transition-colors mx-2 sm:mx-4 ${
                  status === "completed"
                    ? "border-emerald-500"
                    : "border-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

const Card: React.FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
    <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200">
      {title}
    </h2>
    {children}
  </div>
);

const LOCAL_STORAGE_KEY = "provaCorretorData";

const ESTADO_PADRAO = {
  numQuestoes: 22,
  gabarito: Array(22).fill(""),
  alunos: [],
  disciplina: "",
  serie: "",
};

const carregarEstadoInicial = () => {
  try {
    const dadosSalvos = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (dadosSalvos) {
      return JSON.parse(dadosSalvos);
    }
  } catch (error) {
    console.error("Falha ao carregar dados do localStorage", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  return ESTADO_PADRAO;
};

export const ProvaProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [numQuestoes, setNumQuestoes] = useState<number>(
    () => carregarEstadoInicial().numQuestoes
  );
  const [gabarito, setGabarito] = useState<string[]>(
    () => carregarEstadoInicial().gabarito
  );
  const [alunos, setAlunos] = useState<Aluno[]>(
    () => carregarEstadoInicial().alunos
  );
  const [disciplina, setDisciplina] = useState<string>(
    () => carregarEstadoInicial().disciplina
  );
  const [serie, setSerie] = useState<string>(
    () => carregarEstadoInicial().serie
  );

  useEffect(() => {
    const estadoParaSalvar = {
      numQuestoes,
      gabarito,
      alunos,
      disciplina,
      serie,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(estadoParaSalvar));
  }, [numQuestoes, gabarito, alunos, disciplina, serie]);

  const adicionarQuestao = () => {
    setNumQuestoes((prev) => prev + 1);
    setGabarito((prev) => [...prev, ""]);
    setAlunos((prev) =>
      prev.map((aluno) => ({ ...aluno, respostas: [...aluno.respostas, ""] }))
    );
  };

  const removerQuestao = () => {
    if (numQuestoes > 1) {
      setNumQuestoes((prev) => prev - 1);
      setGabarito((prev) => prev.slice(0, -1));
      setAlunos((prev) =>
        prev.map((aluno) => ({
          ...aluno,
          respostas: aluno.respostas.slice(0, -1),
        }))
      );
    }
  };

  const handleGabaritoChange = (index: number, value: string) => {
    const novoGabarito = [...gabarito];
    novoGabarito[index] = novoGabarito[index] === value ? "" : value;
    setGabarito(novoGabarito);
  };

  const adicionarAlunoNaLista = (nome: string, respostas: string[]) => {
    setAlunos((prevAlunos) => [...prevAlunos, { nome, respostas }]);
  };

  const editarAluno = (index: number, alunoAtualizado: Aluno) => {
    setAlunos((prevAlunos) =>
      prevAlunos.map((aluno, i) => (i === index ? alunoAtualizado : aluno))
    );
  };

  const removerAluno = (index: number) => {
    setAlunos((prevAlunos) => prevAlunos.filter((_, i) => i !== index));
  };

  const limparAlunos = () => setAlunos([]);

  const resetarProva = () => {
    setNumQuestoes(ESTADO_PADRAO.numQuestoes);
    setGabarito(ESTADO_PADRAO.gabarito);
    setAlunos(ESTADO_PADRAO.alunos);
    setDisciplina(ESTADO_PADRAO.disciplina);
    setSerie(ESTADO_PADRAO.serie);
  };

  return (
    <ProvaContext.Provider
      value={{
        numQuestoes,
        gabarito,
        alunos,
        disciplina,
        serie,
        setDisciplina,
        setSerie,
        setNumQuestoes,
        setGabarito,
        setAlunos,
        adicionarQuestao,
        removerQuestao,
        handleGabaritoChange,
        adicionarAlunoNaLista,
        editarAluno,
        removerAluno,
        limparAlunos,
        resetarProva,
      }}
    >
      <div className="container mx-auto p-4 md:p-8 font-sans bg-slate-50 min-h-screen">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 flex-col sm:flex-row">
            <img src="/logo.png" alt="Logo do app" className="size-10" />{" "}
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Corretor de Provas Automático
            </h1>
          </div>
          <p className="text-slate-500 mt-2">
            Simplifique a correção de provas de múltipla escolha.
          </p>
        </header>
        <Stepper />
        <main>{children}</main>
        <footer className="w-full mt-6 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5">
            Created by
            <a
              href="http://github.com/jefersonapps"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Github size={14} /> Jeferson Leite
            </a>
            .
          </p>
        </footer>
      </div>
    </ProvaContext.Provider>
  );
};

interface AnswerSelectorProps {
  questionIndex: number;
  selectedValue: string;
  onSelect: (index: number, value: string) => void;
  isGabarito?: boolean;
  correctAnswer?: string;
}

const AnswerSelector: React.FC<AnswerSelectorProps> = ({
  questionIndex,
  selectedValue,
  onSelect,
  isGabarito = false,
  correctAnswer = "",
}) => {
  return (
    <div className="flex gap-2 items-center">
      {OPCOES_RESPOSTA.map((option) => {
        let style = "bg-slate-200 text-slate-700 hover:bg-slate-300";
        if (option === selectedValue) {
          if (isGabarito) {
            style = "bg-emerald-500 text-white shadow-md";
          } else {
            if (correctAnswer && selectedValue === correctAnswer) {
              style = "bg-emerald-500 text-white shadow-md";
            } else if (correctAnswer) {
              style = "bg-red-500 text-white shadow-md";
            } else {
              style = "bg-slate-400 text-white";
            }
          }
        }
        return (
          <button
            key={option}
            onClick={() => onSelect(questionIndex, option)}
            className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg transition-all text-sm transform hover:scale-110 ${style}`}
          >
            {option}
          </button>
        );
      })}

      {!isGabarito && (
        <>
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <button
            onClick={() => onSelect(questionIndex, "-")}
            className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg transition-all text-sm transform hover:scale-110 ${
              selectedValue === "-"
                ? "bg-slate-500 text-white shadow-md"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            -
          </button>
        </>
      )}
    </div>
  );
};

const QuestionGrid: React.FC<{
  total: number;
  values: string[];
  onChange: (index: number, value: string) => void;
  isGabarito?: boolean;
  gabaritoRef?: string[];
}> = ({ total, values, onChange, isGabarito = false, gabaritoRef }) => {
  const midpoint = Math.ceil(total / 2);

  const renderSelector = (index: number) => (
    <div
      key={index}
      className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-slate-100"
    >
      <span className="font-bold text-slate-600 w-10 text-center text-base">
        {index + 1}.
      </span>
      <AnswerSelector
        questionIndex={index}
        selectedValue={values[index]}
        onSelect={onChange}
        isGabarito={isGabarito}
        correctAnswer={gabaritoRef ? gabaritoRef[index] : ""}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-2">
        {Array.from({ length: midpoint }).map((_, i) => renderSelector(i))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: total - midpoint }).map((_, i) =>
          renderSelector(i + midpoint)
        )}
      </div>
    </div>
  );
};

export const PaginaGabarito: React.FC = () => {
  const {
    numQuestoes,
    gabarito,
    adicionarQuestao,
    removerQuestao,
    handleGabaritoChange,
    alunos,
    disciplina,
    setDisciplina,
    serie,
    setSerie,
    setNumQuestoes,
    setGabarito,
    setAlunos,
  } = useProva();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProximo = () => {
    if (disciplina.trim() === "" || serie.trim() === "") {
      toast.error(
        "Por favor, preencha o nome da disciplina e a série para continuar."
      );
      return;
    }
    navigate("/alunos");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    Papa.parse<string[]>(file, {
      complete: (results) => {
        try {
          const data = results.data;

          const disciplinaRow = data.find((row) => row[0] === "Disciplina");
          const serieRow = data.find((row) => row[0] === "Serie");
          const gabaritoRow = data.find((row) => row[0] === "Gabarito");
          const headerRowIndex = data.findIndex((row) => row[0] === "Alunos");

          if (
            !disciplinaRow ||
            !serieRow ||
            !gabaritoRow ||
            headerRowIndex === -1
          ) {
            throw new Error(
              "Formato do CSV inválido. Certifique-se de que o arquivo contém as linhas 'Disciplina', 'Serie', 'Gabarito' e 'Alunos'."
            );
          }

          const importedDisciplina = disciplinaRow[1] || "";
          const importedSerie = serieRow[1] || "";
          const importedGabarito = gabaritoRow.slice(1);

          const importedAlunos: Aluno[] = [];
          const alunosData = data.slice(headerRowIndex + 1);

          for (const alunoRow of alunosData) {
            if (alunoRow.length > 1 && alunoRow[0]) {
              const nome = alunoRow[0];
              const respostas = alunoRow.slice(1, 1 + importedGabarito.length);
              importedAlunos.push({ nome, respostas });
            }
          }

          setDisciplina(importedDisciplina);
          setSerie(importedSerie);
          setNumQuestoes(importedGabarito.length);
          setGabarito(importedGabarito);
          setAlunos(importedAlunos);

          toast.success("Dados importados com sucesso!");
        } catch (error) {
          if (error instanceof Error) {
            toast.error(`Falha ao importar: ${error.message}`);
          } else {
            toast.error("Ocorreu um erro desconhecido ao processar o arquivo.");
          }
        } finally {
          if (event.target) {
            event.target.value = "";
          }
        }
      },
      error: (error) => {
        toast.error(`Erro ao ler o arquivo CSV: ${error.message}`);
      },
    });
  };

  return (
    <Card title="1. Definição do Gabarito">
      <div className="flex justify-end mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".csv"
          className="hidden"
        />
        <button
          onClick={handleImportClick}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg text-base font-semibold hover:bg-teal-600 transition-transform transform hover:scale-105 shadow-md flex items-center gap-2"
        >
          <Upload width={18} /> Importar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label
            htmlFor="discipline-name"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Nome da Disciplina
          </label>
          <input
            id="discipline-name"
            type="text"
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
            placeholder="Ex: Língua Portuguesa"
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-base"
          />
        </div>
        <div>
          <label
            htmlFor="class-name"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Série / Turma
          </label>
          <input
            id="class-name"
            type="text"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            placeholder="Ex: 5º Ano B"
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-base"
          />
        </div>
      </div>

      {alunos.length > 0 && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-md">
          <p className="font-bold">Atenção</p>
          <p>
            Alterar o gabarito afetará a nota dos{" "}
            <b>{alunos.length} aluno(s)</b> já cadastrados.
          </p>
        </div>
      )}

      <div className="flex items-center mb-6 bg-slate-100 p-3 rounded-lg">
        <label className="mr-4 font-semibold text-slate-700">
          Número de Questões: {numQuestoes}
        </label>
        <button
          onClick={adicionarQuestao}
          className="bg-indigo-500 text-white w-8 h-8 rounded-full hover:bg-indigo-600 transition-all mr-2 flex items-center justify-center text-xl font-bold transform hover:scale-110 shadow"
        >
          +
        </button>
        <button
          onClick={removerQuestao}
          className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-all flex items-center justify-center text-xl font-bold transform hover:scale-110 shadow"
        >
          -
        </button>
      </div>

      <QuestionGrid
        total={numQuestoes}
        values={gabarito}
        onChange={handleGabaritoChange}
        isGabarito={true}
      />

      <div className="text-right mt-8 border-t border-slate-200 pt-6">
        <button
          onClick={handleProximo}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-md flex items-center gap-2 ml-auto"
        >
          Próximo: Cadastrar Alunos <span>&rarr;</span>
        </button>
      </div>
    </Card>
  );
};

export const PaginaAlunos: React.FC = () => {
  const {
    numQuestoes,
    gabarito,
    alunos,
    adicionarAlunoNaLista,
    editarAluno,
    removerAluno,
  } = useProva();
  const navigate = useNavigate();

  const [novoNome, setNovoNome] = useState("");
  const [novasRespostas, setNovasRespostas] = useState<string[]>(
    Array(numQuestoes).fill("")
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setNovasRespostas((prev) => {
      const diff = numQuestoes - prev.length;
      if (diff > 0) return [...prev, ...Array(diff).fill("")];
      if (diff < 0) return prev.slice(0, numQuestoes);
      return prev;
    });
  }, [numQuestoes]);

  const handleRespostaLocalChange = (index: number, value: string) => {
    setNovasRespostas((prev) => {
      const atualizado = [...prev];
      atualizado[index] = atualizado[index] === value ? "" : value;
      return atualizado;
    });
  };

  const limparFormulario = () => {
    setNovoNome("");
    setNovasRespostas(Array(numQuestoes).fill(""));
    setEditingIndex(null);
  };

  const handleSalvarOuAtualizar = () => {
    if (novoNome.trim() === "") {
      toast.error("Por favor, insira o nome do aluno.");
      return;
    }

    if (editingIndex !== null) {
      editarAluno(editingIndex, { nome: novoNome, respostas: novasRespostas });
      toast.success(`Aluno "${novoNome}" atualizado com sucesso!`);
    } else {
      adicionarAlunoNaLista(novoNome, novasRespostas);
      toast.success(`Aluno "${novoNome}" cadastrado com sucesso!`);
    }
    limparFormulario();
  };

  const handleEditar = (index: number) => {
    const aluno = alunos[index];
    setNovoNome(aluno.nome);
    setNovasRespostas(aluno.respostas);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemover = (index: number, nome: string) => {
    toast("Tem certeza que deseja excluir este aluno?", {
      action: {
        label: "Excluir",
        onClick: () => {
          removerAluno(index);
          toast.success(`Aluno "${nome}" removido.`);
          if (editingIndex === index) {
            limparFormulario();
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => setEditingIndex(null),
      },
    });
  };

  const handleNavigateToResults = () => {
    if (editingIndex !== null) {
      toast.warning(
        "Você está editando um aluno. Clique em 'Atualizar Aluno' ou 'Cancelar Edição' antes de prosseguir."
      );
      return;
    }
    navigate("/resultados");
  };

  const isEditing = editingIndex !== null;

  return (
    <Card title={isEditing ? "Editando Aluno" : "2. Cadastro de Alunos"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <label
            htmlFor="student-name"
            className="block text-sm font-medium text-slate-600 mb-1"
          >
            Nome do Aluno
          </label>
          <input
            id="student-name"
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Digite o nome completo"
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-base"
          />
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium text-center">
          Total Cadastrado:{" "}
          <strong className="text-xl text-indigo-600">{alunos.length}</strong>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        {isEditing
          ? "Altere as respostas do aluno abaixo."
          : "Preencha as respostas do aluno. O feedback de acerto é instantâneo."}
      </p>

      <QuestionGrid
        total={numQuestoes}
        values={novasRespostas}
        onChange={handleRespostaLocalChange}
        gabaritoRef={gabarito}
      />

      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
        >
          <span>&larr;</span> Voltar para Gabarito
        </button>
        <div className="flex items-center gap-4">
          {isEditing && (
            <button
              onClick={limparFormulario}
              className="w-full sm:w-auto bg-slate-500 text-white px-6 py-3 rounded-md hover:bg-slate-600 transition-colors font-bold text-base shadow-lg"
            >
              Cancelar Edição
            </button>
          )}
          <button
            onClick={handleSalvarOuAtualizar}
            className={`w-full sm:w-auto px-6 py-3 rounded-md text-white font-bold text-base shadow-lg transition-colors
              ${
                isEditing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            {isEditing ? "Atualizar Aluno" : "+ Salvar Aluno"}
          </button>
          <button
            onClick={handleNavigateToResults}
            disabled={alunos.length === 0}
            className={`px-6 py-3 rounded-lg text-base font-semibold flex items-center gap-2 transition-all transform hover:scale-105
            ${
              alunos.length === 0
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
            }`}
          >
            Ver Resultados <span>&rarr;</span>
          </button>
        </div>
      </div>

      {alunos.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200">
            Alunos Cadastrados ({alunos.length})
          </h3>
          <div className="space-y-3">
            {alunos.map((aluno, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 rounded-lg transition-colors ${
                  editingIndex === index
                    ? "bg-indigo-100 border border-indigo-400"
                    : "bg-slate-50"
                }`}
              >
                <span className="font-medium text-slate-700">{aluno.nome}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditar(index)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    title="Editar Aluno"
                  >
                    <Edit width={20} height={20} />
                  </button>
                  <button
                    onClick={() => handleRemover(index, aluno.nome)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    title="Excluir Aluno"
                  >
                    <Trash width={20} height={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

const TabelaLegenda: React.FC = () => (
  <div
    className="p-3 rounded-lg inline-flex items-center justify-center gap-6"
    style={{ border: "1px solid #d5d5d5", backgroundColor: "#f8fafc" }}
  >
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded"
        style={{ backgroundColor: "#d5e5d5", border: "1px solid #d5d5d5" }}
      ></div>
      <span className="text-sm text-slate-600 font-medium">Resposta Certa</span>
    </div>
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded"
        style={{ backgroundColor: "#f2c0c0", border: "1px solid #d5d5d5" }}
      ></div>
      <span className="text-sm text-slate-600 font-medium">
        Resposta Errada
      </span>
    </div>
  </div>
);

export const PaginaResultados: React.FC = () => {
  const { numQuestoes, gabarito, alunos, disciplina, serie, resetarProva } =
    useProva();
  const navigate = useNavigate();
  const tabelaRef = useRef<HTMLTableElement>(null);

  const alunosOrdenados = useMemo(() => {
    return [...alunos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [alunos]);

  const tituloCompleto =
    disciplina && serie ? `${disciplina} - ${serie}` : "Resultados da Prova";

  const calcularMedia = (respostasAluno: string[]) => {
    if (numQuestoes === 0) return "0%";
    const acertos = respostasAluno.reduce(
      (acc, resposta, i) =>
        resposta &&
        gabarito[i] &&
        resposta.toUpperCase() === gabarito[i].toUpperCase()
          ? acc + 1
          : acc,
      0
    );
    return `${Math.round((acertos / numQuestoes) * 100)}%`;
  };

  const exportarParaPDF = () => {
    if (!tabelaRef.current) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let topMargin = 15;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(tituloCompleto, pageWidth / 2, topMargin, { align: "center" });
    topMargin += 10;

    const legendHeight = 12;
    const spaceBelowLegend = 5;

    const tableStartY = topMargin + legendHeight + spaceBelowLegend;

    const columnStyles: {
      [key: string]: {
        halign?: HAlignType;
        fontStyle?: FontStyle;
        cellWidth?: number | "auto";
      };
    } = { 0: { halign: "left", cellWidth: "auto" } };
    const questionColumnWidth = 8;
    for (let i = 1; i <= numQuestoes; i++) {
      columnStyles[i] = { halign: "center", cellWidth: questionColumnWidth };
    }
    columnStyles[numQuestoes + 1] = {
      halign: "center",
      fontStyle: "bold",
      cellWidth: "auto",
    };

    autoTable(doc, {
      html: tabelaRef.current,
      startY: tableStartY,
      styles: {
        font: "helvetica",
        fontSize: 9,
        valign: "middle",
        lineWidth: 0.1,
        lineColor: [213, 213, 213],
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold",
      },
      columnStyles,
      willDrawCell: () => {
        doc.setDrawColor(213, 213, 213);
      },
      didDrawPage: (data: HookData) => {
        if (data.pageNumber === 1) {
          const tableWidth = data.table.columns.reduce(
            (total, col) => total + col.width,
            0
          );
          const tableX = data.settings.margin.left;

          doc.setDrawColor(213, 213, 213);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(
            tableX,
            topMargin,
            tableWidth,
            legendHeight,
            1,
            1,
            "FD"
          );

          const legendPadding = 4;
          const squareSize = 4;
          const textFontSize = 9;
          const gapBetweenItems = 10;
          const paddingSquareText = 2;

          let contentStartX = tableX + legendPadding;
          const legendCenterY = topMargin + legendHeight / 2;
          const squareY = legendCenterY - squareSize / 2;

          doc.setFontSize(textFontSize);
          doc.setTextColor(15, 23, 42);

          doc.setDrawColor(213, 213, 213);
          doc.setFillColor(213, 229, 213);
          doc.rect(contentStartX, squareY, squareSize, squareSize, "FD");

          const text1 = "Resposta Certa";
          const text1X = contentStartX + squareSize + paddingSquareText;
          doc.text(text1, text1X, legendCenterY, { baseline: "middle" });

          const text1Width = doc.getTextWidth(text1);
          contentStartX = text1X + text1Width + gapBetweenItems;

          doc.setFillColor(242, 192, 192);
          doc.rect(contentStartX, squareY, squareSize, squareSize, "FD");

          const text2 = "Resposta Errada";
          const text2X = contentStartX + squareSize + paddingSquareText;
          doc.text(text2, text2X, legendCenterY, { baseline: "middle" });
        }
      },
      didParseCell: (data) => {
        if (data.row.section === "head" && data.column.index > 0) {
          data.cell.styles.halign = "center";
        }
        if (data.row.section === "body") {
          const isEvenRow = data.row.index % 2 === 0;
          data.cell.styles.fillColor = isEvenRow ? "#ffffff" : "#f8fafc";
          if (data.column.index > 0 && data.column.index <= numQuestoes) {
            const resposta =
              alunosOrdenados[data.row.index]?.respostas[data.column.index - 1];
            const gabaritoResp = gabarito[data.column.index - 1];
            if (resposta && gabaritoResp) {
              if (resposta.toUpperCase() === gabaritoResp.toUpperCase()) {
                data.cell.styles.fillColor = isEvenRow ? "#e0f1e0" : "#d5e5d5";
              } else {
                data.cell.styles.fillColor = isEvenRow ? "#ffcaca" : "#f2c0c0";
              }
            }
          }
        }
      },
    });
    doc.save(`${tituloCompleto.replace(/[\s/]/g, "_")}_resultados.pdf`);
    toast.info("O arquivo PDF foi gerado com sucesso!");
  };

  const exportarParaCSV = () => {
    const metaData = [
      ["Disciplina", disciplina],
      ["Serie", serie],
      ["Gabarito", ...gabarito],
    ];

    const headers = [
      "Alunos",
      ...Array.from({ length: numQuestoes }, (_, i) => `${i + 1}`),
      "MÉDIA",
    ];

    const studentData = alunosOrdenados.map((aluno) => [
      aluno.nome,
      ...aluno.respostas,
      calcularMedia(aluno.respostas),
    ]);

    const dataToExport = [...metaData, [], headers, ...studentData];

    const csv = Papa.unparse(dataToExport, {
      header: false,
    });

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "resultados_provas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("O arquivo CSV foi gerado com sucesso!");
  };

  const handleResetarProva = () => {
    toast.error("Apagar todos os dados?", {
      description:
        "Esta ação limpará o gabarito, alunos e informações da prova.",
      action: {
        label: "Apagar",
        onClick: () => {
          resetarProva();
          toast.success("Todos os dados foram resetados!");
          navigate("/");
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  if (alunos.length === 0) {
    return (
      <div className="text-center mt-16 p-8 bg-white rounded-lg shadow-md border">
        <div className="text-6xl mb-4">🤷‍♂️</div>
        <h2 className="text-2xl text-slate-700 font-semibold mb-4">
          Nenhum aluno foi cadastrado ainda.
        </h2>
        <p className="text-slate-500 mb-6">
          Volte para a etapa anterior para adicionar os alunos e suas respostas.
        </p>
        <button
          onClick={() => navigate("/alunos")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          Cadastrar Alunos
        </button>
      </div>
    );
  }

  return (
    <Card title="3. Resultados Finais">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-slate-700">{tituloCompleto}</h3>
        <div className="flex gap-3">
          <button
            onClick={exportarParaPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <PDF width={18} /> Exportar PDF
          </button>
          <button
            onClick={exportarParaCSV}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <CSV width={18} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <TabelaLegenda />
      </div>

      <div
        className="overflow-x-auto rounded-lg"
        style={{ border: "1px solid #d5d5d5" }}
      >
        <table ref={tabelaRef} className="min-w-full bg-white">
          <thead className="bg-slate-100">
            <tr>
              <th
                className="py-3 px-4 text-left font-bold text-slate-700 whitespace-nowrap sticky left-0 bg-slate-100 z-10"
                style={{ borderBottom: "2px solid #d5d5d5" }}
              >
                Alunos ({alunos.length})
              </th>
              {Array.from({ length: numQuestoes }, (_, i) => (
                <th
                  key={i}
                  className="py-3 px-2 text-center font-bold text-slate-700 min-w-[40px]"
                  style={{
                    borderLeft: "1px solid #d5d5d5",
                    borderBottom: "2px solid #d5d5d5",
                  }}
                >
                  {i + 1}
                </th>
              ))}
              <th
                className="py-3 px-4 text-center font-bold text-slate-700"
                style={{
                  borderLeft: "2px solid #d5d5d5",
                  borderBottom: "2px solid #d5d5d5",
                }}
              >
                MÉDIA
              </th>
            </tr>
          </thead>
          <tbody>
            {alunosOrdenados.map((aluno, alunoIndex) => {
              const isEvenRow = alunoIndex % 2 === 0;
              const rowBgColor = isEvenRow ? "#ffffff" : "#f8fafc";

              return (
                <tr
                  key={aluno.nome}
                  style={{
                    backgroundColor: rowBgColor,
                    borderBottom: "1px solid #d5d5d5",
                  }}
                >
                  <td
                    className="py-2 px-4 whitespace-nowrap font-medium text-slate-800 sticky left-0 z-10"
                    style={{ backgroundColor: rowBgColor }}
                  >
                    {aluno.nome}
                  </td>
                  {Array.from({ length: numQuestoes }).map((_, respIndex) => {
                    const resposta = aluno.respostas[respIndex];
                    const gabaritoResp = gabarito[respIndex];
                    const isCorrect =
                      resposta && gabaritoResp && resposta === gabaritoResp;
                    const isWrong =
                      resposta && gabaritoResp && resposta !== gabaritoResp;

                    let cellBgColor = undefined;
                    if (isCorrect) {
                      cellBgColor = isEvenRow ? "#e0f1e0" : "#d5e5d5";
                    } else if (isWrong) {
                      cellBgColor = isEvenRow ? "#ffcaca" : "#f2c0c0";
                    }

                    return (
                      <td
                        key={respIndex}
                        className="py-2 px-2 text-center font-bold text-slate-800"
                        style={{
                          backgroundColor: cellBgColor,
                          borderLeft: "1px solid #d5d5d5",
                        }}
                      >
                        {resposta || "-"}
                      </td>
                    );
                  })}
                  <td
                    className="py-2 px-4 text-center font-bold text-slate-900"
                    style={{
                      borderLeft: "2px solid #d5d5d5",
                    }}
                  >
                    {calcularMedia(aluno.respostas)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate("/alunos")}
          className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
        >
          <span>&larr;</span> Voltar e Editar Alunos
        </button>

        <button
          onClick={handleResetarProva}
          className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 font-medium flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
        >
          <Trash width={16} />
          Resetar Prova
        </button>
      </div>
    </Card>
  );
};
