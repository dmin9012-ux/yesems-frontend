import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import TopBarAdmin from "../../../../components/TopBarAdmin/TopBarAdmin";
import { notify } from "../../../../Util/toast"; 
import { Save, Plus, Trash2, ArrowLeft, Video, HelpCircle, FileText, Paperclip, Target, ClipboardList } from "lucide-react";
import "./CrearCursoStyle.css";

/* ===============================
    📦 ESTRUCTURA BASE (Tu Lógica)
================================ */
const emptyCurso = () => ({
  id: "",
  nombre: "",
  imagenURL: "",
  descripcion: "",
  descripcionLarga: "",
  objetivos: [""],
  requisitos: [""],
  niveles: [
    {
      numero: 1,
      titulo: "",
      lecciones: [
        {
          id: "",
          titulo: "",
          videoURL: "",
          contenidoHTML: "",
          materiales: []
        }
      ],
      preguntas: []
    }
  ]
});

export default function CrearCurso() {
  const [curso, setCurso] = useState(emptyCurso());
  const navigate = useNavigate();

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

  const generarIdLeccion = (ni, li) => `${curso.id}-n${ni + 1}-l${li + 1}`;

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

  const addLeccion = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones.push({
      id: "", titulo: "", videoURL: "", contenidoHTML: "", materiales: []
    });
    setCurso(copy);
  };

  const addMaterial = (ni, li) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.push({
      id: `pdf-${Date.now()}`, titulo: "", tipo: "pdf", urlPreview: "", urlDownload: ""
    });
    setCurso(copy);
  };

  const removeMaterial = (ni, li, mi) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].lecciones[li].materiales.splice(mi, 1);
    setCurso(copy);
  };

  const addPregunta = (ni) => {
    const copy = JSON.parse(JSON.stringify(curso));
    if (!copy.niveles[ni].preguntas) copy.niveles[ni].preguntas = [];
    copy.niveles[ni].preguntas.push({
      id: `p-${Date.now()}`, pregunta: "", opciones: ["", "", "", ""], correcta: 0
    });
    setCurso(copy);
  };

  const removePregunta = (ni, pi) => {
    const copy = JSON.parse(JSON.stringify(curso));
    copy.niveles[ni].preguntas.splice(pi, 1);
    setCurso(copy);
  };

  /* ===============================
      💾 GUARDAR CURSO
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!curso.id || !curso.nombre) {
      return notify("warning", "El ID y el Nombre son obligatorios");
    }

    const cursoFinal = {
      ...curso,
      niveles: curso.niveles.map((n, ni) => ({
        ...n,
        lecciones: n.lecciones.map((l, li) => ({
          ...l,
          id: generarIdLeccion(ni, li)
        }))
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "cursos", curso.id), cursoFinal);
      notify("success", "✅ Curso creado correctamente");
      navigate("/admin/cursos");
    } catch (err) {
      console.error(err);
      notify("error", "❌ Error al guardar el curso");
    }
  };

  return (
    <div className="admin-edit-layout">
      <TopBarAdmin />
      <div className="crear-curso-container">
        
        <header className="edit-header">
          <div className="header-text">
            <h1>Crear Nuevo Curso</h1>
            <p>Define la identidad y estructura académica de tu curso.</p>
          </div>
          <button type="button" className="btn-regresar" onClick={() => navigate("/admin/cursos")}>
            <ArrowLeft size={18} /> Regresar
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          {/* INFO GENERAL */}
          <section className="card-admin-section">
            <div className="section-title">
              <FileText size={20} /> <h3>Información General</h3>
            </div>
            
            <div className="input-grid-2">
              <div className="input-group">
                <label>ID del curso (slug)</label>
                <input required placeholder="ej: curso-primeros-auxilios" value={curso.id} onChange={(e) => setCurso({ ...curso, id: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Nombre del curso</label>
                <input required placeholder="Título público del curso" value={curso.nombre} onChange={(e) => setCurso({ ...curso, nombre: e.target.value })} />
              </div>
            </div>

            <label>Imagen Portada (URL)</label>
            <input placeholder="URL de la imagen" value={curso.imagenURL} onChange={(e) => setCurso({ ...curso, imagenURL: e.target.value })} />

            <div className="input-grid-2">
              <div className="input-group">
                <label>Descripción corta</label>
                <textarea placeholder="Resumen para tarjetas" value={curso.descripcion} onChange={(e) => setCurso({ ...curso, descripcion: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Descripción larga</label>
                <textarea placeholder="Detalle completo del curso" value={curso.descripcionLarga} onChange={(e) => setCurso({ ...curso, descripcionLarga: e.target.value })} />
              </div>
            </div>

            <div className="list-management">
              <h4><Target size={18} /> Objetivos</h4>
              {curso.objetivos.map((o, i) => (
                <div key={i} className="dynamic-row">
                  <input placeholder={`Objetivo ${i + 1}`} value={o} onChange={(e) => updateDeep(`objetivos.${i}`, e.target.value)} />
                  {curso.objetivos.length > 1 && (
                    <button type="button" className="btn-icon-remove" onClick={() => removeArrayItem("objetivos", i)}>❌</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-item" onClick={() => addArrayItem("objetivos")}><Plus size={16} /> Añadir Objetivo</button>
            </div>
          </section>

          {/* NIVELES */}
          {curso.niveles.map((nivel, ni) => (
            <section key={ni} className="card-admin-section nivel-card">
              <div className="nivel-header">
                <h3 className="nivel-badge">Nivel {nivel.numero}</h3>
                <input className="input-nivel-titulo" placeholder="Título del nivel" value={nivel.titulo} onChange={(e) => updateDeep(`niveles.${ni}.titulo`, e.target.value)} />
              </div>

              {/* LECCIONES */}
              <div className="lecciones-container">
                {nivel.lecciones.map((lec, li) => (
                  <div key={li} className="leccion-block">
                    <div className="leccion-header">
                      <Video size={18} /> <span>Lección {li + 1}</span>
                    </div>
                    <input placeholder="Título de la lección" value={lec.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.titulo`, e.target.value)} />
                    <input placeholder="URL Video" value={lec.videoURL} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.videoURL`, e.target.value)} />
                    <textarea placeholder="Contenido HTML o Descripción" value={lec.contenidoHTML} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.contenidoHTML`, e.target.value)} />

                    <div className="materiales-section">
                      <h5><Paperclip size={14} /> Materiales PDF</h5>
                      {lec.materiales.map((mat, mi) => (
                        <div key={mat.id} className="material-row">
                          <input placeholder="Título PDF" value={mat.titulo} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.titulo`, e.target.value)} />
                          <input placeholder="URL Descarga" value={mat.urlDownload} onChange={(e) => updateDeep(`niveles.${ni}.lecciones.${li}.materiales.${mi}.urlDownload`, e.target.value)} />
                          <button type="button" className="btn-icon-remove" onClick={() => removeMaterial(ni, li, mi)}>❌</button>
                        </div>
                      ))}
                      <button type="button" className="btn-add-sub" onClick={() => addMaterial(ni, li)}><Plus size={14} /> Material</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-add-leccion-master" onClick={() => addLeccion(ni)}><Plus size={18} /> Nueva Lección</button>
              </div>

              {/* PREGUNTAS */}
              <div className="examen-section">
                <h4><ClipboardList size={18} /> Preguntas del Examen</h4>
                {nivel.preguntas?.map((preg, pi) => (
                  <div key={preg.id} className="pregunta-block">
                    <input className="input-pregunta" placeholder="Escribe la pregunta..." value={preg.pregunta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.pregunta`, e.target.value)} />
                    <div className="opciones-grid">
                      {preg.opciones.map((opt, oi) => (
                        <input key={oi} placeholder={`Opción ${oi + 1}`} value={opt} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.opciones.${oi}`, e.target.value)} />
                      ))}
                    </div>
                    <div className="pregunta-footer">
                      <label>Respuesta Correcta:</label>
                      <select value={preg.correcta} onChange={(e) => updateDeep(`niveles.${ni}.preguntas.${pi}.correcta`, Number(e.target.value))}>
                        {preg.opciones.map((_, oi) => <option key={oi} value={oi}>Opción {oi + 1}</option>)}
                      </select>
                      <button type="button" className="btn-icon-remove" onClick={() => removePregunta(ni, pi)}>Quitar Pregunta</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-add-pregunta-master" onClick={() => addPregunta(ni)}><Plus size={16} /> Añadir Pregunta</button>
              </div>
            </section>
          ))}

          <div className="footer-actions">
            <button type="button" className="btn-add-nivel-master" onClick={addNivel}><Plus /> Agregar Nuevo Nivel</button>
            <button type="submit" className="btn-guardar-master"><Save /> Publicar Curso Completo</button>
          </div>
        </form>
      </div>
    </div>
  );
}