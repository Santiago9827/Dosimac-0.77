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

const ENDPOINT_UPDATE_ID =
    "http://192.168.11.203:6060/CtiAlimentacionAPI/api/espada/updateId";

export async function postActualizarId(
    payload: { crotal: number; id: string }
) {
    const res = await fetch(ENDPOINT_UPDATE_ID, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    let data: any = null;
    let rawText = "";

    try {
        rawText = await res.text();

        if (rawText) {
            try {
                data = JSON.parse(rawText);
            } catch {
                data = rawText;
            }
        }
    } catch {
        rawText = "";
        data = null;
    }

    return { ok: res.ok, status: res.status, data, rawText };
}



//Funcion para mostrar solo fecha 
export function formatearSoloFecha(fecha?: string) {
    if (!fecha) return "—";

    const fechaLimpia = String(fecha).replace("Z[UTC]", "Z");
    const d = new Date(fechaLimpia);

    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("es-ES");
}