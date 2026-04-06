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
    title: "Termeni și Condiții",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Ultima actualizare: 20 Februarie 2024</p>
        
        <h4 className="text-white font-bold mt-4">1. Acceptarea Termenilor</h4>
        <p>Prin accesarea și utilizarea platformei Esa Planner ("Serviciul"), acceptați și sunteți de acord să respectați acești Termeni și Condiții. Dacă nu sunteți de acord cu acești termeni, vă rugăm să nu utilizați serviciile noastre.</p>
        
        <h4 className="text-white font-bold mt-4">2. Descrierea Serviciilor</h4>
        <p>Esa Planner oferă instrumente digitale pentru planificarea și gestionarea evenimentelor (nunți, botezuri, etc.), incluzând dar fără a se limita la: crearea de invitații digitale, gestionarea listelor de invitați (RSVP) și statistici în timp real.</p>
        
        <h4 className="text-white font-bold mt-4">3. Contul Utilizatorului</h4>
        <p>Pentru a accesa anumite funcționalități, trebuie să vă creați un cont. Sunteți responsabil pentru menținerea confidențialității datelor de autentificare. Orice activitate desfășurată prin contul dvs. este responsabilitatea dvs. exclusivă.</p>
        
        <h4 className="text-white font-bold mt-4">4. Proprietate Intelectuală</h4>
        <p>Designul, logo-urile, codul sursă și conținutul platformei sunt proprietatea Esa Planner și sunt protejate prin drepturi de autor. Utilizatorii păstrează drepturile asupra conținutului personal (texte, imagini) încărcat în invitații.</p>
        
        <h4 className="text-white font-bold mt-4">5. Plăți și Rambursări</h4>
        <p>Serviciile Premium sunt facturate conform tarifelor afișate. Plățile sunt finale. Rambursările se acordă doar în cazul unor erori tehnice majore imputabile platformei, care împiedică utilizarea serviciului.</p>
        
        <h4 className="text-white font-bold mt-4">6. Limitarea Răspunderii</h4>
        <p>Esa Planner nu este responsabil pentru eventualele erori de transmitere a datelor sau întreruperi temporare ale serviciului cauzate de mentenanță sau probleme tehnice externe.</p>
      </div>
    )
  },
  privacy: {
    title: "Politică de Confidențialitate",
    icon: Lock,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>La Esa Planner, ne luăm în serios responsabilitatea de a proteja datele dvs. personale.</p>
        
        <h4 className="text-white font-bold mt-4">1. Ce date colectăm?</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Informații de identificare: Nume, Prenume, Adresa de Email.</li>
          <li>Detalii eveniment: Data, Locația, Numele mirilor/organizatorilor.</li>
          <li>Informații despre invitați: Numele invitaților și statusul confirmărilor (introduse de dvs.).</li>
          <li>Date tehnice: Adresa IP, tipul de browser (pentru securitate și analiză).</li>
        </ul>

        <h4 className="text-white font-bold mt-4">2. Cum folosim datele?</h4>
        <p>Datele sunt utilizate strict pentru:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Furnizarea și personalizarea invitațiilor digitale.</li>
          <li>Procesarea plăților și emiterea facturilor.</li>
          <li>Comunicări legate de funcționalitatea contului (resetare parolă, notificări RSVP).</li>
        </ul>

        <h4 className="text-white font-bold mt-4">3. Partajarea Datelor</h4>
        <p>Nu vindem datele dvs. personale către terți. Partajăm date doar cu procesatorii noștri de plăți (Stripe/Netopia) și furnizorii de infrastructură (AWS/Vercel), strict pentru funcționarea serviciului.</p>

        <h4 className="text-white font-bold mt-4">4. Securitatea Datelor</h4>
        <p>Utilizăm criptare SSL/TLS pentru toate transmisiile de date și stocăm parolele sub formă de hash securizat.</p>
      </div>
    )
  },
  cookies: {
    title: "Politică Cookie",
    icon: Cookie,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Site-ul ESA utilizează cookie-uri pentru a vă oferi o experiență de navigare optimă.</p>

        <h4 className="text-white font-bold mt-4">1. Ce sunt cookie-urile?</h4>
        <p>Un cookie este un fișier text de mici dimensiuni salvat pe dispozitivul dvs. atunci când vizitați un site web. Acesta permite site-ului să țină minte acțiunile și preferințele dvs. pentru o perioadă de timp.</p>

        <h4 className="text-white font-bold mt-4">2. Tipuri de cookie-uri folosite</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="text-white font-bold">Esențiale:</span> Necesare pentru funcționarea site-ului (autentificare, menținerea sesiunii). Nu pot fi dezactivate.</li>
          <li><span className="text-white font-bold">De Performanță:</span> Ne ajută să înțelegem cum interacționează utilizatorii cu site-ul (Google Analytics). Datele sunt anonimizate.</li>
          <li><span className="text-white font-bold">Funcționale:</span> Memorează preferințele dvs. (ex: limba, tema selectată).</li>
        </ul>

        <h4 className="text-white font-bold mt-4">3. Gestionarea Cookie-urilor</h4>
        <p>Puteți controla și/sau șterge cookie-urile după cum doriți direct din setările browserului dvs. Rețineți că dezactivarea cookie-urilor esențiale poate afecta funcționarea corectă a platformei.</p>
      </div>
    )
  },
  gdpr: {
    title: "GDPR - Protecția Datelor",
    icon: Shield,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>În conformitate cu Regulamentul General privind Protecția Datelor (UE) 2016/679 ("GDPR"), aveți următoarele drepturi în calitate de utilizator:</p>

        <h4 className="text-white font-bold mt-4">1. Dreptul de Acces</h4>
        <p>Aveți dreptul de a solicita o copie a datelor personale pe care le deținem despre dvs.</p>

        <h4 className="text-white font-bold mt-4">2. Dreptul la Rectificare</h4>
        <p>Aveți dreptul de a corecta datele inexacte sau incomplete direct din contul dvs. sau contactându-ne.</p>

        <h4 className="text-white font-bold mt-4">3. Dreptul la Ștergere ("Dreptul de a fi uitat")</h4>
        <p>Puteți solicita ștergerea contului și a tuturor datelor asociate. Vom procesa cererea în termen de 30 de zile, cu excepția datelor pe care suntem obligați legal să le păstrăm (ex: facturi).</p>

        <h4 className="text-white font-bold mt-4">4. Dreptul la Portabilitate</h4>
        <p>Aveți dreptul de a primi datele dvs. într-un format structurat, utilizat în mod curent.</p>

        <h4 className="text-white font-bold mt-4">Contact DPO</h4>
        <p>Pentru orice solicitare legată de prelucrarea datelor cu caracter personal, vă rugăm să contactați Responsabilul cu Protecția Datelor la:</p>
        <p className="text-white font-mono bg-white/10 p-2 rounded inline-block mt-2">emitufan30@gmail.com</p>
      </div>
    )
  },
  delivery: {
    title: "Politică de Livrare Comandă",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Serviciile Event Smart Assistant sunt servicii digitale livrate online.</p>
        <h4 className="text-white font-bold mt-4">1. Modalitate de livrare</h4>
        <p>
          După confirmarea plății, activarea planului (Basic/Pro) se face automat în contul utilizatorului.
          Nu se livrează produse fizice.
        </p>
        <h4 className="text-white font-bold mt-4">2. Timp de livrare</h4>
        <p>
          În mod normal, accesul este acordat instant sau în câteva minute de la confirmarea tranzacției.
          În situații excepționale poate exista o întârziere tehnică.
        </p>
        <h4 className="text-white font-bold mt-4">3. Documente fiscale</h4>
        <p>Factura fiscală este transmisă electronic pe emailul asociat comenzii.</p>
      </div>
    )
  },
  cancellation: {
    title: "Politică de Anulare Comandă",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Comenzile pentru servicii digitale pot fi anulate doar înainte de confirmarea plății.</p>
        <h4 className="text-white font-bold mt-4">1. Înainte de plată</h4>
        <p>Dacă plata nu a fost finalizată, comanda poate fi anulată fără costuri.</p>
        <h4 className="text-white font-bold mt-4">2. După plată</h4>
        <p>
          După activarea serviciului digital în cont, anularea se analizează individual în funcție de stadiul
          executării serviciului și de legislația aplicabilă.
        </p>
        <h4 className="text-white font-bold mt-4">3. Contact anulare</h4>
        <p>Pentru solicitări, ne poți contacta la: <span className="text-white">emitufan30@gmail.com</span></p>
      </div>
    )
  },
  returns: {
    title: "Politică de Returnare / Rambursare",
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
        <p>Platforma furnizează conținut și funcționalități digitale, nu produse fizice.</p>
        <h4 className="text-white font-bold mt-4">1. Drept de retragere</h4>
        <p>
          Pentru serviciile digitale prestate imediat după plată, dreptul de retragere poate fi limitat
          conform legislației aplicabile.
        </p>
        <h4 className="text-white font-bold mt-4">2. Rambursare</h4>
        <p>
          Cererile de rambursare sunt evaluate punctual, în special în cazuri de eroare tehnică majoră
          care împiedică folosirea serviciului.
        </p>
        <h4 className="text-white font-bold mt-4">3. Cum trimiți solicitarea</h4>
        <p>
          Trimite cererea la <span className="text-white">emitufan30@gmail.com</span>, incluzând emailul contului,
          ID-ul tranzacției și descrierea problemei.
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
                Platforma completă pentru nunta ta. <br/>
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
                    Contactează-ne <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform"/>
                  </a>

                  <a href="mailto:emitufan30@gmail.com" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors pl-1">
                    emitufan30@gmail.com<ArrowRight size={12} />
                  </a>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="md:col-span-3 md:col-start-6">
              <h4 className="text-white font-bold text-sm mb-6">Platformă</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li><a href="#features" className="hover:text-white transition-colors">Funcționalități</a></li>
                  <li><a href="#design" className="hover:text-white transition-colors">Design</a></li>
                  <li><a href="#process" className="hover:text-white transition-colors">Cum funcționează</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Prețuri</a></li>
                  <li><a href="#testimonials" className="hover:text-white transition-colors">Testimoniale</a></li>
              </ul>
            </div>

            {/* Column 3: Legal/Pages (Now Interactive) */}
            <div className="md:col-span-2">
              <h4 className="text-white font-bold text-sm mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li>
                    <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors text-left">Termeni & Condiții</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors text-left">Politică Confidențialitate</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('cookies')} className="hover:text-white transition-colors text-left">Politică Cookie</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('gdpr')} className="hover:text-white transition-colors text-left">GDPR</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('delivery')} className="hover:text-white transition-colors text-left">Politică Livrare</button>
                  </li>
                  <li>
                    <button onClick={() => setActiveModal('cancellation')} className="hover:text-white transition-colors text-left">Anulare Comandă</button>
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
                 Am înțeles
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

