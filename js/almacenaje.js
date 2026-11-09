/*
 * Prompts (IA: Claude, Anthropic) Marc
 * 1. "como plantearias el manejo de errores respecto a lo desarollado"
 * 2. "como puedo ver y modificar a mano lo que hay guardado en localStorage desde las herramientas del navegador opera"
 
 */

const NOMBRE_BD = "tandem"
const VERSION_BD = 2
const TABLA = "intercambios"

const exchanges = [
	{
		titulo: "Alemán nativo por español, quedamos a charlar",
		email: "j@uni.es",
		fecha: "2026-11-06",
		descripcion: "Soy de Múnich, de Erasmus este curso. Me encantaría quedar para tomar algo y charlar en alemán y español.",
		tipo: "offer",
		idioma: "de",
		nivel: "nt",
		aCambioDe: "es",
		modalidad: "in-person",
		disponibilidad: "Tardes"
	},
	{
		titulo: "Practicar inglés a cambio de catalán",
		email: "aina@uni.es",
		fecha: "2026-11-06",
		descripcion: "Preparo el C1 y necesito soltura hablando. Ofrezco catalán nativo y paciencia infinita.",
		tipo: "request",
		idioma: "en",
		nivel: "B2",
		aCambioDe: "ca",
		modalidad: "online",
		disponibilidad: "Fines de semana"
	},
	{
		titulo: "Francés viendo series o paseando por el Retiro",
		email: "camille@uni.es",
		fecha: "2026-11-06",
		descripcion: "Lyonnaise en Madrid. Podemos ver series en francés y comentarlas, o pasear por el Retiro",
		tipo: "offer",
		idioma: "fr",
		nivel: "nt",
		aCambioDe: "es",
		modalidad: "both",
		disponibilidad: "Mañanas"
	},
	{
		titulo: "Japonés básico: busco conversación con nativos",
		email: "diego@uni.es",
		fecha: "2026-11-05",
		descripcion: "Estudio japonés por mi cuenta y quiero practicar conversación básica con alguien nativo",
		tipo: "request",
		idioma: "ja",
		nivel: "A2",
		aCambioDe: "es",
		modalidad: "online",
		disponibilidad: "Noches"
	},
	{
		titulo: "Italiano en un café semanal",
		email: "marco@uni.es",
		fecha: "2026-11-05",
		descripcion: "Romano, doctorado en Historia. Un café a la semana en la cafetería de la facultad",
		tipo: "offer",
		idioma: "it",
		nivel: "nt",
		aCambioDe: "en",
		modalidad: "in-person",
		disponibilidad: "Mediodía"
	},
	{
		titulo: "Portugués antes de mi viaje a Lisboa",
		email: "sofia@uni.es",
		fecha: "2026-11-04",
		descripcion: "Me voy de intercambio a Lisboa en febrero. Busco a alguien para practicar antes del viaje.",
		tipo: "request",
		idioma: "pt",
		nivel: "B1",
		aCambioDe: "fr",
		modalidad: "both",
		disponibilidad: "Flexible"
	},
]

const users = [
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
const SIEMBRA = "flagSiembraObjecto"

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

export async function sembrarIntercambios() {
	if (localStorage.getItem(SIEMBRA) !== null)
		return
	const bd = await abrirBD()
	await new Promise((resolve, reject) => {
		const transaccion = bd.transaction(TABLA, "readwrite")
		const almacen = transaccion.objectStore(TABLA)
		for (const elemento of exchanges ) {
			almacen.add(elemento)
		}
		transaccion.oncomplete = () => resolve()
		transaccion.onabort = () => reject(transaccion.error)
		transaccion.onerror = () => reject(transaccion.error)
	})
	localStorage.setItem(SIEMBRA, "true")
}
