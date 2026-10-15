import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CreatePermissionPayload, PermissionAdmin, PermissionFilters, UpdatePermissionPayload } from '../interfaces/permission.interface';
import type { RoleAdmin } from '../../../shared/interfaces/catalog.interface';
import type { CreateRolePayload, UpdateRolePayload } from '../interfaces/role.interface';

/**
 * Service único de la página Permisos (dos tabs: catálogo de permisos y roles — ver
 * PermissionsPage.tsx). Los métodos de rol llevan el prefijo `role*` porque comparten clase con
 * los de permiso (`list`/`create`/`update`/`delete` ya están tomados por el catálogo).
 */
class PermissionService {
    // ── Catálogo de permisos ────────────────────────────────────────────────
    // list() siempre pagina (manda page/limit); listAssignable() trae la servida
    // dinámica para pickers. `search`/`module`/`group` filtran en ambos casos.
    static async list(page: number, limit: number, search?: string, module?: string, group?: string): Promise<PaginatedResponse<PermissionAdmin>> {
        const res = await apiService.get('/system/permissions', { params: { page, limit, search: search || undefined, module: module || undefined, group: group || undefined } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Módulos y grupos distintos del catálogo, en un solo request — para poblar los dos filtros.
    static async listModules(): Promise<PermissionFilters> {
        const res = await apiService.get('/system/permissions/modules');
        return res.data.data;
    }

    // Servida dinámica para pickers — system ve todo, el resto solo lo repartible.
    // Sin page/limit el backend trae todo.
    static async listAssignable(): Promise<PermissionAdmin[]> {
        const res = await apiService.get('/system/permissions/assignable');
        return res.data.data;
    }

    static async create(payload: CreatePermissionPayload): Promise<{ data: PermissionAdmin; message: string }> {
        const res = await apiService.post('/system/permissions', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdatePermissionPayload): Promise<{ data: PermissionAdmin; message: string }> {
        const res = await apiService.put(`/system/permissions/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/permissions/${id}`);
        return { message: res.data.message };
    }

    // ── Roles — catálogo chico, sin paginar. Sus permisos base son lo que hace que, editando un
    // rol una sola vez, se le den (o quiten) permisos a todos los usuarios que lo tienen. ────────
    static async listRoles(): Promise<RoleAdmin[]> {
        const res = await apiService.get('/system/roles');
        return res.data.data;
    }

    static async createRole(payload: CreateRolePayload): Promise<{ data: RoleAdmin; message: string }> {
        const res = await apiService.post('/system/roles', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async updateRole(id: number, payload: UpdateRolePayload): Promise<{ data: RoleAdmin; message: string }> {
        const res = await apiService.put(`/system/roles/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async deleteRole(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/roles/${id}`);
        return { message: res.data.message };
    }

    // Keys de los permisos base de un rol — para precargar el picker de checkboxes.
    static async getRolePermissions(id: number): Promise<string[]> {
        const res = await apiService.get(`/system/roles/${id}/permissions`);
        return res.data.data;
    }

    // Reemplaza la plantilla del rol. Con syncUsers, propaga el diff a los
    // usuarios existentes de ese rol; sin él, solo cambia futuros usuarios.
    static async replaceRolePermissions(id: number, permissionKeys: string[], syncUsers = false): Promise<{ data: string[]; message: string }> {
        const res = await apiService.put(`/system/roles/${id}/permissions`, { permission_keys: permissionKeys, sync_users: syncUsers });
        return { data: res.data.data, message: res.data.message };
    }
}

export default PermissionService;
