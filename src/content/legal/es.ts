import type { LegalDocument } from "./types";

export const privacyEs: LegalDocument = {
  title: "Política de privacidad",
  intro: [
    "Última actualización: [PUBLISH_DATE].",
    "Esta política explica qué datos personales recopila MenuMaker AI, por qué, con quién se comparten y qué derechos tiene usted sobre ellos. El texto describe el comportamiento real del producto, no es una plantilla genérica.",
    "Responsable del tratamiento: [CONTROLLER_NAME]. Jurisdicción aplicable: [JURISDICTION]. Contacto para solicitudes de privacidad: [PRIVACY_EMAIL].",
  ],
  sections: [
    {
      heading: "1. Qué recopilamos",
      paragraphs: [
        "- Datos de la cuenta: dirección de correo electrónico, nombre visible, imagen de avatar e idioma de interfaz elegido.",
        "- Contenido del menú: platos, precios, descripciones y datos del establecimiento que usted introduce o que extraemos de un archivo que sube.",
        "- Archivos subidos: si importa un menú desde un archivo PDF, Word o Excel, ese archivo se almacena solo el tiempo necesario para extraer su texto; se elimina automáticamente justo después de una importación exitosa y no se conserva después.",
        "- Registros de pago: al comprar créditos, almacenamos el estado del pago, el importe, la moneda y los identificadores de transacción propios de Stripe. Nunca vemos ni almacenamos el número de su tarjeta; eso lo gestiona Stripe directamente.",
        "- Datos técnicos: su dirección IP, utilizada únicamente para aplicar límites de frecuencia y prevenir abusos (por ejemplo, intentos de inicio de sesión por fuerza bruta o saturación de la API).",
      ],
    },
    {
      heading: "2. Por qué tratamos estos datos (base legal)",
      paragraphs: [
        "- Datos de cuenta y menú: se tratan para ejecutar el contrato con usted; sin ellos no es posible usar el servicio.",
        "- Limitación de frecuencia basada en IP: se trata sobre la base de nuestro interés legítimo en mantener el servicio disponible y seguro frente a abusos.",
        "- Datos de pago: se tratan para ejecutar el contrato de compra y cumplir obligaciones contables.",
      ],
    },
    {
      heading: "3. Con quién compartimos datos",
      paragraphs: [
        "- Supabase — nuestro proveedor de base de datos, autenticación y almacenamiento de archivos. Almacena todos los datos descritos arriba.",
        "- Anthropic (Claude API) — recibe el texto de su menú cuando usa funciones de IA (análisis, traducción, redacción de descripciones, sugerencias de mejora). Específicamente para las sugerencias de mejora, también se envían el nombre y el tipo de establecimiento junto con el texto del menú. Anthropic no recibe su correo electrónico, contraseña ni datos de pago.",
        '- Pexels — recibe únicamente una breve frase de búsqueda que describe un plato (por ejemplo, "grilled salmon plate"), generada automáticamente para encontrar una foto de stock. No recibe los datos de su cuenta ni el texto completo del menú.',
        "- Cloudflare (Turnstile) — ejecuta la verificación anti-bots en nuestras páginas de inicio de sesión y registro. Lo que observa el propio widget de Cloudflare se rige por la política de privacidad de Cloudflare, no por esta.",
        "- Vercel — nuestro proveedor de alojamiento, que mantiene registros estándar de solicitudes como parte del funcionamiento de la infraestructura.",
        "- Stripe — procesa los pagos cuando la compra de créditos está habilitada; gestiona los datos de su tarjeta directamente y nunca nos los transmite.",
        "No vendemos datos personales ni los compartimos con nadie con fines publicitarios.",
      ],
    },
    {
      heading: "4. Cookies",
      paragraphs: [
        "No utilizamos cookies analíticas ni publicitarias. Las cookies que realmente se establecen son:",
        "- Una cookie de sesión (el nombre empieza por sb-) que mantiene su sesión iniciada durante un máximo de 30 días.",
        "- Una cookie de idioma que recuerda el idioma de interfaz elegido durante un máximo de 1 año.",
        "- Si interactúa con el widget de Cloudflare Turnstile en la página de inicio de sesión o registro, Cloudflare puede establecer su propia cookie como parte de la verificación anti-bots; esto se rige por la política de Cloudflare, no por esta aplicación.",
      ],
    },
    {
      heading: "5. Durante cuánto tiempo conservamos los datos",
      paragraphs: [
        "- Los datos de cuenta y menú se conservan hasta que elimine su cuenta.",
        "- Los archivos fuente subidos se eliminan automáticamente justo después de una importación exitosa; no conservamos una copia a largo plazo de su documento original.",
        "- Las direcciones IP utilizadas para la limitación de frecuencia se conservan actualmente de forma indefinida como parte de los contadores de prevención de abusos; estamos trabajando en añadir una caducidad automática para estos datos y actualizaremos esta sección cuando esté disponible.",
        "- Los registros de pago se conservan según lo requieran las obligaciones contables y fiscales.",
      ],
    },
    {
      heading: "6. Transferencias internacionales",
      paragraphs: [
        "Nuestra infraestructura y encargados del tratamiento (Supabase, Anthropic, Vercel, Cloudflare, Stripe) pueden procesar datos fuera de su país, incluido Estados Unidos. Cuando esto implique una transferencia fuera de la UE/Reino Unido/EEE, nos basamos en las garantías que ofrecen estos proveedores (como las cláusulas contractuales tipo), según exija la ley aplicable.",
      ],
    },
    {
      heading: "7. Sus derechos",
      paragraphs: [
        "Dependiendo de su ubicación, puede tener derecho a acceder, rectificar, eliminar, limitar o exportar sus datos personales, y a oponerse a determinados tratamientos. Para ejercer cualquiera de estos derechos, contacte con [PRIVACY_EMAIL].",
        "- Eliminación: eliminar su cuenta desde su página de perfil elimina de inmediato su cuenta, sus menús y sus registros de pago. Dicho con honestidad: los archivos que haya subido o exportado previamente (avatares, menús exportados, fotos de platos) todavía no se eliminan automáticamente del almacenamiento al eliminar la cuenta; es una carencia conocida en la que estamos trabajando. Mientras tanto, contacte con [PRIVACY_EMAIL] para solicitar su eliminación manual.",
        "- Portabilidad: todavía no ofrecemos una exportación de datos autoservicio. Contacte con [PRIVACY_EMAIL] y le proporcionaremos sus datos manualmente.",
        "- También tiene derecho a presentar una reclamación ante su autoridad local de protección de datos.",
      ],
    },
    {
      heading: "8. Canadá",
      paragraphs: [
        "Para los usuarios en Canadá, esta sección se ofrece conforme a la Ley de Protección de Información Personal y Documentos Electrónicos (PIPEDA). Puede contactar con nuestra persona responsable de privacidad, encargada del cumplimiento de la legislación canadiense de privacidad, en [PRIVACY_EMAIL]. Recopilamos y usamos su información personal únicamente para los fines descritos en esta política, y únicamente con su consentimiento informado, otorgado en la práctica al crear una cuenta y aceptar esta política.",
      ],
    },
    {
      heading: "9. Unión Europea, Reino Unido, EEE y Suiza",
      paragraphs: [
        "Este servicio actualmente no se ofrece a residentes de la Unión Europea, el Reino Unido, el Espacio Económico Europeo o Suiza. El registro y el inicio de sesión están bloqueados técnicamente para los visitantes detectados en estas regiones. Si cree que fue bloqueado por error, contacte con [PRIVACY_EMAIL].",
      ],
    },
    {
      heading: "10. Menores",
      paragraphs: [
        "Este servicio está destinado al uso empresarial y no se dirige a menores. No recopilamos conscientemente datos personales de menores.",
      ],
    },
    {
      heading: "11. Cambios en esta política",
      paragraphs: [
        "Podemos actualizar esta política a medida que el producto evolucione. Los cambios sustanciales se reflejarán actualizando la fecha en la parte superior de esta página.",
      ],
    },
    {
      heading: "12. Contacto",
      paragraphs: [
        "Preguntas o solicitudes de privacidad: [PRIVACY_EMAIL].",
        "Para denunciar abusos o contenido que infrinja estas políticas: [ABUSE_EMAIL].",
      ],
    },
  ],
};

