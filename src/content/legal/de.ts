import type { LegalDocument } from "./types";

export const privacyDe: LegalDocument = {
  title: "Datenschutzerklärung",
  intro: [
    "Zuletzt aktualisiert: [PUBLISH_DATE].",
    "Diese Erklärung beschreibt, welche personenbezogenen Daten MenuMaker AI erhebt, warum, mit wem sie geteilt werden und welche Rechte Sie diesbezüglich haben. Der Text beschreibt das tatsächliche Verhalten des Produkts und ist keine allgemeine Vorlage.",
    "Verantwortlicher: [CONTROLLER_NAME]. Maßgebliche Rechtsordnung: [JURISDICTION]. Kontakt für Datenschutzanfragen: [PRIVACY_EMAIL].",
  ],
  sections: [
    {
      heading: "1. Was wir erheben",
      paragraphs: [
        "- Kontodaten: E-Mail-Adresse, Anzeigename, Profilbild und die von Ihnen gewählte Oberflächensprache.",
        "- Menüinhalte: Gerichte, Preise, Beschreibungen und Angaben zum Lokal, die Sie eingeben oder die wir aus einer von Ihnen hochgeladenen Datei extrahieren.",
        "- Hochgeladene Dateien: Wenn Sie ein Menü aus einer PDF-, Word- oder Excel-Datei importieren, wird diese Datei nur so lange gespeichert, wie zur Textextraktion nötig — sie wird unmittelbar nach erfolgreichem Import automatisch gelöscht und danach nicht aufbewahrt.",
        "- Zahlungsdaten: Beim Kauf von Guthaben speichern wir den Zahlungsstatus, den Betrag, die Währung sowie Stripes eigene Transaktionskennungen. Ihre Kartennummer sehen oder speichern wir nie — das übernimmt Stripe direkt.",
        "- Technische Daten: Ihre IP-Adresse, ausschließlich zur Durchsetzung von Ratenbegrenzungen und zur Missbrauchsprävention (z. B. Brute-Force-Anmeldeversuche, API-Überlastung).",
      ],
    },
    {
      heading: "2. Warum wir diese Daten verarbeiten (Rechtsgrundlage)",
      paragraphs: [
        "- Konto- und Menüdaten: Verarbeitung zur Erfüllung des Vertrags mit Ihnen — ohne diese Daten ist die Nutzung des Dienstes nicht möglich.",
        "- IP-basierte Ratenbegrenzung: Verarbeitung auf Grundlage unseres berechtigten Interesses an Verfügbarkeit und Sicherheit des Dienstes gegen Missbrauch.",
        "- Zahlungsdaten: Verarbeitung zur Erfüllung des Kaufvertrags und zur Erfüllung buchhalterischer Pflichten.",
      ],
    },
    {
      heading: "3. Mit wem wir Daten teilen",
      paragraphs: [
        "- Supabase — unser Anbieter für Datenbank, Authentifizierung und Dateispeicher. Speichert alle oben beschriebenen Daten.",
        "- Anthropic (Claude API) — erhält den Text Ihres Menüs, wenn Sie KI-Funktionen nutzen (Analyse, Übersetzung, Beschreibungserstellung, Verbesserungsvorschläge). Speziell für Verbesserungsvorschläge werden zusätzlich der Name und die Geschäftsart Ihres Lokals zusammen mit dem Menütext übermittelt. Anthropic erhält weder Ihre E-Mail-Adresse noch Ihr Passwort oder Zahlungsdaten.",
        '- Pexels — erhält nur eine kurze, automatisch generierte Suchphrase zu einem Gericht (z. B. "grilled salmon plate"), um ein Stockfoto zu finden. Kontodaten oder der gesamte Menütext werden nicht übermittelt.',
        "- Cloudflare (Turnstile) — führt die Bot-Erkennung auf unseren Anmelde- und Registrierungsseiten durch. Was das eigene Widget von Cloudflare erfasst, unterliegt der Datenschutzerklärung von Cloudflare, nicht dieser.",
        "- Vercel — unser Hosting-Anbieter, der im Rahmen des Infrastrukturbetriebs übliche Zugriffsprotokolle führt.",
        "- Stripe — verarbeitet Zahlungen, sofern der Guthabenkauf aktiviert ist; verarbeitet Ihre Kartendaten direkt und gibt sie nie an uns weiter.",
        "Wir verkaufen keine personenbezogenen Daten und geben sie zu keinem Zeitpunkt zu Werbezwecken weiter.",
      ],
    },
    {
      heading: "4. Cookies",
      paragraphs: [
        "Wir verwenden keine Analyse- oder Werbe-Cookies. Tatsächlich gesetzt werden:",
        "- Ein Sitzungs-Cookie (Name beginnt mit sb-), das Sie bis zu 30 Tage lang angemeldet hält.",
        "- Ein Sprach-Cookie, das Ihre gewählte Oberflächensprache bis zu 1 Jahr lang speichert.",
        "- Wenn Sie mit dem Cloudflare-Turnstile-Widget auf der Anmelde- oder Registrierungsseite interagieren, kann Cloudflare im Rahmen der Bot-Erkennung ein eigenes Cookie setzen — dies unterliegt der Richtlinie von Cloudflare, nicht der Kontrolle dieser App.",
      ],
    },
    {
      heading: "5. Wie lange wir Daten speichern",
      paragraphs: [
        "- Konto- und Menüdaten werden bis zur Löschung Ihres Kontos gespeichert.",
        "- Hochgeladene Quelldateien werden unmittelbar nach erfolgreichem Import automatisch gelöscht — wir bewahren keine langfristige Kopie Ihres Originaldokuments auf.",
        "- IP-Adressen zur Ratenbegrenzung werden derzeit unbefristet als Teil der Missbrauchsschutzzähler gespeichert; wir arbeiten an einer automatischen Löschfrist für diese Daten und werden diesen Abschnitt aktualisieren, sobald das umgesetzt ist.",
        "- Zahlungsdaten werden gemäß buchhalterischer und steuerlicher Vorgaben aufbewahrt.",
      ],
    },
    {
      heading: "6. Internationale Datenübermittlungen",
      paragraphs: [
        "Unsere Infrastruktur und Auftragsverarbeiter (Supabase, Anthropic, Vercel, Cloudflare, Stripe) können Daten außerhalb Ihres Landes verarbeiten, unter anderem in den USA. Soweit dies eine Übermittlung aus der EU/dem Vereinigten Königreich/dem EWR heraus bedeutet, stützen wir uns auf die von diesen Anbietern bereitgestellten Garantien (z. B. Standardvertragsklauseln), wie gesetzlich vorgeschrieben.",
      ],
    },
    {
      heading: "7. Ihre Rechte",
      paragraphs: [
        "Je nach Ihrem Wohnort haben Sie unter Umständen das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung oder Übertragung Ihrer personenbezogenen Daten sowie ein Widerspruchsrecht gegen bestimmte Verarbeitungen. Wenden Sie sich zur Ausübung dieser Rechte an [PRIVACY_EMAIL].",
        "- Löschung: Das Löschen Ihres Kontos über Ihre Profilseite entfernt sofort Ihr Konto, Ihre Menüs und Ihre Zahlungsdaten. Ehrlich gesagt: Dateien, die Sie zuvor hochgeladen oder exportiert haben (Profilbilder, Menü-Exporte, Gerichtefotos), werden bei der Kontolöschung noch nicht automatisch aus dem Speicher entfernt — eine bekannte Lücke, an deren Schließung wir arbeiten. Wenden Sie sich in der Zwischenzeit an [PRIVACY_EMAIL], um eine manuelle Löschung zu beantragen.",
        "- Datenübertragbarkeit: Wir bieten derzeit keinen selbstständigen Datenexport an. Wenden Sie sich an [PRIVACY_EMAIL], und wir stellen Ihre Daten manuell bereit.",
        "- Sie haben zudem das Recht, sich bei Ihrer örtlichen Datenschutzaufsichtsbehörde zu beschweren.",
      ],
    },
    {
      heading: "8. Kanada",
      paragraphs: [
        "Für Nutzer in Kanada gilt dieser Abschnitt gemäß dem Personal Information Protection and Electronic Documents Act (PIPEDA). Unsere für den Datenschutz und die Einhaltung des kanadischen Datenschutzrechts verantwortliche Person erreichen Sie unter [PRIVACY_EMAIL]. Wir erheben und verwenden Ihre personenbezogenen Daten nur für die in dieser Erklärung beschriebenen Zwecke und nur mit Ihrer informierten Einwilligung — die in der Praxis mit der Kontoerstellung und der Zustimmung zu dieser Erklärung erteilt wird.",
      ],
    },
    {
      heading: "9. Europäische Union, Vereinigtes Königreich, EWR und Schweiz",
      paragraphs: [
        "Dieser Dienst wird derzeit nicht für Einwohner der Europäischen Union, des Vereinigten Königreichs, des Europäischen Wirtschaftsraums oder der Schweiz angeboten. Registrierung und Anmeldung werden für aus diesen Regionen erkannte Besucher technisch blockiert. Wenn Sie glauben, fälschlicherweise blockiert worden zu sein, wenden Sie sich an [PRIVACY_EMAIL].",
      ],
    },
    {
      heading: "10. Kinder",
      paragraphs: [
        "Dieser Dienst ist für die geschäftliche Nutzung bestimmt und richtet sich nicht an Kinder. Wir erheben wissentlich keine personenbezogenen Daten von Kindern.",
      ],
    },
    {
      heading: "11. Änderungen dieser Erklärung",
      paragraphs: [
        "Wir können diese Erklärung im Zuge der Produktentwicklung aktualisieren. Wesentliche Änderungen werden durch die Aktualisierung des Datums oben auf dieser Seite kenntlich gemacht.",
      ],
    },
    {
      heading: "12. Kontakt",
      paragraphs: [
        "Fragen oder Anfragen zum Datenschutz: [PRIVACY_EMAIL].",
        "Um Missbrauch oder Inhalte zu melden, die diese Richtlinien verletzen: [ABUSE_EMAIL].",
      ],
    },
  ],
};

