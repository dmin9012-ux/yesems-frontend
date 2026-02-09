import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Trash2, Edit, LogOut, BookOpen, FileText, ChevronRight, Award, User } from "lucide-react";

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
    
    // Sumar todas las lecciones de todos los niveles del curso
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
      notify("info", "Preparando tu documento oficial...");
      const res = await apiYesems.get(`/constancia/${cursoId}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificado-${nombreCurso}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      notify("success", "¡Certificado descargado!");
    } catch (error) {
      notify("info", "Estamos terminando de sellar tu certificado. Intenta en un momento.");
    }
  };

  const eliminarCuenta = async () => {
    const result = await confirmDialog(
      "¿Deseas eliminar tu cuenta?",
      "Esta acción borrará todo tu historial y certificados obtenidos de forma permanente.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiYesems.delete("/usuario/perfil/me");
        notify("success", "Cuenta eliminada correctamente.");
        logout();
        navigate("/login");
      } catch (error) {
        notify("error", "Error al intentar eliminar la cuenta.");
      }
    }
  };

  if (loading) return (
    <div className="perfil-loading">
      <div className="dash-spinner"></div>
      <p>Organizando tu escritorio académico...</p>
    </div>
  );

  if (!usuario) return null;

  return (
    <>
      <TopBar />
      <div className="perfil-layout">
        <aside className="perfil-sidebar">
          <div className="user-profile-summary">
            <div className="avatar-circle">
              {usuario.nombre?.charAt(0).toUpperCase() || <User />}
            </div>
            <h3>{usuario.nombre}</h3>
            <span className="user-email"><Mail size={14} /> {usuario.email}</span>
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => setShowEditarPerfil(true)}>
              <Edit size={18} /> Perfil Personal
            </button>
            <button className="nav-item" onClick={() => setShowPasswordModal(true)}>
              <Lock size={18} /> Seguridad
            </button>
            <div className="nav-separator"></div>
            <button className="nav-item logout-btn" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={18} /> Salir
            </button>
            <button className="nav-item delete-btn" onClick={eliminarCuenta}>
              <Trash2 size={18} /> Eliminar mi cuenta
            </button>
          </nav>
        </aside>

        <main className="perfil-content">
          <header className="content-header">
            <div className="title-box">
              <Award size={32} color="#fcb424" />
              <h1>Mis Cursos y Logros</h1>
            </div>
            <p>Aquí puedes ver tu avance y obtener tus certificaciones.</p>
          </header>

          <div className="progress-cards-container">
            {cursos.length === 0 ? (
              <div className="empty-state">Aún no te has inscrito en ningún curso.</div>
            ) : (
              cursos.map((curso) => {
                const stats = calcularProgreso(curso);
                return (
                  <div key={curso.id} className={`course-progress-card ${stats.estado}`}>
                    <div className="card-top">
                      <div className="course-info-meta">
                        <span className={`status-pill ${stats.estado}`}>
                          {stats.completado ? "Completado" : stats.porcentaje > 0 ? "En curso" : "Por iniciar"}
                        </span>
                        <h4>{curso.nombre}</h4>
                      </div>
                      {stats.completado && <div className="medal-badge">🏅</div>}
                    </div>

                    <div className="card-mid">
                      <div className="progress-text">
                        <span>{stats.porcentaje}% Completado</span>
                        <span>{stats.completadas}/{stats.total} lecciones</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${stats.porcentaje}%` }} />
                      </div>
                    </div>

                    <div className="card-bottom">
                      {stats.completado && stats.constanciaEmitida ? (
                        <button className="btn-certificate" onClick={() => descargarConstancia(curso.id, curso.nombre)}>
                          <FileText size={18} /> Descargar Certificado
                        </button>
                      ) : (
                        <button className="btn-continue" onClick={() => navigate(`/curso/${curso.id}`)}>
                          {stats.porcentaje > 0 ? "Continuar aprendiendo" : "Ver lecciones"} <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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