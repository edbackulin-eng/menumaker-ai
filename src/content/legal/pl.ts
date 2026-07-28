import type { LegalDocument } from "./types";

export const privacyPl: LegalDocument = {
  title: "Polityka prywatności",
  intro: [
    "Ostatnia aktualizacja: [PUBLISH_DATE].",
    "Niniejsza polityka wyjaśnia, jakie dane osobowe zbiera MenuMaker AI, dlaczego, komu są udostępniane i jakie prawa Państwu przysługują. Tekst opisuje rzeczywiste działanie produktu, a nie jest ogólnym szablonem.",
    "Administrator danych: [CONTROLLER_NAME]. Właściwa jurysdykcja: [JURISDICTION]. Kontakt w sprawach prywatności: [PRIVACY_EMAIL].",
  ],
  sections: [
    {
      heading: "1. Jakie dane zbieramy",
      paragraphs: [
        "- Dane konta: adres e-mail, wyświetlana nazwa, zdjęcie profilowe oraz wybrany język interfejsu.",
        "- Treść menu: dania, ceny, opisy oraz dane lokalu, które Państwo wprowadzają lub które rozpoznajemy z przesłanego pliku.",
        "- Przesłane pliki: jeśli importują Państwo menu z pliku PDF, Word lub Excel, plik ten jest przechowywany tylko przez czas potrzebny do rozpoznania tekstu — zostaje automatycznie usunięty zaraz po pomyślnym imporcie i nie jest przechowywany dłużej.",
        "- Dane płatności: przy zakupie kredytów przechowujemy status płatności, kwotę, walutę oraz własne identyfikatory transakcji Stripe. Nigdy nie widzimy ani nie przechowujemy numeru Państwa karty — obsługuje to bezpośrednio Stripe.",
        "- Dane techniczne: adres IP, wykorzystywany wyłącznie do egzekwowania limitów żądań i zapobiegania nadużyciom (np. próbom siłowego logowania, przeciążeniu API).",
      ],
    },
    {
      heading: "2. Dlaczego przetwarzamy te dane (podstawa prawna)",
      paragraphs: [
        "- Dane konta i menu: przetwarzane w celu wykonania umowy z Państwem — bez nich korzystanie z usługi nie jest możliwe.",
        "- Limitowanie na podstawie IP: przetwarzane na podstawie naszego prawnie uzasadnionego interesu w utrzymaniu dostępności i bezpieczeństwa usługi przed nadużyciami.",
        "- Dane płatności: przetwarzane w celu wykonania umowy zakupu oraz spełnienia obowiązków księgowych.",
      ],
    },
    {
      heading: "3. Komu udostępniamy dane",
      paragraphs: [
        "- Supabase — nasz dostawca bazy danych, uwierzytelniania i przechowywania plików. Przechowuje wszystkie dane opisane powyżej.",
        "- Anthropic (Claude API) — otrzymuje tekst Państwa menu podczas korzystania z funkcji opartych na AI (analiza, tłumaczenie, tworzenie opisów, sugestie ulepszeń). Konkretnie dla sugestii ulepszeń przesyłane są również nazwa i typ Państwa lokalu wraz z tekstem menu. Anthropic nie otrzymuje Państwa e-maila, hasła ani danych płatności.",
        '- Pexels — otrzymuje jedynie krótkie, automatycznie wygenerowane hasło wyszukiwania opisujące danie (np. "grilled salmon plate"), w celu znalezienia zdjęcia stockowego. Dane konta ani cały tekst menu nie są tam przesyłane.',
        "- Cloudflare (Turnstile) — przeprowadza weryfikację antybotową na stronach logowania i rejestracji. To, co obserwuje własny widget Cloudflare, podlega polityce prywatności Cloudflare, a nie niniejszej.",
        "- Vercel — nasz dostawca hostingu, prowadzący standardowe logi żądań w ramach działania infrastruktury.",
        "- Stripe — przetwarza płatności, gdy włączony jest zakup kredytów; obsługuje dane Państwa karty bezpośrednio i nigdy nie przekazuje ich nam.",
        "Nie sprzedajemy danych osobowych i nie udostępniamy ich nikomu w celach reklamowych.",
      ],
    },
    {
      heading: "4. Pliki cookie",
      paragraphs: [
        "Nie używamy plików cookie analitycznych ani reklamowych. Faktycznie ustawiane są:",
        "- Plik cookie sesji (nazwa zaczyna się od sb-), utrzymujący Państwa zalogowanie, na okres do 30 dni.",
        "- Plik cookie lokalizacji, zapamiętujący wybrany język interfejsu, na okres do 1 roku.",
        "- Jeśli korzystają Państwo z widgetu Cloudflare Turnstile na stronie logowania lub rejestracji, Cloudflare może ustawić własny plik cookie w ramach weryfikacji antybotowej — podlega to polityce Cloudflare, a nie kontroli tej aplikacji.",
      ],
    },
    {
      heading: "5. Jak długo przechowujemy dane",
      paragraphs: [
        "- Dane konta i menu przechowywane są do momentu usunięcia przez Państwa konta.",
        "- Przesłane pliki źródłowe są usuwane automatycznie zaraz po pomyślnym imporcie — nie przechowujemy długoterminowej kopii Państwa oryginalnego dokumentu.",
        "- Adresy IP wykorzystywane do limitowania żądań są obecnie przechowywane bezterminowo jako część liczników ochrony przed nadużyciami; pracujemy nad dodaniem automatycznego okresu wygaśnięcia dla tych danych i zaktualizujemy tę sekcję, gdy zostanie to wdrożone.",
        "- Dane płatności przechowywane są zgodnie z wymogami księgowymi i podatkowymi.",
      ],
    },
    {
      heading: "6. Międzynarodowe przekazywanie danych",
      paragraphs: [
        "Nasza infrastruktura i podmioty przetwarzające (Supabase, Anthropic, Vercel, Cloudflare, Stripe) mogą przetwarzać dane poza Państwa krajem, w tym w Stanach Zjednoczonych. Jeśli wiąże się to z przekazaniem danych poza UE/Wielką Brytanię/EOG, opieramy się na zabezpieczeniach udostępnianych przez tych dostawców (takich jak standardowe klauzule umowne), zgodnie z obowiązującym prawem.",
      ],
    },
    {
      heading: "7. Państwa prawa",
      paragraphs: [
        "W zależności od miejsca zamieszkania mogą Państwo mieć prawo do dostępu, poprawiania, usunięcia, ograniczenia lub przenoszenia swoich danych osobowych oraz prawo sprzeciwu wobec niektórych przetwarzań. Aby skorzystać z któregokolwiek z tych praw, prosimy o kontakt na [PRIVACY_EMAIL].",
        "- Usunięcie: usunięcie konta ze strony profilu natychmiast usuwa Państwa konto, menu i dane płatności. Uczciwie zaznaczamy: pliki wcześniej przesłane lub wyeksportowane (awatary, wyeksportowane menu, zdjęcia dań) nie są jeszcze automatycznie usuwane z pamięci masowej przy usunięciu konta — to znana luka, nad której usunięciem pracujemy. W międzyczasie prosimy o kontakt na [PRIVACY_EMAIL] w celu ręcznego usunięcia.",
        "- Przenoszenie danych: nie oferujemy jeszcze samoobsługowego eksportu danych. Prosimy o kontakt na [PRIVACY_EMAIL] — dostarczymy Państwa dane ręcznie.",
        "- Mają Państwo również prawo złożyć skargę do lokalnego organu ochrony danych osobowych.",
      ],
    },
    {
      heading: "8. Kanada",
      paragraphs: [
        "Dla użytkowników w Kanadzie niniejsza sekcja jest udostępniana zgodnie z ustawą o ochronie danych osobowych i dokumentach elektronicznych (PIPEDA). Z naszą osobą odpowiedzialną za ochronę prywatności i zgodność z kanadyjskim prawem o ochronie danych można się skontaktować pod adresem [PRIVACY_EMAIL]. Zbieramy i wykorzystujemy Państwa dane osobowe wyłącznie w celach opisanych w niniejszej polityce i wyłącznie za Państwa świadomą zgodą — udzielaną w praktyce przy tworzeniu konta i akceptacji niniejszej polityki.",
      ],
    },
    {
      heading: "9. Unia Europejska, Wielka Brytania, EOG i Szwajcaria",
      paragraphs: [
        "Ta usługa nie jest obecnie oferowana mieszkańcom Unii Europejskiej, Wielkiej Brytanii, Europejskiego Obszaru Gospodarczego ani Szwajcarii. Rejestracja i logowanie są technicznie blokowane dla odwiedzających wykrytych w tych regionach. Jeśli uważają Państwo, że zostali zablokowani przez pomyłkę, prosimy o kontakt na [PRIVACY_EMAIL].",
      ],
    },
    {
      heading: "10. Dzieci",
      paragraphs: [
        "Ta usługa jest przeznaczona do użytku biznesowego i nie jest kierowana do dzieci. Świadomie nie zbieramy danych osobowych dzieci.",
      ],
    },
    {
      heading: "11. Zmiany w niniejszej polityce",
      paragraphs: [
        "Możemy aktualizować niniejszą politykę w miarę rozwoju produktu. Istotne zmiany będą odzwierciedlane przez aktualizację daty na górze tej strony.",
      ],
    },
    {
      heading: "12. Kontakt",
      paragraphs: [
        "Pytania lub wnioski dotyczące prywatności: [PRIVACY_EMAIL].",
        "Aby zgłosić nadużycie lub treści naruszające niniejsze zasady: [ABUSE_EMAIL].",
      ],
    },
  ],
};

