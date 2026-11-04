export const exchanges = [
	{
		id: 1,
		type: "offer",
		date: "hace 2 h",
		language: "de",
		level: "nt",
		exchange: "es",
		description: "Soy de Múnich, de Erasmus este curso. Me encantaría quedar para tomar algo y charlar en alemán y español.",
		modality: "in-person",
		availability: "Tardes",
		user: { name: "Jonas Keller", faculty: "Ingeniería Industrial" }
	},
	{
		id: 2,
		type: "request",
		date: "hace 3 h",
		language: "en",
		level: "B2",
		exchange: "ca",
		description: "Preparo el C1 y necesito soltura hablando. Ofrezco catalán nativo y paciencia infinita.",
		modality: "online",
		availability: "Fines de semana",
		user: { name: "Aina Puig", faculty: "Filología" }
	},
	{
		id: 3,
		type: "offer",
		date: "hace 5 h",
		language: "fr",
		level: "nt",
		exchange: "es",
		description: "Lyonnaise en Madrid. Podemos ver series en francés y comentarlas, o pasear por el Retiro",
		modality: "both",
		availability: "Mañanas",
		user: { name: "Camille Durand", faculty: "Bellas Artes" }
	},
	{
		id: 4,
		type: "request",
		date: "Ayer",
		language: "ja",
		level: "A2",
		exchange: "es",
		description: "Estudio japonés por mi cuenta y quiero practicar conversación básica con alguien nativo",
		modality: "online",
		availability: "Noches",
		user: { name: "Diego Ruiz", faculty: "Informática" }
	},
	{
		id: 5,
		type: "offer",
		date: "Ayer",
		language: "it",
		level: "nt",
		exchange: "en",
		description: "Romano, doctorado en Historia. Un café a la semana en la cafetería de la facultad",
		modality: "in-person",
		availability: "Mediodía",
		user: { name: "Marco Rossi", faculty: "Historia" }
	},
	{
		id: 6,
		type: "request",
		date: "hace 2 dias",
		language: "pt",
		level: "B1",
		exchange: "fr",
		description: "Me voy de intercambio a Lisboa en febrero. Busco a alguien para practicar antes del viaje.",
		modality: "both",
		availability: "Flexible",
		user: { name: "Sofía López", faculty: "Económicas" }
	},
]

export const users = [
	{ id: 1, name: "Jonas Keller", email: "jonas@uni.es", password: "1234", faculty: "Ingeniería Industrial", nativeLanguage: "de", role: "student", createdAt: "2026-09-22" },
	{ id: 2, name: "Aina Puig", email: "aina@uni.es", password: "1234", faculty: "Filología", nativeLanguage: "ca", role: "student", createdAt: "2026-09-18" },
	{ id: 3, name: "Camille Durand", email: "camille@uni.es", password: "1234", faculty: "Bellas Artes", nativeLanguage: "fr", role: "student", createdAt: "2026-09-15" },
	{ id: 4, name: "Diego Ruiz", email: "diego@uni.es", password: "1234", faculty: "Informática", nativeLanguage: "es", role: "admin", createdAt: "2026-09-03" }
]


export function obtenerUsuarioActivo() {
	return localStorage.getItem("usuarioActivo")
}


const NOMBRE_BD = "tandem"
const VERSION_BD = 1
const TABLA = "intercambios"

export function abrirBD() {
	return new Promise((resolve, reject) => {
		const peticion = indexedDB.open(NOMBRE_BD, VERSION_BD)

		peticion.onupgradeneeded = () => {
			peticion.result.createObjectStore(TABLA, { keyPath: "id", autoIncrement: true })
		}

		peticion.onsuccess = () => resolve(peticion.result)
		peticion.onerror = () => reject(peticion.error)
	})
}

export async function publicarIntercambio(intercambio) {
	const bd = await abrirBD()
	return new Promise((resolve, reject) => {
		const peticion = bd.transaction(TABLA, "readwrite").objectStore(TABLA).add(intercambio)
		peticion.onsuccess = () => resolve(peticion.result)
		peticion.onerror = () => reject(peticion.error)
	})
}

export async function obtenerIntercambios() {
	const bd = await abrirBD()
	return new Promise((resolve, reject) => {
		const peticion = bd.transaction(TABLA, "readonly").objectStore(TABLA).getAll()
		peticion.onsuccess = () => resolve(peticion.result)
		peticion.onerror = () => reject(peticion.error)
	})
}

export async function borrarIntercambio(id) {
	const bd = await abrirBD()
	return new Promise((resolve, reject) => {
		const peticion = bd.transaction(TABLA, "readwrite").objectStore(TABLA).delete(id)
		peticion.onsuccess = () => resolve()
		peticion.onerror = () => reject(peticion.error)
	})
}
