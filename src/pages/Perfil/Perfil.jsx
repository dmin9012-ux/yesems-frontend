import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Trash2,
  Edit,
  LogOut,
  BookOpen,
  FileText,
} from "lucide-react";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import ModalPassword from "./ModalPassword";
import ModalEditarPerfil from "./ModalEditarPerfil";

import { useAuth } from "../../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ProgresoContext } from "../../context/ProgresoContext";

import "./PerfilStyle.css";

const Perfil = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { progresoGlobal } = useContext(ProgresoContext);

  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);

  /* ===============================
     🔄 CARGAR PERFIL Y CURSOS
  =============================== */
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const perfilRes = await apiYesems.get("/usuario/perfil/me");
        setUsuario(perfilRes.data.usuario);

        const snap = await getDocs(collection(db, "cursos"));
        const cursosFirebase = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setCursos(cursosFirebase);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, [logout, navigate]);

  /* ===============================
     📊 PROGRESO
  =============================== */
  const calcularProgreso = (curso) => {
    const completadas = progresoGlobal[curso.id] || [];

    let total = 0;
    curso.niveles.forEach((n) => {
      total += n.lecciones.length;
    });

    const porcentaje = total
      ? Math.round((completadas.length / total) * 100)
      : 0;

    return {
      porcentaje,
      completadas: completadas.length,
      total,
      estado:
        porcentaje === 0
          ? "no-iniciado"
          : porcentaje === 100
          ? "completado"
          : "en-progreso",
    };
  };

  /* ===============================
     📄 CONSTANCIA
  =============================== */
  const descargarConstancia = async (cursoId, nombreCurso) => {
    try {
      const res = await apiYesems.get(`/constancia/${cursoId}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Constancia-${nombreCurso}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando constancia:", error);
      alert("No se pudo descargar la constancia");
    }
  };

  /* ===============================
     🗑 ELIMINAR CUENTA (CORREGIDO)
  =============================== */
  const eliminarCuenta = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    try {
      await apiYesems.delete("/usuario/perfil/me");

      alert("✅ Cuenta eliminada correctamente");

      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      alert("❌ No se pudo eliminar la cuenta");
    }
  };

  if (loading) return <p className="perfil-cargando">Cargando...</p>;
  if (!usuario) return null;

  return (
    <>
      <TopBar />

      <div className="perfil-page">
        {/* ================= SIDEBAR ================= */}
        <aside className="perfil-sidebar">
          <div className="perfil-avatar">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>

          <h3>{usuario.nombre}</h3>

          <p className="perfil-email">
            <Mail size={14} /> {usuario.email}
          </p>

          <button onClick={() => setShowEditarPerfil(true)}>
            <Edit size={16} /> Editar Perfil
          </button>

          <button onClick={() => setShowPasswordModal(true)}>
            <Lock size={16} /> Cambiar Contraseña
          </button>

          <button className="danger" onClick={eliminarCuenta}>
            <Trash2 size={16} /> Eliminar Cuenta
          </button>

          <button
            className="logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="perfil-main">
          <h2>
            <BookOpen size={20} /> Mis Cursos
          </h2>

          {cursos.map((curso) => {
            const p = calcularProgreso(curso);

            return (
              <div key={curso.id} className={`curso-card ${p.estado}`}>
                <div className="curso-header">
                  <strong>{curso.nombre}</strong>
                  <span>
                    {p.estado === "completado"
                      ? "✅ Completado"
                      : p.estado === "en-progreso"
                      ? "🕒 En progreso"
                      : "⚪ No iniciado"}
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${p.porcentaje}%` }}
                  />
                </div>

                <small>
                  {p.completadas}/{p.total} lecciones ({p.porcentaje}%)
                </small>

                {p.estado !== "completado" ? (
                  <button
                    className="btn-continuar"
                    onClick={() => navigate(`/curso/${curso.id}`)}
                  >
                    ▶ Continuar curso
                  </button>
                ) : (
                  <button
                    className="btn-constancia"
                    onClick={() =>
                      descargarConstancia(curso.id, curso.nombre)
                    }
                  >
                    <FileText size={16} /> Descargar constancia
                  </button>
                )}
              </div>
            );
          })}
        </main>
      </div>

      {showPasswordModal && (
        <ModalPassword onClose={() => setShowPasswordModal(false)} />
      )}

      {showEditarPerfil && (
        <ModalEditarPerfil
          usuario={usuario}
          setUsuario={setUsuario}
          onClose={() => setShowEditarPerfil(false)}
          onChangePassword={() => setShowPasswordModal(true)}
        />
      )}
    </>
  );
};

export default Perfil;
