import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Importaciones de Firebase Firestore y Auth
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, serverTimestamp, query, deleteDoc, setLogLevel, getDocs, where, writeBatch } from 'firebase/firestore'; 

// Importaciones de Íconos
import { User, Send, X, ChevronsUp, Zap, ThumbsUp, Lightbulb, AlertTriangle, Users, Plus, Trash2, Settings, ZoomIn } from 'lucide-react';

// Constantes para los límites de caracteres
const MAX_POSTIT_CHARS = 300; 
const MAX_TITLE_CHARS = 50; 

// Lista de Miembros por defecto para la siembra inicial (NUEVO)
const DEFAULT_MEMBERS = [
    { name: "pipe", role: "Frontend/Sysadmin" },
    { name: "carlos", role: "Sysadmin" },
    { name: "moys", role: "SL" },
    { name: "brayan", role: "Frontend Líder" },
    { name: "jimenez", role: "Backend Líder" },
    { name: "angel", role: "Frontend" },
    { name: "katerine", role: "BA" },
    { name: "kevin", role: "Backend" },
    { name: "marco", role: "Backend/QA/DBA" },
];

/**
 * Función para sembrar los miembros del equipo por defecto en Firestore.
 * Esto solo ocurre si la colección está vacía al inicio.
 */
const seedTeamMembers = async (firestore, currentAppId) => {
    console.log("La colección de miembros está vacía. Sembrando datos por defecto...");
    const membersCollectionPath = `/artifacts/${currentAppId}/public/data/teamMembers`;
    const batch = writeBatch(firestore); // Usamos writeBatch para eficiencia
    
    DEFAULT_MEMBERS.forEach((member) => {
        // Crea una referencia de documento nueva para cada miembro
        const docRef = doc(collection(firestore, membersCollectionPath));
        batch.set(docRef, {
            ...member,
            createdAt: serverTimestamp(),
        });
    });
    
    try {
        await batch.commit();
        console.log("Miembros por defecto sembrados con éxito.");
    } catch (e) {
        console.error("Error al sembrar los miembros por defecto:", e);
    }
};

/**
 * Hook personalizado para manejar la inicialización y el estado de Firebase.
 * Este hook encapsula la lógica de la "API" para el manejo de datos (feedback y miembros).
 */
