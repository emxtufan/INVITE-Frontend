import React, { useState, useEffect } from 'react';
import { ArrowRight, Instagram, Facebook, Linkedin, Twitter, Mail, X, Shield, FileText, Cookie, Lock } from 'lucide-react';
import NTPLogo from "ntp-logo-react";

type LegalSection =
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'gdpr'
  | 'delivery'
  | 'cancellation'
  | 'returns'
  | null;

const LEGAL_CONTENT = {
  terms: {
    title: "Termeni si Conditii",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Ultima actualizare: 20 Februarie 2024</p>
        
        <h4 className="text-white font-bold mt-4">1. Acceptarea Termenilor</h4>
        <p>Prin accesarea si utilizarea platformei Esa Planner ("Serviciul"), acceptati si sunteti de acord sa respectati acesti Termeni si Conditii. Daca nu sunteti de acord cu acesti termeni, va rugam sa nu utilizati serviciile noastre.</p>
        
        <h4 className="text-white font-bold mt-4">2. Descrierea Serviciilor</h4>
        <p>Esa Planner ofera instrumente digitale pentru planificarea si gestionarea evenimentelor (nunti, botezuri, etc.), incluzand dar fara a se limita la: crearea de invitatii digitale, gestionarea listelor de invitati (RSVP) si statistici in timp real.</p>
        
        <h4 className="text-white font-bold mt-4">3. Contul Utilizatorului</h4>
        <p>Pentru a accesa anumite functionalitati, trebuie sa va creati un cont. Sunteti responsabil pentru mentinerea confidentialitatii datelor de autentificare. Orice activitate desfasurata prin contul dvs. este responsabilitatea dvs. exclusiva.</p>
        
        <h4 className="text-white font-bold mt-4">4. Proprietate Intelectuala</h4>
        <p>Designul, logo-urile, codul sursa si continutul platformei sunt proprietatea Esa Planner si sunt protejate prin drepturi de autor. Utilizatorii pastreaza drepturile asupra continutului personal (texte, imagini) incarcat in invitatii.</p>
        
        <h4 className="text-white font-bold mt-4">5. Plati si Rambursari</h4>
        <p>Serviciile Premium sunt facturate conform tarifelor afisate. Platile sunt finale. Rambursarile se acorda doar in cazul unor erori tehnice majore imputabile platformei, care impiedica utilizarea serviciului.</p>
        
        <h4 className="text-white font-bold mt-4">6. Limitarea Raspunderii</h4>
        <p>Esa Planner nu este responsabil pentru eventualele erori de transmitere a datelor sau intreruperi temporare ale serviciului cauzate de mentenanta sau probleme tehnice externe.</p>
      </div>
    )
  },
  privacy: {
    title: "Politica de Confidentialitate",
    icon: Lock,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>La Esa Planner, ne luam in serios responsabilitatea de a proteja datele dvs. personale.</p>
        
        <h4 className="text-white font-bold mt-4">1. Ce date colectam?</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Informatii de identificare: Nume, Prenume, Adresa de Email.</li>
          <li>Detalii eveniment: Data, Locatia, Numele mirilor/organizatorilor.</li>
          <li>Informatii despre invitati: Numele invitatilor si statusul confirmarilor (introduse de dvs.).</li>
          <li>Date tehnice: Adresa IP, tipul de browser (pentru securitate si analiza).</li>
        </ul>

        <h4 className="text-white font-bold mt-4">2. Cum folosim datele?</h4>
        <p>Datele sunt utilizate strict pentru:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Furnizarea si personalizarea invitatiilor digitale.</li>
          <li>Procesarea platilor si emiterea facturilor.</li>
          <li>Comunicari legate de functionalitatea contului (resetare parola, notificari RSVP).</li>
        </ul>

        <h4 className="text-white font-bold mt-4">3. Partajarea Datelor</h4>
        <p>Nu vindem datele dvs. personale catre terti. Partajam date doar cu procesatorii nostri de plati (Stripe/Netopia) si furnizorii de infrastructura (AWS/Vercel), strict pentru functionarea serviciului.</p>

        <h4 className="text-white font-bold mt-4">4. Securitatea Datelor</h4>
        <p>Utilizam criptare SSL/TLS pentru toate transmisiile de date si stocam parolele sub forma de hash securizat.</p>
      </div>
    )
  },
  cookies: {
    title: "Politica Cookie",
    icon: Cookie,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Site-ul ESA utilizeaza cookie-uri pentru a va oferi o experienta de navigare optima.</p>

        <h4 className="text-white font-bold mt-4">1. Ce sunt cookie-urile?</h4>
        <p>Un cookie este un fisier text de mici dimensiuni salvat pe dispozitivul dvs. atunci cand vizitati un site web. Acesta permite site-ului sa tina minte actiunile si preferintele dvs. pentru o perioada de timp.</p>

        <h4 className="text-white font-bold mt-4">2. Tipuri de cookie-uri folosite</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="text-white font-bold">Esentiale:</span> Necesare pentru functionarea site-ului (autentificare, mentinerea sesiunii). Nu pot fi dezactivate.</li>
          <li><span className="text-white font-bold">De Performanta:</span> Ne ajuta sa intelegem cum interactioneaza utilizatorii cu site-ul (Google Analytics). Datele sunt anonimizate.</li>
          <li><span className="text-white font-bold">Functionale:</span> Memoreaza preferintele dvs. (ex: limba, tema selectata).</li>
        </ul>

        <h4 className="text-white font-bold mt-4">3. Gestionarea Cookie-urilor</h4>
        <p>Puteti controla si/sau sterge cookie-urile dupa cum doriti direct din setarile browserului dvs. Retineti ca dezactivarea cookie-urilor esentiale poate afecta functionarea corecta a platformei.</p>
      </div>
    )
  },
  gdpr: {
    title: "GDPR - Protectia Datelor",
    icon: Shield,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>In conformitate cu Regulamentul General privind Protectia Datelor (UE) 2016/679 ("GDPR"), aveti urmatoarele drepturi in calitate de utilizator:</p>

        <h4 className="text-white font-bold mt-4">1. Dreptul de Acces</h4>
        <p>Aveti dreptul de a solicita o copie a datelor personale pe care le detinem despre dvs.</p>

        <h4 className="text-white font-bold mt-4">2. Dreptul la Rectificare</h4>
        <p>Aveti dreptul de a corecta datele inexacte sau incomplete direct din contul dvs. sau contactandu-ne.</p>

        <h4 className="text-white font-bold mt-4">3. Dreptul la Stergere ("Dreptul de a fi uitat")</h4>
        <p>Puteti solicita stergerea contului si a tuturor datelor asociate. Vom procesa cererea in termen de 30 de zile, cu exceptia datelor pe care suntem obligati legal sa le pastram (ex: facturi).</p>

        <h4 className="text-white font-bold mt-4">4. Dreptul la Portabilitate</h4>
        <p>Aveti dreptul de a primi datele dvs. intr-un format structurat, utilizat in mod curent.</p>

        <h4 className="text-white font-bold mt-4">Contact DPO</h4>
        <p>Pentru orice solicitare legata de prelucrarea datelor cu caracter personal, va rugam sa contactati Responsabilul cu Protectia Datelor la:</p>
        <p className="text-white font-mono bg-white/10 p-2 rounded inline-block mt-2">emitufan30@gmail.com</p>
      </div>
    )
  },
  delivery: {
    title: "Politica de Livrare Comanda",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Serviciile Event Smart Assistant sunt servicii digitale livrate online.</p>
        <h4 className="text-white font-bold mt-4">1. Modalitate de livrare</h4>
        <p>
          Dupa confirmarea platii, activarea planului (Basic/Pro) se face automat in contul utilizatorului.
          Nu se livreaza produse fizice.
        </p>
        <h4 className="text-white font-bold mt-4">2. Timp de livrare</h4>
        <p>
          In mod normal, accesul este acordat instant sau in cateva minute de la confirmarea tranzactiei.
          In situatii exceptionale poate exista o intarziere tehnica.
        </p>
        <h4 className="text-white font-bold mt-4">3. Documente fiscale</h4>
        <p>Factura fiscala este transmisa electronic pe emailul asociat comenzii.</p>
      </div>
    )
  },
  cancellation: {
    title: "Politica de Anulare Comanda",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Comenzile pentru servicii digitale pot fi anulate doar inainte de confirmarea platii.</p>
        <h4 className="text-white font-bold mt-4">1. Inainte de plata</h4>
        <p>Daca plata nu a fost finalizata, comanda poate fi anulata fara costuri.</p>
        <h4 className="text-white font-bold mt-4">2. Dupa plata</h4>
        <p>
          Dupa activarea serviciului digital in cont, anularea se analizeaza individual in functie de stadiul
          executarii serviciului si de legislatia aplicabila.
        </p>
        <h4 className="text-white font-bold mt-4">3. Contact anulare</h4>
        <p>Pentru solicitari, ne poti contacta la: <span className="text-white">emitufan30@gmail.com</span></p>
      </div>
    )
  },
  returns: {
    title: "Politica de Returnare / Rambursare",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Platforma furnizeaza continut si functionalitati digitale, nu produse fizice.</p>
        <h4 className="text-white font-bold mt-4">1. Drept de retragere</h4>
        <p>
          Pentru serviciile digitale prestate imediat dupa plata, dreptul de retragere poate fi limitat
          conform legislatiei aplicabile.
        </p>
        <h4 className="text-white font-bold mt-4">2. Rambursare</h4>
        <p>
          Cererile de rambursare sunt evaluate punctual, in special in cazuri de eroare tehnica majora
          care impiedica folosirea serviciului.
        </p>
        <h4 className="text-white font-bold mt-4">3. Cum trimiti solicitarea</h4>
        <p>
          Trimite cererea la <span className="text-white">emitufan30@gmail.com</span>, incluzand emailul contului,
          ID-ul tranzactiei si descrierea problemei.
        </p>
      </div>
    )
  }
};