export const termsDe: LegalDocument = {
  title: "Nutzungsbedingungen",
  intro: [
    "Zuletzt aktualisiert: [PUBLISH_DATE].",
    "Diese Bedingungen regeln Ihre Nutzung von MenuMaker AI, betrieben von [CONTROLLER_NAME]. Mit der Kontoerstellung stimmen Sie ihnen zu.",
  ],
  sections: [
    {
      heading: "1. Der Dienst",
      paragraphs: [
        "MenuMaker AI hilft Unternehmen, Menüs zu erstellen, zu gestalten und zu veröffentlichen — einschließlich KI-gestützter Texterkennung, Übersetzung und Fotovorschlägen.",
      ],
    },
    {
      heading: "2. Konten",
      paragraphs: [
        "Sie müssen bei der Registrierung wahrheitsgemäße Angaben machen und sind für die Sicherheit Ihrer Kontodaten verantwortlich. Sie müssen alt genug sein, um in Ihrer Rechtsordnung einen verbindlichen Vertrag einzugehen.",
      ],
    },
    {
      heading: "3. Zulässige Nutzung",
      paragraphs: [
        "Sie dürfen den Dienst nicht nutzen, um rechtswidrige, rechtsverletzende oder missbräuchliche Inhalte hochzuladen oder zu veröffentlichen, Ratenbegrenzungen oder Sicherheitsmaßnahmen zu umgehen oder den Dienst ohne Genehmigung auszulesen oder weiterzuverkaufen.",
        "Melden Sie Missbrauch oder Verstöße an [ABUSE_EMAIL].",
      ],
    },
    {
      heading: "4. Ihre Inhalte",
      paragraphs: [
        "Sie behalten das Eigentum an den von Ihnen erstellten oder hochgeladenen Menüinhalten. Sie räumen uns eine beschränkte Lizenz ein, diese zu speichern, zu verarbeiten und anzuzeigen, soweit dies zur Erbringung des Dienstes erforderlich ist (z. B. zur Darstellung Ihrer öffentlichen Menüseite).",
        "KI-generierte Texte und Fotovorschläge werden als Hilfestellung bereitgestellt und können Fehler enthalten. Sie sind dafür verantwortlich, Menüinhalte — einschließlich Preisen, Zutaten und Allergeninformationen — vor der Veröffentlichung zu prüfen und zu verifizieren.",
      ],
    },
    {
      heading: "5. Guthaben und Zahlungen",
      paragraphs: [
        "Bestimmte Funktionen erfordern Guthaben, das über unseren Zahlungsdienstleister erworben werden kann. Preise können sich ändern. Außer wenn gesetzlich vorgeschrieben, sind erworbene Guthaben nicht erstattungsfähig.",
      ],
    },
    {
      heading: "6. Dienste Dritter",
      paragraphs: [
        "Der Dienst stützt sich auf Drittanbieter (u. a. Supabase, Anthropic, Pexels, Cloudflare, Vercel und Stripe), die in unserer Datenschutzerklärung beschrieben sind.",
      ],
    },
    {
      heading: "7. Beendigung",
      paragraphs: [
        "Sie können Ihr Konto jederzeit über Ihre Profilseite löschen. Wir können Konten sperren oder kündigen, die gegen diese Bedingungen oder geltendes Recht verstoßen.",
      ],
    },
    {
      heading: "8. Geografische Beschränkung",
      paragraphs: [
        "Dieser Dienst ist nicht für Einwohner der Europäischen Union, des Vereinigten Königreichs, des Europäischen Wirtschaftsraums oder der Schweiz bestimmt und wird ihnen nicht angeboten. Registrierung und Anmeldung werden aus diesen Regionen technisch blockiert. Sie stimmen zu, nicht zu versuchen, diese Beschränkung zu umgehen (z. B. über ein VPN oder falsche Standortangaben), sofern Sie in einer dieser Regionen ansässig sind.",
      ],
    },
    {
      heading: "9. Haftungsausschluss und Haftungsbeschränkung",
      paragraphs: [
        'Der Dienst wird "wie besehen" ohne jegliche Gewährleistung bereitgestellt. Im nach dem Recht von [JURISDICTION] maximal zulässigen Umfang haftet [CONTROLLER_NAME] nicht für indirekte, zufällige oder Folgeschäden, die aus Ihrer Nutzung des Dienstes entstehen.',
      ],
    },
    {
      heading: "10. Anwendbares Recht",
      paragraphs: [
        "Diese Bedingungen unterliegen dem Recht von [JURISDICTION], unter Ausschluss der Kollisionsnormen.",
      ],
    },
    {
      heading: "11. Änderungen dieser Bedingungen",
      paragraphs: [
        "Wir können diese Bedingungen im Zuge der Produktentwicklung aktualisieren. Die fortgesetzte Nutzung des Dienstes nach einer Aktualisierung gilt als Zustimmung zu den geänderten Bedingungen.",
      ],
    },
    {
      heading: "12. Kontakt",
      paragraphs: ["Fragen zu diesen Bedingungen: [PRIVACY_EMAIL]."],
    },
  ],
};