const useFirestoreData = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuraciones y variables globales del entorno Canvas
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  let firebaseConfig = null;
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // Intentar parsear la configuración de Firebase
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      firebaseConfig = JSON.parse(__firebase_config);
    }
  } catch (e) {
    if (!error) setError(`Error en la configuración JSON de Firebase: ${e.message}`);
  }

  useEffect(() => {
    if (error) {
      setIsLoading(false);
      return;
    }

    if (!firebaseConfig || !firebaseConfig.apiKey) {
      setError("Error: Configuración de Firebase incompleta o inválida.");
      setIsLoading(false);
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);
      
      setLogLevel('debug'); 
      setDb(firestore);
      setAuth(authInstance);

      // 2. Manejar Autenticación
      const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
          
          // 3. Establecer Listener de Miembros
          const membersCollectionPath = `/artifacts/${appId}/public/data/teamMembers`;
          const membersQuery = query(collection(firestore, membersCollectionPath));
          
          const unsubscribeMembers = onSnapshot(membersQuery, async (snapshot) => { // Es importante que sea async aquí
            
            // Lógica de siembra: Si la snapshot está vacía, sembramos los miembros por defecto
            if (snapshot.empty && DEFAULT_MEMBERS.length > 0) {
                 // Si la colección está vacía, sembramos los miembros por defecto.
                 // Esto solo ocurrirá la primera vez.
                 await seedTeamMembers(firestore, appId);
                 // Note: onSnapshot se ejecutará de nuevo automáticamente con los datos sembrados.
            }

            const members = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            setTeamMembers(members.sort((a, b) => (a.name || '').localeCompare(b.name || ''))); // Ordenar por nombre
          }, (e) => {
            console.error("Error al escuchar Miembros:", e);
            setError("Error al cargar la lista de miembros.");
          });

          // 4. Establecer Listener de Feedback
          const retroCollectionPath = `/artifacts/${appId}/public/data/retroFeedback`;
          const retroQuery = query(collection(firestore, retroCollectionPath));

          const unsubscribeSnapshot = onSnapshot(retroQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setFeedbackData(data);
            setIsLoading(false);
          }, (e) => {
            console.error("Error al escuchar Feedback:", e);
            setError("Error al cargar datos del tablero.");
            setIsLoading(false);
          });

          return () => {
            unsubscribeSnapshot();
            unsubscribeMembers();
          }; // Cleanup listeners
        } else {
          // Intentar inicio de sesión
          if (initialAuthToken) {
            await signInWithCustomToken(authInstance, initialAuthToken);
          } else {
            await signInAnonymously(authInstance);
          }
        }
      });

      return () => unsubscribeAuth(); // Cleanup auth listener

    } catch (e) {
      console.error("Fallo la inicialización de Firebase:", e);
      setError(`Error crítico de inicialización: ${e.message}`);
      setIsLoading(false);
    }
  }, [appId, initialAuthToken, error, firebaseConfig]);

  // Funciones de CRUD para Feedback
  const addFeedback = useCallback(async (newFeedback) => {
    if (!db || !userId) return console.error("Base de datos no inicializada o usuario no autenticado.");

    const retroCollectionPath = `/artifacts/${appId}/public/data/retroFeedback`;
    const newDocRef = doc(collection(db, retroCollectionPath));

    try {
      await setDoc(newDocRef, {
        ...newFeedback,
        authorId: userId,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error al añadir feedback:", e);
      setError("No se pudo guardar el post-it.");
    }
  }, [db, userId, appId]);

  const deleteFeedback = useCallback(async (id) => {
    if (!db) return console.error("Base de datos no inicializada.");

    const retroDocPath = `/artifacts/${appId}/public/data/retroFeedback/${id}`;

    try {
      await deleteDoc(doc(db, retroDocPath));
    } catch (e) {
      console.error("Error al eliminar feedback:", e);
      setError("No se pudo eliminar el post-it.");
    }
  }, [db, appId]);

  // Funciones de CRUD para Miembros
  const addMember = useCallback(async (name, role) => {
    if (!db) return console.error("Base de datos no inicializada.");
    if (!name.trim()) return;

    const membersCollectionPath = `/artifacts/${appId}/public/data/teamMembers`;
    const newDocRef = doc(collection(db, membersCollectionPath));

    try {
      await setDoc(newDocRef, {
        name: name.trim(),
        role: role.trim() || 'Miembro de Equipo',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error al añadir miembro:", e);
      setError("No se pudo agregar el miembro al equipo.");
    }
  }, [db, appId]);

  const deleteMember = useCallback(async (memberId) => {
    if (!db) return console.error("Base de datos no inicializada.");

    // 1. Eliminar el documento del miembro
    const memberDocPath = `/artifacts/${appId}/public/data/teamMembers/${memberId}`;
    try {
      await deleteDoc(doc(db, memberDocPath));
    } catch (e) {
      console.error("Error al eliminar miembro:", e);
      setError("No se pudo eliminar el miembro.");
      return;
    }

    // 2. Eliminar todos los post-its que apuntan a este miembro (Importante para limpieza)
    const retroCollectionPath = `/artifacts/${appId}/public/data/retroFeedback`;
    const feedbackToDeleteQuery = query(collection(db, retroCollectionPath), where('targetId', '==', memberId));
    
    try {
      const snapshot = await getDocs(feedbackToDeleteQuery);
      snapshot.docs.forEach(async (d) => {
        await deleteDoc(doc(db, retroCollectionPath, d.id));
      });
    } catch (e) {
        console.warn("No se pudo eliminar el feedback asociado. Podría requerir limpieza manual.", e);
    }

  }, [db, appId]);


  return { feedbackData, isLoading, error, userId, teamMembers, addFeedback, deleteFeedback, addMember, deleteMember };
};

// Componente Modal para mostrar el contenido completo del Post-it
const PostItDetailModal = ({ isVisible, onClose, feedback, members }) => {
    if (!isVisible || !feedback) return null;

    const targetMember = members.find(m => m.id === feedback.targetId);
    
    const categoryDetails = useMemo(() => {
        const categories = {
            achievements: { title: 'Logro Destacado', icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-100' },
            qualities: { title: 'Cualidad Esencial', icon: User, color: 'text-yellow-600', bg: 'bg-yellow-100' },
            potential: { title: 'Punto de Potencial', icon: Lightbulb, color: 'text-cyan-600', bg: 'bg-cyan-100' },
        };
        return categories[feedback.category] || { title: 'Desconocido', icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }, [feedback.category]);

    const Icon = categoryDetails.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-400 transform scale-100 transition-transform duration-300 ${categoryDetails.bg}`}>
                <div className="flex justify-between items-start border-b border-gray-400 pb-3 mb-4">
                    <h3 className={`text-2xl font-extrabold flex items-center gap-2 ${categoryDetails.color}`}>
                        <Icon size={28} /> {categoryDetails.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Título del Post-it */}
                <h4 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                    {feedback.title}
                </h4>

                {/* Área de Contenido con Scroll (AJUSTADO) */}
                <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-300 mb-4 h-60 overflow-y-auto custom-scrollbar">
                    <p className="font-mono whitespace-pre-wrap text-gray-800 text-lg">
                        {feedback.text}
                    </p>
                </div>

                <div className="text-sm text-gray-700 mt-2">
                    <p><strong>Dirigido a:</strong> {targetMember ? targetMember.name : 'Miembro Desconocido'}</p>
                    {/* Aquí podrías añadir más metadata si fuera necesario (fecha, autor, etc.) */}
                </div>

                <button onClick={onClose} className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition">
                    Cerrar
                </button>
            </div>
        </div>
    );
};


// Componente para una única nota Post-it (Componente: PostItNote)
const PostItNote = ({ feedback, colorClass, onDelete, isAuthor, onOpenDetail }) => {
  const Icon = feedback.category === 'achievements' ? ThumbsUp : feedback.category === 'qualities' ? User : Lightbulb;
  
  const rotation = useMemo(() => {
    const min = -1;
    const max = 1;
    return Math.random() * (max - min) + min;
  }, []);

  return (
    <div 
      // TAMAÑO AJUSTADO: w-40 h-44
      className={`relative p-3 shadow-lg rounded-sm transform transition duration-150 ease-in-out cursor-pointer ${colorClass} w-40 h-44 flex flex-col justify-between`} 
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div 
          className="absolute inset-0 z-10 p-3 flex flex-col justify-between"
          onClick={() => onOpenDetail(feedback)} // Click en el cuerpo abre el modal
      >
        <p className="text-sm font-bold mb-1 italic opacity-90 flex items-center gap-1 text-gray-800 border-b border-gray-400/50 pb-0.5">
          <Icon size={14} className="text-gray-800" />
          {feedback.category === 'achievements' ? 'Logro' : feedback.category === 'qualities' ? 'Cualidad' : 'Potencial'}
        </p>
        
        {/* TÍTULO DEL POST-IT (AUMENTADO A TEXT-LG) */}
        <h5 className="text-lg font-extrabold text-gray-900 mb-1 leading-tight overflow-hidden whitespace-nowrap overflow-ellipsis">
            {feedback.title}
        </h5>

        {/* Agregamos overflow-y-auto para el scroll */}
        <p className="text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto custom-scrollbar h-full pr-1"> 
            {feedback.text}
        </p> 
      </div>

      {isAuthor && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(feedback.id); }} // Detener la propagación para no abrir el modal
          className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow-md z-20"
          title="Eliminar mi post-it"
        >
          <X size={10} />
        </button>
      )}

      {/* Ícono de Zoom, visible pero no cliqueable (el click es en el div padre) */}
      <ZoomIn size={14} className="absolute bottom-1 right-1 text-gray-500 opacity-60 z-0"/>
    </div>
  );
};

// Componente para la Tarjeta/Fila de un Miembro (Componente: MemberRow)
const MemberRow = ({ member, feedbackData, currentUserId, deleteFeedback, onOpenDetail }) => {
  const categories = [
    { id: 'achievements', title: 'Logros Destacados', icon: Zap, color: 'bg-green-300', filter: 'achievements' },
    { id: 'qualities', title: 'Cualidades Esenciales', icon: User, color: 'bg-yellow-200', filter: 'qualities' },
    { id: 'potential', title: 'Puntos de Potencial', icon: ChevronsUp, color: 'bg-cyan-300', filter: 'potential' },
  ];

  // Agrupamos el feedback por categoría para esta persona
  const feedbackByCategory = useMemo(() => {
    const grouped = { achievements: [], qualities: [], potential: [] };
    feedbackData
      .filter(f => f.targetId === member.id)
      .forEach(f => {
        if (grouped[f.category]) {
          grouped[f.category].push(f);
        }
      });
    return grouped;
  }, [feedbackData, member.id]);


  return (
    <div className="flex border-b border-white/10 py-4 items-start gap-4 hover:bg-black/20 transition duration-150">
      
      {/* Columna de Miembro (Izquierda) */}
      <div className="w-40 flex flex-col items-center justify-center p-2 pt-4 flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-indigo-500/80 text-white flex items-center justify-center text-2xl font-extrabold border-2 border-white shadow-xl">
          {member.name.charAt(0)}
        </div>
        <h3 className="text-base font-bold text-white mt-2 text-center">{member.name}</h3>
        <p className="text-xs text-indigo-300 text-center">({member.role})</p>
      </div>

      {/* Columnas de Feedback (Derecha) */}
      <div className="flex flex-grow gap-4 pt-4 min-h-[100px] overflow-x-auto pb-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-3 min-w-[150px] border-l border-white/10 pl-4">
            {/* Título de la Categoría */}
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-1">
              <cat.icon size={14} className={`text-white`} /> 
              {cat.title}
            </h4>

            {/* Post-its de la Categoría */}
            <div className="flex gap-4">
              {feedbackByCategory[cat.filter].length > 0 ? (
                feedbackByCategory[cat.filter].map((feedback) => (
                  <PostItNote
                    key={feedback.id}
                    feedback={feedback}
                    colorClass={cat.color}
                    isAuthor={feedback.authorId === currentUserId}
                    onDelete={deleteFeedback}
                    onOpenDetail={onOpenDetail} // Se pasa la función al PostItNote
                  />
                ))
              ) : (
                <p className="text-xs italic text-white/30 pt-2">Añade feedback...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente Modal para crear un nuevo Post-it (Componente: FeedbackFormModal)
const FeedbackFormModal = ({ members, isVisible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    targetId: '',
    category: 'achievements',
    title: '', // Campo de título
    text: '',
  });

  const [error, setError] = useState('');

  // Seteo de miembros inicial, forzando al primer miembro si no hay selección
  useEffect(() => {
    if (isVisible && members.length > 0 && !formData.targetId) {
      setFormData(prev => ({ ...prev, targetId: members[0].id }));
    }
    if (!isVisible) {
      // Resetear al cerrar
      setFormData({
        targetId: members.length > 0 ? members[0].id : '',
        category: 'achievements',
        title: '', // Resetear título
        text: '',
      });
      setError('');
    }
  }, [isVisible, members]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.targetId || !formData.text.trim() || !formData.title.trim()) { // Validar título
      setError('Por favor, selecciona un miembro, escribe el título y el contenido del feedback.');
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isVisible) return null;
  if (members.length === 0) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-yellow-100 text-yellow-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-yellow-500/50">
             <p className="font-bold">No hay miembros en el equipo.</p>
             <p className="text-sm mt-2">Por favor, usa el botón de "Administrar Equipo" para agregar al menos una persona antes de añadir feedback.</p>
             <button onClick={onClose} className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">Cerrar</button>
          </div>
        </div>
      );
  }

  // Definiciones de categorías para el formulario
  const categories = [
    { id: 'achievements', title: 'Logros Destacados (Acción 🟢)', description: 'Acciones o tareas específicas que hizo bien.' },
    { id: 'qualities', title: 'Cualidades Esenciales (Ser 🟡)', description: 'Atributos de personalidad o habilidades blandas.' },
    { id: 'potential', title: 'Puntos de Potencial (Crecimiento 🔵)', description: 'Deseos de mejora dirigidos al comportamiento/proceso. (Regla de Oro)' },
  ];

  const currentCategory = categories.find(c => c.id === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 text-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-indigo-500/50 transform scale-100 transition-transform duration-300">
        <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
          <h3 className="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
            <Send size={24} /> Nuevo Post-it
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo Miembro Objetivo */}
          <div>
            <label htmlFor="targetId" className="block text-sm font-medium text-gray-700 mb-1">Dirigido a:</label>
            <select
              id="targetId"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              required
            >
              <option value="" disabled>Selecciona un miembro</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
              ))}
            </select>
          </div>

          {/* Campo Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{currentCategory?.description}</p>
          </div>

          {/* Campo de Título (NUEVO) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título del Post-it (Máx. {MAX_TITLE_CHARS} caracteres):</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={MAX_TITLE_CHARS}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Ej: Gran manejo de la crisis"
              required
            />
          </div>

          {/* Campo Contenido del Post-it */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">Mensaje (Máx. {MAX_POSTIT_CHARS} caracteres):</label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              rows="4"
              maxLength={MAX_POSTIT_CHARS} // Se aumenta el límite
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-inner"
              placeholder="Ej: Reconozco tu iniciativa para refactorizar el módulo de pagos, fue crucial para reducir la deuda técnica en un 20%."
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.text.length} / {MAX_POSTIT_CHARS}
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Botón de Envío */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition duration-150 shadow-lg"
          >
            <Send size={18} /> Publicar Post-it
          </button>
        </form>
      </div>
    </div>
  );
};

// Componente Modal para administrar los miembros
const MemberManagementModal = ({ members, isVisible, onClose, onAdd, onDelete }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);
        await onAdd(name, role);
        setIsSaving(false);
        setName('');
        setRole('');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-100 text-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-indigo-500/50">
                <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
                    <h3 className="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
                        <Users size={24} /> Administrar Equipo
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Formulario para Agregar Miembro */}
                <form onSubmit={handleAdd} className="flex gap-4 p-4 mb-6 bg-indigo-100 rounded-lg border border-indigo-300">
                    <input
                        type="text"
                        placeholder="Nombre del Miembro (Ej: Juan Pérez)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-2.5 rounded-lg border border-gray-300 w-full"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Rol (Ej: Frontend Dev)"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="p-2.5 rounded-lg border border-gray-300 w-full md:w-1/2"
                    />
                    <button
                        type="submit"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold transition duration-150 ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        disabled={isSaving}
                    >
                        <Plus size={18} /> {isSaving ? 'Guardando...' : 'Añadir'}
                    </button>
                </form>

                {/* Lista de Miembros Actuales */}
                <h4 className="text-xl font-bold mb-3 text-gray-700 border-b pb-2">Miembros Actuales ({members.length})</h4>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {members.map((member) => (
                        <li key={member.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-xs text-gray-500">{member.role || 'Sin rol'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onDelete(member.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                                title="Eliminar miembro y todo su feedback asociado"
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>

                <button onClick={onClose} className="w-full mt-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-800 font-bold transition">
                    Cerrar
                </button>
            </div>
        </div>
    );
};


// Componente Principal de la Aplicación (Componente: App)
const App = () => {
  const { feedbackData, isLoading, error, userId, teamMembers, addFeedback, deleteFeedback, addMember, deleteMember } = useFirestoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementOpen] = useState(false);
  
  // Nuevo estado para el modal de detalle del post-it
  const [detailModalState, setDetailModalState] = useState({ 
      isVisible: false, 
      feedback: null 
  }); 

  const handleSaveFeedback = (formData) => {
    addFeedback(formData);
  };

  const handleToggleModal = () => setIsModalOpen(prev => !prev);
  const handleToggleManagementModal = () => setIsManagementOpen(prev => !prev);
  
  // Función para abrir el modal de detalle
  const handleOpenDetailModal = useCallback((feedback) => {
      setDetailModalState({ isVisible: true, feedback });
  }, []);

  // Función para cerrar el modal de detalle
  const handleCloseDetailModal = useCallback(() => {
      setDetailModalState({ isVisible: false, feedback: null });
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#2f5b40] text-white/90 p-8">
        <Zap size={48} className="animate-spin mr-2 text-green-300" />
        <h1 className='text-3xl mt-4 font-bold'>Cargando Tablero...</h1>
        <p className='mt-2 text-lg'>Autenticando usuario y conectando a la pizarra de Firebase.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-800/90 text-white p-8">
        <AlertTriangle size={64} className="mb-4 text-yellow-300" />
        <h1 className="text-3xl font-extrabold">¡ERROR CRÍTICO!</h1>
        <p className='text-xl mt-2'>No se pudo cargar la aplicación.</p>
        <p className='mt-4 p-4 bg-red-900/50 rounded-lg border border-yellow-300'>
          <span className='font-bold'>Mensaje:</span> {error}
        </p>
        <p className='mt-4 text-sm'>
          Por favor, abre la consola (F12) y revisa los logs de depuración de Firebase (<span className='text-yellow-300'>[firestore/debug]</span>) para la causa exacta.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6 font-sans bg-cover bg-fixed"
      style={{ backgroundImage: `url('https://placehold.co/1920x1080/2f5b40/fff?text=Pizarra+Verde')`, backgroundBlendMode: 'multiply', backgroundColor: '#2f5b40' }}
    >
        {/* Estilo CSS para el scrollbar personalizado */}
        <style>
            {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background-color: transparent;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.4);
                }
            `}
        </style>
        
      {/* Información del Usuario */}
      <div className="fixed top-2 right-2 text-xs text-gray-200 bg-black/50 p-2 rounded-lg shadow-md z-40">
        Tu ID de Usuario (Autor): <span className="font-mono text-cyan-300">{userId}</span>
      </div>

      <header className="text-center mb-8 bg-black/40 p-4 rounded-xl shadow-2xl">
        <h1 className="text-5xl font-extrabold text-green-300 tracking-wider font-serif">Retrospectiva de Equipo</h1>
        <p className="text-xl text-white/90 mt-2">La Pizarra del Crecimiento (Acciones, Esenciales, Potencial)</p>
        {/* Títulos de Categoría en la cabecera (para guía visual) */}
        <div className="mt-4 flex justify-center gap-10 text-lg font-bold text-white/90">
            <span className="text-green-300 flex items-center gap-1"><Zap size={16}/> Logros</span>
            <span className="text-yellow-200 flex items-center gap-1"><User size={16}/> Cualidades</span>
            <span className="text-cyan-300 flex items-center gap-1"><ChevronsUp size={16}/> Potencial</span>
        </div>
      </header>

      {/* Contenedor de Botones Flotantes */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
        
        {/* Botón para Administrar Equipo */}
        <button
          onClick={handleToggleManagementModal}
          className="flex items-center gap-3 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white text-lg font-bold transition duration-300 shadow-2xl shadow-indigo-500/50 transform hover:scale-105"
          title="Administrar los miembros del equipo"
        >
          <Settings size={20} /> Administrar Equipo
        </button>

        {/* Botón para Añadir Post-it */}
        <button
          onClick={handleToggleModal}
          className="flex items-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 rounded-full text-white text-xl font-bold transition duration-300 shadow-2xl shadow-green-500/50 transform hover:scale-105"
          title="Añadir un nuevo post-it"
        >
          <Send size={24} /> Añadir Post-it
        </button>
      </div>

      {/* Contenedor principal de la Pizarra Muro */}
      <main className="bg-black/40 p-4 rounded-xl shadow-inner border border-white/20">
        {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                feedbackData={feedbackData}
                currentUserId={userId}
                deleteFeedback={deleteFeedback}
                onOpenDetail={handleOpenDetailModal} // Se pasa la función
              />
            ))
        ) : (
            <div className="text-center p-10 text-white/70">
                <Users size={32} className="mx-auto mb-4"/>
                <p className="text-lg font-semibold">No hay miembros registrados.</p>
                <p className="text-sm">Usa el botón "Administrar Equipo" para empezar a agregar personas.</p>
                {/* Nota: si la siembra falló o aún no se ha completado, este mensaje se mostrará brevemente. */}
            </div>
        )}
      </main>

      {/* Modal del Formulario de Feedback */}
      <FeedbackFormModal
        members={teamMembers}
        isVisible={isModalOpen}
        onClose={handleToggleModal}
        onSave={handleSaveFeedback}
      />

      {/* Modal de Administración de Miembros */}
      <MemberManagementModal
        members={teamMembers}
        isVisible={isManagementModalOpen}
        onClose={handleToggleManagementModal}
        onAdd={addMember}
        onDelete={deleteMember}
      />
      
      {/* Modal de Detalle de Post-it (NUEVO) */}
      <PostItDetailModal
        isVisible={detailModalState.isVisible}
        onClose={handleCloseDetailModal}
        feedback={detailModalState.feedback}
        members={teamMembers}
      />
    </div>
  );
};

export default App;