import { createContext, useState, useEffect } from "react";
import { obtenerProgresoUsuario } from "../servicios/progresoService";
import { useAuth } from "./AuthContext";

export const ProgresoContext = createContext();

export const ProgresoProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [progresoGlobal, setProgresoGlobal] = useState({});
  const [nivelesAprobadosGlobal, setNivelesAprobadosGlobal] = useState({});
  const [progresoCursos, setProgresoCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     🔄 Cargar progreso desde backend
  =============================== */
  const cargarProgreso = async () => {
    if (!isAuthenticated || !user || user.rol === "admin") {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await obtenerProgresoUsuario();

      if (res.ok && Array.isArray(res.data)) {
        const progresoObj = {};
        const nivelesObj = {};

        res.data.forEach((curso) => {
          progresoObj[curso.cursoId] = curso.leccionesCompletadas || [];
          nivelesObj[curso.cursoId] = curso.nivelesAprobados || [];
        });

        setProgresoGlobal(progresoObj);
        setNivelesAprobadosGlobal(nivelesObj);
        setProgresoCursos(res.data);
      }
    } catch (error) {
      console.error("❌ Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     ➕ Actualizar progreso local (lección)
  =============================== */
  const actualizarProgreso = (cursoId, leccionId) => {
    setProgresoGlobal((prev) => {
      const prevCurso = prev[cursoId] || [];
      if (prevCurso.includes(leccionId)) return prev;

      return {
        ...prev,
        [cursoId]: [...prevCurso, leccionId],
      };
    });
  };

  /* ===============================
     ✅ Actualizar niveles aprobados localmente
  =============================== */
  const actualizarNivelesAprobados = (cursoId, nivelNumero) => {
    setNivelesAprobadosGlobal((prev) => {
      const prevNiveles = prev[cursoId] || [];
      if (prevNiveles.includes(nivelNumero)) return prev;

      return {
        ...prev,
        [cursoId]: [...prevNiveles, nivelNumero],
      };
    });
  };

  useEffect(() => {
    cargarProgreso();
  }, [user, isAuthenticated]);

  return (
    <ProgresoContext.Provider
      value={{
        progresoGlobal,
        nivelesAprobadosGlobal,
        progresoCursos,
        actualizarProgreso,
        actualizarNivelesAprobados, // 🔑 nuevo método
        recargarProgreso: cargarProgreso,
        loading,
      }}
    >
      {children}
    </ProgresoContext.Provider>
  );
};
