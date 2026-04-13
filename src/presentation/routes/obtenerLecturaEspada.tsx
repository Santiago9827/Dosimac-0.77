// services/espadaApi.ts
const BASE_URL = "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada";

export async function obtenerLecturaEspada(crotal: string) {
    const respuesta = await fetch(`${BASE_URL}/${encodeURIComponent(crotal)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    let datos: any = null;
    let textoPlano = "";

    try {
        textoPlano = await respuesta.text();

        if (textoPlano) {
            try {
                datos = JSON.parse(textoPlano);
            } catch {
                datos = textoPlano;
            }
        }
    } catch {
        textoPlano = "";
        datos = null;
    }

    return {
        ok: respuesta.ok,
        status: respuesta.status,
        data: datos,
        rawText: textoPlano,
    };
}