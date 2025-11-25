import { collection, doc, setDoc, deleteDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

/**
 * Servicio para manejar operaciones CRUD de miembros del equipo
 */
export class MembersService {
    constructor(firestore, appId) {
        this.db = firestore;
        this.appId = appId;
        this.membersCollectionPath = `/artifacts/${appId}/public/data/teamMembers`;
        this.feedbackCollectionPath = `/artifacts/${appId}/public/data/retroFeedback`;
    }

    /**
     * Añade un nuevo miembro al equipo
     */
    async addMember(name, role = 'Miembro de Equipo') {
        if (!this.db) {
            console.error("Base de datos no inicializada.");
            return;
        }
        
        if (!name.trim()) {
            console.error("El nombre del miembro no puede estar vacío.");
            return;
        }

        const newDocRef = doc(collection(this.db, this.membersCollectionPath));

        try {
            await setDoc(newDocRef, {
                name: name.trim(),
                role: role.trim(),
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error al añadir miembro:", error);
            throw new Error("No se pudo agregar el miembro al equipo.");
        }
    }

    /**
     * Elimina un miembro y todo su feedback asociado
     */
    async deleteMember(memberId) {
        if (!this.db) {
            console.error("Base de datos no inicializada.");
            return;
        }

        try {
            // 1. Eliminar el documento del miembro
            const memberDocPath = `${this.membersCollectionPath}/${memberId}`;
            await deleteDoc(doc(this.db, memberDocPath));

            // 2. Eliminar todos los post-its que apuntan a este miembro
            const feedbackToDeleteQuery = query(
                collection(this.db, this.feedbackCollectionPath), 
                where('targetId', '==', memberId)
            );
            
            const snapshot = await getDocs(feedbackToDeleteQuery);
            const deletePromises = snapshot.docs.map(d => 
                deleteDoc(doc(this.db, this.feedbackCollectionPath, d.id))
            );
            
            await Promise.all(deletePromises);
            
        } catch (error) {
            console.error("Error al eliminar miembro:", error);
            throw new Error("No se pudo eliminar el miembro.");
        }
    }
}
