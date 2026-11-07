/*
 * Prompts (IA: Claude, Anthropic) Marc
 * 1. "como plantearias el manejo de errores respecto a lo desarollado"
 * 2. "como puedo ver y modificar a mano lo que hay guardado en localStorage desde las herramientas del navegador opera"
 
 */

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
	{ id: 1, name: "Jonas Keller", email: "j@uni.es", password: "1234", faculty: "Ingeniería Industrial", nativeLanguage: "de", role: "student", createdAt: "2026-09-22" },
	{ id: 2, name: "Aina Puig", email: "aina@uni.es", password: "1234", faculty: "Filología", nativeLanguage: "ca", role: "student", createdAt: "2026-09-18" },
	{ id: 3, name: "Camille Durand", email: "camille@uni.es", password: "1234", faculty: "Bellas Artes", nativeLanguage: "fr", role: "student", createdAt: "2026-09-15" },
	{ id: 4, name: "Diego Ruiz", email: "diego@uni.es", password: "1234", faculty: "Informática", nativeLanguage: "es", role: "admin", createdAt: "2026-09-03" }
]


export function obtenerUsuarioActivo() {
	return localStorage.getItem("usuarioActivo")
}

const CLAVE_USUARIOS = "usuarios"
const CLAVE_USUARIO_ACTIVO = "usuarioActivo"

function guardarUsuarios(lista) {
	try {
		localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista))
	} catch {
		throw new Error("No se han podido guardar los usuarios en el navegador.")
	}
}

export function obtenerUsuarios() {
	const texto = localStorage.getItem(CLAVE_USUARIOS)

	if (texto === null) {
		guardarUsuarios(users)
		return structuredClone(users)
	}

	try {
		return JSON.parse(texto)
	} catch {
		throw new Error("Los usuarios guardados están dañados.")
	}
}

export function crearUsuario(datos) {
	const lista = obtenerUsuarios()
	const email = datos.email.trim().toLowerCase()

	if (lista.some(usuario => usuario.email.toLowerCase() === email))
		throw new Error("Ya existe un usuario con este email.")

	const hoy = new Date()
	const mes = String(hoy.getMonth() + 1).padStart(2, "0")
	const dia = String(hoy.getDate()).padStart(2, "0")
	const usuario = {
		...datos,
		id: Math.max(0, ...lista.map(u => u.id)) + 1,
		email,
		createdAt: `${hoy.getFullYear()}-${mes}-${dia}`
	}

	lista.push(usuario)
	guardarUsuarios(lista)
	return usuario
}

export function borrarUsuario(id) {
	const lista = obtenerUsuarios()
	const usuario = lista.find(u => u.id === id)

	if (!usuario)
		throw new Error("Ese usuario ya no existe.")
	if (usuario.email === obtenerUsuarioActivo())
		throw new Error("No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada.")

	guardarUsuarios(lista.filter(u => u.id !== id))
	return usuario
}

export function loguearUsuario(email, password) {
	const correo = email.trim().toLowerCase()
	const usuario = obtenerUsuarios().find(u => u.email.toLowerCase() === correo && u.password === password)

	if (!usuario)
		return null

	localStorage.setItem(CLAVE_USUARIO_ACTIVO, usuario.email)
	return usuario
}

export function cerrarSesion() {
	localStorage.removeItem(CLAVE_USUARIO_ACTIVO)
}

const NOMBRE_BD = "tandem"
const VERSION_BD = 2
const TABLA = "intercambios"

export function abrirBD() {
	return new Promise((resolve, reject) => {
		const peticion = indexedDB.open(NOMBRE_BD, VERSION_BD)

		peticion.onupgradeneeded = (evento) => {
			const bd = peticion.result

			if (evento.oldVersion < 1) {
				bd.createObjectStore(TABLA, { keyPath: "id", autoIncrement: true })
			}

			if (evento.oldVersion < 2) {
				const tabla = peticion.transaction.objectStore(TABLA)
				const hoy = new Date().toISOString().slice(0, 10)

				for (const e of exchanges) {
					tabla.add({
						titulo: e.user.name + " · " + e.language.toUpperCase(),
						email: users.find(u => u.name === e.user.name)?.email || "",
						fecha: hoy,
						descripcion: e.description,
						tipo: e.type
					})
				}
			}
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