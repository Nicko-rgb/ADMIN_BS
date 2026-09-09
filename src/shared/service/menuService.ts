import { apiService } from '../utils/apiService';
import type { MenuItem } from '../interfaces/menu.interface';

export class MenuService {
    static async getMenu(): Promise<MenuItem[]> {
        const res = await apiService.get('/system/my-menu');
        return res.data.data;
    }
}
