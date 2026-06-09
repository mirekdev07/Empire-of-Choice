export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: February 2, 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Empire of Choice (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed
            to protecting your personal data. This privacy policy explains how we collect, use, and safeguard
            your information when you use our mobile game.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
          <p className="mb-4">We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Google Play Games ID:</strong> Used for authentication and to identify your account</li>
            <li><strong>Display Name:</strong> Your chosen player name shown in rankings</li>
            <li><strong>Game Progress:</strong> Your saves, achievements, buildings, and in-game statistics</li>
            <li><strong>Device Information:</strong> Basic device data for app functionality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use collected information to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide and maintain the game service</li>
            <li>Save and sync your game progress across devices</li>
            <li>Display leaderboards and rankings</li>
            <li>Calculate offline earnings when you return to the game</li>
            <li>Improve game performance and user experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
          <p className="mb-4">
            Your data is stored securely on our servers. We implement appropriate security measures
            to protect against unauthorized access, alteration, disclosure, or destruction of your
            personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Services</h2>
          <p className="mb-4">Our game uses the following third-party services:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Google Play Games Services:</strong> For authentication and sign-in</li>
            <li><strong>Google AdMob:</strong> For displaying advertisements (optional reward ads)</li>
          </ul>
          <p className="mt-4">
            These services have their own privacy policies. We encourage you to review them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">6. Children&apos;s Privacy</h2>
          <p className="mb-4">
            Our game is not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If you are a parent or guardian and believe your
            child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access your personal data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of personalized advertisements</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us at the email below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">8. Data Retention</h2>
          <p className="mb-4">
            We retain your game data as long as your account is active. If you request account
            deletion, we will remove your data within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">10. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-white">
            Email: privacy@empireofchoice.pl
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500">
          <p>Empire of Choice - Tycoon Idle Game</p>
        </div>
      </div>
    </div>
  );
}
