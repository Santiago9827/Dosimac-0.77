const BASE_URL = "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/readCrotal";

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

const BASE_URL_ID = "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/readId";

export async function obtenerAnimalPorId(id: string) {
    const respuesta = await fetch(`${BASE_URL_ID}/${encodeURIComponent(id)}`, {
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

//Funcion para mostrar solo fecha 
export function formatearSoloFecha(fecha?: string) {
    if (!fecha) return "—";

    const fechaLimpia = String(fecha).replace("Z[UTC]", "Z");
    const d = new Date(fechaLimpia);

    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("es-ES");
}