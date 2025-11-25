import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, serverTimestamp, query, deleteDoc, setLogLevel, getDocs, where, writeBatch } from 'firebase/firestore';
import { DEFAULT_MEMBERS } from './constants.js';

/**
 * Función para sembrar los miembros del equipo por defecto en Firestore.
 * Esto solo ocurre si la colección está vacía al inicio.
 */
export const seedTeamMembers = async (firestore, currentAppId) => {
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
 * Inicializa la aplicación de Firebase
 */
export const initializeFirebase = (firebaseConfig) => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    
    setLogLevel('debug');
    
    return { app, firestore, auth };
};

/**
 * Maneja la autenticación del usuario
 */
export const authenticateUser = async (auth, initialAuthToken) => {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Error en autenticación:", error);
        throw error;
    }
};

/**
 * Configura los listeners de Firestore
 */
export const setupFirestoreListeners = (firestore, appId, callbacks) => {
    const { 
        onMembersChange, 
        onFeedbackChange, 
        onError 
    } = callbacks;

    // Listener para miembros
    const membersCollectionPath = `/artifacts/${appId}/public/data/teamMembers`;
    const membersQuery = query(collection(firestore, membersCollectionPath));
    
    const unsubscribeMembers = onSnapshot(membersQuery, async (snapshot) => {
        // Lógica de siembra: Si la snapshot está vacía, sembramos los miembros por defecto
        if (snapshot.empty && DEFAULT_MEMBERS.length > 0) {
            await seedTeamMembers(firestore, appId);
        }

        const members = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        onMembersChange(members.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    }, (error) => {
        console.error("Error al escuchar Miembros:", error);
        onError("Error al cargar la lista de miembros.");
    });

    // Listener para feedback
    const retroCollectionPath = `/artifacts/${appId}/public/data/retroFeedback`;
    const retroQuery = query(collection(firestore, retroCollectionPath));

    const unsubscribeFeedback = onSnapshot(retroQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        onFeedbackChange(data);
    }, (error) => {
        console.error("Error al escuchar Feedback:", error);
        onError("Error al cargar datos del tablero.");
    });

    return () => {
        unsubscribeMembers();
        unsubscribeFeedback();
    };
};
