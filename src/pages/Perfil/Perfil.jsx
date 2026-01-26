import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Trash2, Edit, LogOut, BookOpen, FileText, ShieldCheck, Award } from "lucide-react";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import ModalPassword from "./ModalPassword";
import ModalEditarPerfil from "./ModalEditarPerfil";

import { useAuth } from "../../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ProgresoContext } from "../../context/ProgresoContext";
import { notify, confirmDialog } from "../../Util/toast";

import "./PerfilStyle.css";

const Perfil = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { progresoCursos, recargarProgreso } = useContext(ProgresoContext);

  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        const perfilRes = await apiYesems.get("/usuario/perfil/me");
        setUsuario(perfilRes.data.usuario);

        const snap = await getDocs(collection(db, "cursos"));
        const cursosFirebase = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCursos(cursosFirebase);

        await recargarProgreso();
      } catch (error) {
        console.error("Error cargando perfil:", error);
        if (error.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, [logout, navigate, recargarProgreso]);

  const calcularProgreso = (curso) => {
    const progresoDB = progresoCursos.find((c) => c.cursoId === curso.id);
    const leccionesCompletadas = progresoDB ? progresoDB.leccionesCompletadas : [];
    const totalLecciones = curso.niveles?.reduce((acc, n) => acc + (n.lecciones?.length || 0), 0) || 0;
    const porcentaje = totalLecciones > 0 ? Math.round((leccionesCompletadas.length / totalLecciones) * 100) : 0;
    const cursoCompletadoDB = progresoDB?.completado || false;

    return {
      porcentaje,
      completadas: leccionesCompletadas.length,
      total: totalLecciones,
      estado: porcentaje === 0 ? "no-iniciado" : cursoCompletadoDB ? "completado" : "en-progreso",
      completado: cursoCompletadoDB,
      constanciaEmitida: progresoDB?.constanciaEmitida || false,
    };
  };

  const descargarConstancia = async (cursoId, nombreCurso) => {
    try {
      const res = await apiYesems.get(`/constancia/${cursoId}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Constancia-${nombreCurso}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      notify("success", "Descargando constancia...");
    } catch (error) {
      notify("info", "La constancia se está procesando. Reintenta en unos minutos.");
    }
  };

  const eliminarCuenta = async () => {
    const result = await confirmDialog(
      "¿Eliminar cuenta permanentemente?",
      "Esta acción es irreversible y perderás todo tu historial académico y certificados.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiYesems.delete("/usuario/perfil/me");
        notify("success", "Tu cuenta ha sido eliminada.");
        logout();
        navigate("/login");
      } catch (error) {
        notify("error", "No se pudo eliminar la cuenta");
      }
    }
  };

  if (loading) return (
    <div className="perfil-cargando">
      <div className="spinner-yes"></div>
      <p>Sincronizando tu historial...</p>
    </div>
  );
  
  if (!usuario) return null;

  return (
    <>
      <TopBar />
      <div className="perfil-layout">
        
        {/* SIDEBAR UNIFICADO YES EMS */}
        <aside className="perfil-sidebar">
          <div className="sidebar-profile-info">
            <div className="avatar-large">
              {usuario.nombre?.charAt(0).toUpperCase()}
            </div>
            <h3>{usuario.nombre}</h3>
            <span className="user-role-tag">
              {usuario.rol === "admin" ? "Administrador" : "Estudiante"}
            </span>
            <p className="perfil-email"><Mail size={14} /> {usuario.email}</p>
          </div>

          <nav className="profile-nav">
            <button className="nav-item active" onClick={() => setShowEditarPerfil(true)}>
              <Edit size={18} /> <span>Editar Perfil</span>
            </button>

            <button className="nav-item" onClick={() => setShowPasswordModal(true)}>
              <Lock size={18} /> <span>Seguridad</span>
            </button>

            <div className="nav-divider"></div>

            <button className="nav-item logout-item" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={18} /> <span>Cerrar Sesión</span>
            </button>

            <button className="nav-item delete-item" onClick={eliminarCuenta}>
              <Trash2 size={18} /> <span>Eliminar Cuenta</span>
            </button>
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL DE CURSOS */}
        <main className="perfil-main">
          <div className="perfil-main-header">
            <div className="header-title-box">
              <Award size={32} color="#fcb424" />
              <div>
                <h2>Mi Progreso Académico</h2>
                <p>Gestiona tus cursos activos y descarga tus certificados oficiales.</p>
              </div>
            </div>
          </div>

          <div className="cursos-list">
            {cursos.length === 0 && (
              <div className="no-data-card">
                <BookOpen size={48} />
                <p>Aún no te has inscrito en ningún curso.</p>
                <button onClick={() => navigate("/principal")}>Explorar Catálogo</button>
              </div>
            )}
            
            {cursos.map((curso) => {
              const p = calcularProgreso(curso);
              return (
                <div key={curso.id} className={`perfil-curso-card ${p.estado}`}>
                  <div className="curso-card-body">
                    <div className="curso-header-info">
                      <div className="curso-title-group">
                        <strong className="curso-name">{curso.nombre}</strong>
                        <span className={`status-badge ${p.estado}`}>
                          {p.completado ? "Completado" : p.porcentaje > 0 ? "En Progreso" : "Pendiente"}
                        </span>
                      </div>
                    </div>

                    <div className="curso-progress-section">
                      <div className="progress-text-info">
                        <span>{p.porcentaje}% Completado</span>
                        <span className="lecciones-count">{p.completadas} de {p.total} lecciones</span>
                      </div>
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar-inner" style={{ width: `${p.porcentaje}%` }} />
                      </div>
                    </div>

                    <div className="curso-card-actions">
                      {p.completado && p.constanciaEmitida ? (
                        <button className="btn-action-download" onClick={() => descargarConstancia(curso.id, curso.nombre)}>
                          <FileText size={18} /> Descargar Certificado
                        </button>
                      ) : (
                        <button className="btn-action-continue" onClick={() => navigate(`/curso/${curso.id}`)}>
                          {p.porcentaje > 0 ? "Continuar Aprendiendo" : "Empezar Curso"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {showPasswordModal && <ModalPassword onClose={() => setShowPasswordModal(false)} />}
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