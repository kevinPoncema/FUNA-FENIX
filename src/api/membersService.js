/**
 * Servicio para manejar operaciones CRUD de miembros del equipo usando localStorage
 */
export class MembersService {
    constructor(localStorageService) {
        this.storage = localStorageService;
    }

    /**
     * Añade un nuevo miembro al equipo
     */
    async addMember(name, role = 'Miembro de Equipo') {
        if (!this.storage) {
            console.error("Servicio de almacenamiento no inicializado.");
            return;
        }
        
        if (!name.trim()) {
            console.error("El nombre del miembro no puede estar vacío.");
            return;
        }

        try {
            // Simular un pequeño delay para consistencia
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const success = this.storage.addMember(name, role);
            if (!success) {
                throw new Error("No se pudo guardar en localStorage");
            }
        } catch (error) {
            console.error("Error al añadir miembro:", error);
            throw new Error("No se pudo agregar el miembro al equipo.");
        }
    }

    /**
     * Elimina un miembro y todo su feedback asociado
     */
    async deleteMember(memberId) {
        if (!this.storage) {
            console.error("Servicio de almacenamiento no inicializado.");
            return;
        }

        try {
            // Simular un pequeño delay para consistencia
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const success = this.storage.deleteMember(memberId);
            if (!success) {
                throw new Error("No se pudo eliminar del localStorage");
            }
        } catch (error) {
            console.error("Error al eliminar miembro:", error);
            throw new Error("No se pudo eliminar el miembro.");
        }
    }
}
