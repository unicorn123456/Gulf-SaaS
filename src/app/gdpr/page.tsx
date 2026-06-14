export default function GDPR() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Integritetspolicy</h1>
      <p className="text-sm text-gray-500 mb-8">Senast uppdaterad: Juni 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Personuppgiftsansvarig</h2>
          <p className="text-gray-600 leading-relaxed">VårdAI Solutions är personuppgiftsansvarig för behandlingen av dina personuppgifter. Vi behandlar personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR) och svensk dataskyddslagstiftning.</p>
          <p className="text-gray-600 leading-relaxed mt-2">Kontakt: hello@vardai.se</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Vilka uppgifter vi samlar in</h2>
          <p className="text-gray-600 leading-relaxed mb-2">Vi samlar in följande personuppgifter:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Namn och kontaktuppgifter (e-post, telefonnummer)</li>
            <li>Bokningsinformation och behandlingstyp</li>
            <li>Kommunikation via AI-receptionisten</li>
            <li>Tekniska uppgifter (IP-adress, webbläsarinformation)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Varför vi behandlar uppgifterna</h2>
          <p className="text-gray-600 leading-relaxed mb-2">Vi behandlar dina personuppgifter för att:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Hantera bokningar och skicka påminnelser</li>
            <li>Tillhandahålla AI-driven patientkommunikation</li>
            <li>Förbättra våra tjänster</li>
            <li>Uppfylla lagliga skyldigheter</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Rättslig grund</h2>
          <p className="text-gray-600 leading-relaxed">Behandlingen grundar sig på avtal (tillhandahållande av tjänsten), berättigat intresse (förbättring av tjänsten) och i vissa fall samtycke. Hälsouppgifter behandlas med stöd av uttryckligt samtycke.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Hur länge vi sparar uppgifterna</h2>
          <p className="text-gray-600 leading-relaxed">Konversationer och bokningsdata sparas i 24 månader. Kontaktuppgifter sparas så länge kontot är aktivt. Du kan begära radering när som helst.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Dina rättigheter</h2>
          <p className="text-gray-600 leading-relaxed mb-2">Enligt GDPR har du rätt att:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Få tillgång till dina personuppgifter</li>
            <li>Rätta felaktiga uppgifter</li>
            <li>Begära radering av dina uppgifter</li>
            <li>Invända mot behandling</li>
            <li>Dataportabilitet</li>
            <li>Återkalla samtycke</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-2">Kontakta oss på hello@vardai.se för att utöva dina rättigheter.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Tredjeparter</h2>
          <p className="text-gray-600 leading-relaxed mb-2">Vi delar data med följande underleverantörer:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Supabase — datalagring (EU-servrar)</li>
            <li>Groq — AI-behandling</li>
            <li>Resend — e-posttjänst</li>
            <li>46elks — SMS-tjänst (Sverige)</li>
            <li>Vercel — hosting (EU-region)</li>
            <li>Stripe — betalningar</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">Vi använder nödvändiga cookies för autentisering och sessionshantering. Vi använder inga spårningscookies eller reklamcookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Kontakt och klagomål</h2>
          <p className="text-gray-600 leading-relaxed">Vid frågor om vår databehandling, kontakta oss på hello@vardai.se. Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY) på imy.se.</p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <a href="/" className="text-sm text-blue-600 hover:underline">Tillbaka till startsidan</a>
      </div>
    </div>
  );
}