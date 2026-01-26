import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import { notify } from "../../../../Util/toast"; // Integración de notificaciones
import { Save, ArrowLeft, Plus, Trash2, FileText, Video, HelpCircle, Paperclip } from "lucide-react";
import "./EditarCursoStyle.css";

export default function EditarCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
      🔄 CARGAR CURSO (Tu Lógica)
  =============================== */
  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "cursos", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        notify("error", "Curso no encontrado");
        navigate("/admin/cursos");
        return;
      }

      setCurso(snap.data());
      setLoading(false);
    };

    load();
  }, [id, navigate]);

  /* ===============================
      🔧 HELPERS (Tu Lógica)
  =============================== */
  const updateDeep = (path, value) => {
    const copy = JSON.parse(JSON.stringify(curso));
    const parts = path.split(".");
    let current = copy;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[isNaN(parts[i]) ? parts[i] : Number(parts[i])];
    }
    current[parts.at(-1)] = value;
    setCurso(copy);
  };

  const addArrayItem = (field) =>
    setCurso((prev) => ({ ...prev, [field]: [...prev[field], ""] }));

  const removeArrayItem = (field, index) => {
    const copy = [...curso[field]];
    copy.splice(index, 1);
    setCurso({ ...curso, [field]: copy });
  };

  /* ===============================
      📚 NIVELES / LECCIONES
  =============================== */
  const addNivel = () =>
    setCurso((prev) => ({
      ...prev,
      niveles: [
        ...prev.niveles,
        { numero: prev.niveles.length + 1, titulo: "", lecciones: [], preguntas: [] }
      ]
    }));

  const removeNivel = (ni) => {
    const copy = [...curso.niveles];
    copy.splice(ni, 1);
    setCurso({
      ...curso,
      niveles: copy.map((n, i) => ({ ...n, numero: i + 1 }))
    });
  };

  const addLeccion = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.push({
      id: crypto.randomUUID(),
      titulo: "",
      videoURL: "",
      contenidoHTML: "",
      materiales: []
    });
    setCurso(copy);
  };

  const removeLeccion = (ni, li) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.splice(li, 1);
    setCurso(copy);
  };

  /* ===============================
      📎 MATERIALES
  =============================== */
  const addMaterial = (ni, li) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.push({
      id: crypto.randomUUID(),
      titulo: "",
      tipo: "pdf",
      urlPreview: "",
      urlDownload: ""
    });
    setCurso(copy);
  };

  const removeMaterial = (ni, li, mi) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.splice(mi, 1);
    setCurso(copy);
  };

  /* ===============================
      ❓ PREGUNTAS
  =============================== */
  const addPregunta = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].preguntas.push({
      id: crypto.randomUUID(),
      pregunta: "",
      opciones: ["", "", "", ""],
      correcta: 0
    });
    setCurso(copy);
  };

  const removePregunta = (ni, pi) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].preguntas.splice(pi, 1);
    setCurso(copy);
  };

  /* ===============================
      💾 GUARDAR
  =============================== */
  const handleSave = async () => {
    try {
      await setDoc(doc(db, "cursos", id), {
        ...curso,
        updatedAt: serverTimestamp()
      });
      notify("success", "Curso actualizado correctamente ✅");
      navigate("/admin/cursos");
    } catch (error) {
      notify("error", "Error al guardar los cambios");
    }
  };

  if (loading) return <div className="admin-loading">Cargando datos del curso...</div>;
  if (!curso) return null;

  return (
    <div className="admin-edit-layout">
      <TopBarAdmin />
      <div className="editar-curso-container">
        <header className="edit-header">
          <div className="header-text">
            <h1>Editar Curso</h1>
            <p>Gestiona la estructura, lecciones y evaluaciones del curso.</p>
          </div>
          <button className="btn-regresar" onClick={() => navigate("/admin/cursos")}>
            <ArrowLeft size={18} /> Volver
          </button>
        </header>

        {/* INFO GENERAL */}
        <section className="card-admin-section">
          <div className="section-title">
            <FileText size={20} /> <h3>Información General</h3>
          </div>
          <div className="input-group">
            <label>Nombre del Curso</label>
            <input placeholder="Ej: Anatomía Humana" value={curso.nombre} onChange={(e) => updateDeep("nombre", e.target.value)} />
          </div>

          <div className="input-group">
            <label>Imagen de Portada (URL)</label>
            <input placeholder="URL de la imagen" value={curso.imagenURL} onChange={(e) => updateDeep("imagenURL", e.target.value)} />
          </div>

          <div className="input-grid-2">
            <div className="input-group">
              <label>Descripción Corta</label>
              <textarea placeholder="Resumen para el catálogo" value={curso.descripcion} onChange={(e) => updateDeep("descripcion", e.target.value)} />
            </div>
            <div className="input-group">
              <label>Descripción Detallada</label>
              <textarea placeholder="Contenido completo del curso" value={curso.descripcionLarga} onChange={(e) => updateDeep("descripcionLarga", e.target.value)} />
            </div>
          </div>

          <div className="list-management">
            <h4>🎯 Objetivos</h4>
            {curso.objetivos.map((o, i) => (
              <div key={i} className="dynamic-row">
                <input placeholder={`Objetivo ${i + 1}`} value={o} onChange={(e) => updateDeep(`objetivos.${i}`, e.target.value)} />
                <button className="btn-icon-remove" onClick={() => removeArrayItem("objetivos", i)}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="btn-add-item" onClick={() => addArrayItem("objetivos")}><Plus size={16} /> Añadir Objetivo</button>
          </div>
        </section>

        {/* ESTRUCTURA DE NIVELES */}
        {curso.niveles.map((nivel, ni) => (
          <section key={ni} className="card-admin-section nivel-card">
            <div className="nivel-header">
              <h3 className="nivel-badge">Nivel {nivel.numero}</h3>
              <input className="input-nivel-titulo" placeholder="Título del nivel" value={nivel.titulo} onChange={(e) => updateDeep(`niveles.${ni}.titulo`, e.target.value)} />
              <button className="btn-remove-nivel" onClick={() => removeNivel(ni)}><Trash2 size={18} /></button>
            </div>

            {/* LECCIONES */}
            <div className="lecciones-container">
              {nivel.lecciones.map((lec, li) => (
                <div key={lec.id} className="leccion-block">
                  <div className="leccion-header">
                    <Video size={18} /> <span>Lección {li + 1}</span>
                  </div>
                  <input placeholder="Título de la lección" value={lec.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.titulo`, e.target.value)} />
                  <input placeholder="URL del Video" value={lec.videoURL} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.videoURL`, e.target.value)} />
                  <textarea placeholder="Contenido HTML o Descripción" value={lec.contenidoHTML} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.contenidoHTML`, e.target.value)} />

                  {/* MATERIALES */}
                  <div className="materiales-section">
                    <h5><Paperclip size={14} /> Materiales Descargables</h5>
                    {lec.materiales.map((mat, mi) => (
                      <div key={mat.id} className="material-row">
                        <input placeholder="Nombre del PDF" value={mat.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.titulo`, e.target.value)} />
                        <input placeholder="URL Descarga" value={mat.urlDownload} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.urlDownload`, e.target.value)} />
                        <button className="btn-icon-remove" onClick={() => removeMaterial(ni, li, mi)}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button className="btn-add-sub" onClick={() => addMaterial(ni, li)}><Plus size={14} /> Material</button>
                  </div>
                  <button className="btn-delete-leccion" onClick={() => removeLeccion(ni, li)}>Eliminar Lección</button>
                </div>
              ))}
              <button className="btn-add-leccion-master" onClick={() => addLeccion(ni)}><Plus size={18} /> Nueva Lección</button>
            </div>

            {/* PREGUNTAS EXAMEN */}
            <div className="examen-section">
              <h4><HelpCircle size={18} /> Examen del Nivel</h4>
              {nivel.preguntas.map((p, pi) => (
                <div key={p.id} className="pregunta-block">
                  <input className="input-pregunta" placeholder="Escribe la pregunta..." value={p.pregunta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.pregunta`, e.target.value)} />
                  <div className="opciones-grid">
                    {p.opciones.map((op, oi) => (
                      <input key={oi} placeholder={`Opción ${oi + 1}`} value={op} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.opciones.${oi}`, e.target.value)} />
                    ))}
                  </div>
                  <div className="pregunta-footer">
                    <label>Correcta:</label>
                    <select value={p.correcta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.correcta`, Number(e.target.value))}>
                      {p.opciones.map((_, oi) => <option key={oi} value={oi}>Opción {oi + 1}</option>)}
                    </select>
                    <button className="btn-remove-pregunta" onClick={() => removePregunta(ni, pi)}>Quitar Pregunta</button>
                  </div>
                </div>
              ))}
              <button className="btn-add-pregunta-master" onClick={() => addPregunta(ni)}><Plus size={16} /> Añadir Pregunta al Banco</button>
            </div>
          </section>
        ))}

        <div className="footer-actions">
          <button className="btn-add-nivel-master" onClick={addNivel}><Plus /> Agregar Nuevo Nivel</button>
          <button className="btn-guardar-master" onClick={handleSave}><Save /> Guardar Todos los Cambios</button>
        </div>
      </div>
    </div>
  );
}