export const termsEs: LegalDocument = {
  title: "Términos del servicio",
  intro: [
    "Última actualización: [PUBLISH_DATE].",
    "Estos términos rigen su uso de MenuMaker AI, operado por [CONTROLLER_NAME]. Al crear una cuenta, usted los acepta.",
  ],
  sections: [
    {
      heading: "1. El servicio",
      paragraphs: [
        "MenuMaker AI ayuda a las empresas a crear, diseñar y publicar menús, incluida la extracción de texto asistida por IA, la traducción y las sugerencias de fotos.",
      ],
    },
    {
      heading: "2. Cuentas",
      paragraphs: [
        "Debe proporcionar información veraz al registrarse y es responsable de mantener seguras las credenciales de su cuenta. Debe tener edad suficiente para celebrar un contrato vinculante en su jurisdicción.",
      ],
    },
    {
      heading: "3. Uso aceptable",
      paragraphs: [
        "No puede usar el servicio para subir o publicar contenido ilícito, infractor o abusivo, para intentar eludir los límites de frecuencia o los controles de seguridad, ni para extraer datos o revender el servicio sin autorización.",
        "Denuncie abusos o infracciones a [ABUSE_EMAIL].",
      ],
    },
    {
      heading: "4. Su contenido",
      paragraphs: [
        "Usted conserva la propiedad del contenido del menú que crea o sube. Nos concede una licencia limitada para almacenarlo, procesarlo y mostrarlo según sea necesario para prestar el servicio (por ejemplo, para representar la página pública de su menú).",
        "El texto y las sugerencias de fotos generados por IA se ofrecen como una comodidad y pueden contener errores. Usted es responsable de revisar y verificar el contenido del menú, incluidos precios, ingredientes e información sobre alérgenos, antes de publicarlo.",
      ],
    },
    {
      heading: "5. Créditos y pagos",
      paragraphs: [
        "Ciertas funciones requieren créditos, que pueden comprarse a través de nuestro procesador de pagos. Los precios pueden cambiar. Salvo que la ley lo exija, las compras de créditos no son reembolsables.",
      ],
    },
    {
      heading: "6. Servicios de terceros",
      paragraphs: [
        "El servicio depende de proveedores externos (incluidos Supabase, Anthropic, Pexels, Cloudflare, Vercel y Stripe) descritos en nuestra Política de privacidad.",
      ],
    },
    {
      heading: "7. Terminación",
      paragraphs: [
        "Puede eliminar su cuenta en cualquier momento desde su página de perfil. Podemos suspender o cancelar cuentas que infrinjan estos términos o la ley aplicable.",
      ],
    },
    {
      heading: "8. Restricción geográfica",
      paragraphs: [
        "Este servicio no está destinado ni se ofrece a residentes de la Unión Europea, el Reino Unido, el Espacio Económico Europeo o Suiza. El registro y el inicio de sesión están bloqueados técnicamente desde esas regiones. Usted acepta no intentar eludir esta restricción (por ejemplo, mediante una VPN o falseando su ubicación) si reside en una de estas regiones.",
      ],
    },
    {
      heading: "9. Exenciones de responsabilidad y limitación de responsabilidad",
      paragraphs: [
        'El servicio se proporciona "tal cual", sin garantías de ningún tipo. En la medida máxima permitida por la ley de [JURISDICTION], [CONTROLLER_NAME] no será responsable de daños indirectos, incidentales o consecuentes derivados de su uso del servicio.',
      ],
    },
    {
      heading: "10. Ley aplicable",
      paragraphs: [
        "Estos términos se rigen por las leyes de [JURISDICTION], sin tener en cuenta sus normas de conflicto de leyes.",
      ],
    },
    {
      heading: "11. Cambios en estos términos",
      paragraphs: [
        "Podemos actualizar estos términos a medida que el producto evolucione. El uso continuado del servicio tras una actualización constituye la aceptación de los términos revisados.",
      ],
    },
    {
      heading: "12. Contacto",
      paragraphs: ["Preguntas sobre estos términos: [PRIVACY_EMAIL]."],
    },
  ],
};
