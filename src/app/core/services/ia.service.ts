import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IaService {
  
  // ⚠️ AQUÍ DEBES PONER TU LLAVE REAL DE GOOGLE AI STUDIO
  private apiKey = 'AQ.Ab8RN6J9GSnkdLfRFNeUSm5XMmThKBnhVv4nOus72CHzDDPifQ';

  async analizarMedidas(paciente: any): Promise<string> {
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;    // Prompt ajustado para evitar filtros médicos estrictos
    const prompt = `
      Actúa como un asesor experto en óptica. Analiza esta medida a la vista del cliente ${paciente.nombre}:
      - Ojo Derecho (OD): Esfera ${paciente.esferaOD || 0}, Cilindro ${paciente.cilindroOD || 0}, Eje ${paciente.ejeOD || 0}°
      - Ojo Izquierdo (OI): Esfera ${paciente.esferaOI || 0}, Cilindro ${paciente.cilindroOI || 0}, Eje ${paciente.ejeOI || 0}°

      Redacta una sugerencia comercial y técnica breve (2 a 3 párrafos) recomendando:
      1. El tipo de material de luna ideal (ej. alto índice si la medida es alta, o policarbonato).
      2. Tratamientos recomendados (antireflejo, filtro azul, fotocromático) justificando el porqué según su medida.
      No uses lenguaje médico restrictivo, enfócate en la recomendación del producto óptico para mejorar su visión diaria.
    `;

    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await respuesta.json();

      // ✨ NUEVO: Si Google nos rechaza, ahora nos dirá exactamente por qué
      if (!respuesta.ok) {
        console.error('Error detallado de Google:', data);
        return `Error de la IA: ${data.error?.message || 'Llave API incorrecta o inválida.'}`;
      }

      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return 'El modelo no devolvió una respuesta válida. Intenta de nuevo.';
      }
    } catch (error) {
      console.error('Error de red con la IA:', error);
      return 'Error de conexión con el servidor de Inteligencia Artificial.';
    }
  }
}