export default function Footer() {
  const [activeModal, setActiveModal] = useState<LegalSection>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [activeModal]);

  return (
    <>
      <footer className="relative bg-[#050505] pt-24 pb-12 overflow-hidden border-t border-white/5">

        {/* Big Background Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none translate-y-[20%]">
          <h1 className="text-[18vw] font-black text-white/[0.03] whitespace-nowrap leading-none tracking-tighter">
            Esa Planner
          </h1>
        </div>

        <div className="wp-container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">

            {/* Column 1: Brand & Contact */}
            <div className="md:col-span-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-6">
                  <span className="font-bold text-white text-xl tracking-tight">Event Smart Assistant</span>
              </div>
              <p className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">
                Platforma completa pentru nunta ta. <br/>
                AI agents for modern event workflows.
              </p>

              <div className="mb-6 w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-gray-300 space-y-1">
                <p className="font-semibold text-white">ELEXA SOCIETY SRL</p>
                <p>CUI: 52745149</p>
                <p>Nr. Reg. Com.: J2025080665008</p>
                <p>
                  Telefon: <a href="tel:+40755938367" className="text-white hover:underline">0755 938 367</a>
                </p>
                {/* <p>
                  E-mail: <a href="mailto:emitufan30@gmail.com" className="text-white hover:underline">emitufan30@gmail.com</a>
                </p> */}
              </div>

              <div className="flex flex-col gap-4">
                  <a href="/contact" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#18181b] border border-white/10 hover:bg-white hover:text-black hover:border-white text-white text-sm font-bold transition-all duration-300 group w-fit">
                    Contacteaza-ne <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform"/>
                  </a>

                  <a href="mailto:emitufan30@gmail.com" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors pl-1">
                    emitufan30@gmail.com<ArrowRight size={12} />
                  </a>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="md:col-span-3 md:col-start-6">
              <h4 className="text-white font-bold text-sm mb-6">Platforma</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li><a href="#features" className="hover:text-white transition-colors">Functionalitati</a></li>
                  <li><a href="#design" className="hover:text-white transition-colors">Design</a></li>
                  <li><a href="#process" className="hover:text-white transition-colors">Cum functioneaza</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Preturi</a></li>
                  <li><a href="#testimonials" className="hover:text-white transition-colors">Testimoniale</a></li>
              </ul>
            </div>

            {/* Column 3: Legal/Pages (Now Interactive) */}
            <div className="md:col-span-2">
              <h4 className="text-white font-bold text-sm mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li>
                    <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors text-left">Termeni & Conditii</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors text-left">Politica Confidentialitate</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('cookies')} className="hover:text-white transition-colors text-left">Politica Cookie</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('gdpr')} className="hover:text-white transition-colors text-left">GDPR</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('delivery')} className="hover:text-white transition-colors text-left">Politica Livrare</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('cancellation')} className="hover:text-white transition-colors text-left">Anulare Comanda</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('returns')} className="hover:text-white transition-colors text-left">Returnare / Rambursare</button>
                  </li>
              </ul>
            </div>

            {/* Column 4: Socials */}
            <div className="md:col-span-2">
              <h4 className="text-white font-bold text-sm mb-6">Social Media</h4>
              <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
                      <Instagram size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
                      <Facebook size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
                      <Twitter size={18} />
                  </a>
              </div>
            </div>
            

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center text-xs text-gray-500 font-mono tracking-wide">
              <div className="flex flex-col items-center lg:items-start gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <img
                    src="https://github.com/shadcn.png"
                    className="w-4 h-4 rounded-full grayscale opacity-50"
                    alt="ESA Team"
                  />
                  <span className="opacity-80">Created by ESA TEAM</span>
                </div>
                {/* <span className="text-[11px] text-gray-600">
                  (c) {new Date().getFullYear()} Event Smart Assistant. Toate drepturile rezervate.
                </span> */}
              </div>
              <div className="flex justify-center">
                <div className="px-1 py-2 rounded-xl bg-white/5 border border-white/10">
                  <NTPLogo color="#FFFFFF" version="orizontal" secret="163127" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2">
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex"
                  style={{ margin: 0, lineHeight: 1, padding: 0, textDecoration: "none" }}
                >
                  <img
                    src="https://etamade-com.github.io/anpc-sal-sol-logo/anpc-sal.svg"
                    alt="Solutionarea Alternativa a Litigiilor"
                    className="inline-block border-0 w-[150px] sm:w-[180px]"
                  />
                </a>
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex"
                  style={{ margin: 0, lineHeight: 1, padding: 0, textDecoration: "none" }}
                >
                  <img
                    src="https://etamade-com.github.io/anpc-sal-sol-logo/anpc-sol.svg"
                    alt="Solutionarea Online a Litigiilor"
                    className="inline-block border-0 w-[150px] sm:w-[180px]"
                  />
                </a>
              </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#111113] rounded-t-2xl z-10">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                    {LEGAL_CONTENT[activeModal].icon && React.createElement(LEGAL_CONTENT[activeModal].icon, { size: 20 })}
                 </div>
                 <h2 className="text-xl md:text-2xl font-bold text-white">
                   {LEGAL_CONTENT[activeModal].title}
                 </h2>
               </div>
               <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               {LEGAL_CONTENT[activeModal].content}
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-white/10 bg-[#0e0e10] rounded-b-2xl flex justify-end">
               <button 
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-200 transition-colors"
               >
                 Am inteles
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

