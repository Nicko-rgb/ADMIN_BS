// País con su bandera, para mostrar en una celda de tabla (nombre + TableImage). Usado por
// cualquier módulo cuyo listado incluya el país de una empresa/persona (companys, users).
export interface CountryDisplay {
    name: string;
    flagUrl: string;
    phoneCode: string;
}