export const termsPl: LegalDocument = {
  title: "Warunki korzystania z usługi",
  intro: [
    "Ostatnia aktualizacja: [PUBLISH_DATE].",
    "Niniejsze warunki regulują korzystanie z MenuMaker AI, prowadzonego przez [CONTROLLER_NAME]. Tworząc konto, akceptują je Państwo.",
  ],
  sections: [
    {
      heading: "1. Usługa",
      paragraphs: [
        "MenuMaker AI pomaga firmom tworzyć, stylizować i publikować menu, w tym z wykorzystaniem rozpoznawania tekstu, tłumaczenia i sugestii zdjęć opartych na AI.",
      ],
    },
    {
      heading: "2. Konta",
      paragraphs: [
        "Przy rejestracji muszą Państwo podać prawdziwe dane i są odpowiedzialni za bezpieczeństwo danych swojego konta. Muszą Państwo być wystarczająco pełnoletni, aby zawrzeć wiążącą umowę w swojej jurysdykcji.",
      ],
    },
    {
      heading: "3. Dozwolone korzystanie",
      paragraphs: [
        "Nie mogą Państwo używać usługi do przesyłania lub publikowania nielegalnych, naruszających prawa lub obraźliwych treści, prób obejścia limitów żądań lub zabezpieczeń, ani do pobierania danych lub odsprzedaży usługi bez zgody.",
        "Zgłaszaj nadużycia lub naruszenia na [ABUSE_EMAIL].",
      ],
    },
    {
      heading: "4. Państwa treści",
      paragraphs: [
        "Zachowują Państwo prawa własności do treści menu, które tworzą lub przesyłają. Udzielają Państwo nam ograniczonej licencji na przechowywanie, przetwarzanie i wyświetlanie tych treści w zakresie potrzebnym do świadczenia usługi (np. do wyświetlania Państwa publicznej strony menu).",
        "Tekst i sugestie zdjęć generowane przez AI są udostępniane jako udogodnienie i mogą zawierać błędy. Są Państwo odpowiedzialni za sprawdzenie i weryfikację treści menu — w tym cen, składników i informacji o alergenach — przed publikacją.",
      ],
    },
    {
      heading: "5. Kredyty i płatności",
      paragraphs: [
        "Niektóre funkcje wymagają kredytów, które można zakupić za pośrednictwem naszego operatora płatności. Ceny mogą ulec zmianie. O ile prawo nie stanowi inaczej, zakupione kredyty nie podlegają zwrotowi.",
      ],
    },
    {
      heading: "6. Usługi zewnętrzne",
      paragraphs: [
        "Usługa opiera się na zewnętrznych dostawcach (w tym Supabase, Anthropic, Pexels, Cloudflare, Vercel i Stripe), opisanych w naszej Polityce prywatności.",
      ],
    },
    {
      heading: "7. Zakończenie",
      paragraphs: [
        "Mogą Państwo usunąć swoje konto w dowolnym momencie ze strony profilu. Możemy zawiesić lub zakończyć działanie kont naruszających niniejsze warunki lub obowiązujące prawo.",
      ],
    },
    {
      heading: "8. Ograniczenie geograficzne",
      paragraphs: [
        "Ta usługa nie jest przeznaczona ani oferowana mieszkańcom Unii Europejskiej, Wielkiej Brytanii, Europejskiego Obszaru Gospodarczego ani Szwajcarii. Rejestracja i logowanie są technicznie blokowane z tych regionów. Zobowiązują się Państwo nie podejmować prób obejścia tego ograniczenia (np. za pomocą VPN lub podania fałszywej lokalizacji), jeśli mieszkają Państwo w jednym z tych regionów.",
      ],
    },
    {
      heading: "9. Wyłączenie odpowiedzialności i ograniczenie odpowiedzialności",
      paragraphs: [
        'Usługa jest świadczona "tak jak jest", bez żadnych gwarancji. W maksymalnym zakresie dozwolonym przez prawo [JURISDICTION], [CONTROLLER_NAME] nie ponosi odpowiedzialności za szkody pośrednie, przypadkowe lub wtórne wynikające z korzystania przez Państwa z usługi.',
      ],
    },
    {
      heading: "10. Prawo właściwe",
      paragraphs: [
        "Niniejsze warunki podlegają prawu [JURISDICTION], z pominięciem norm kolizyjnych.",
      ],
    },
    {
      heading: "11. Zmiany w niniejszych warunkach",
      paragraphs: [
        "Możemy aktualizować niniejsze warunki w miarę rozwoju produktu. Dalsze korzystanie z usługi po aktualizacji oznacza akceptację zmienionych warunków.",
      ],
    },
    {
      heading: "12. Kontakt",
      paragraphs: ["Pytania dotyczące niniejszych warunków: [PRIVACY_EMAIL]."],
    },
  ],
};
