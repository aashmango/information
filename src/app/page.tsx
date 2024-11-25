export default function Home() {
  return (
    <main className="min-h-screen max-w-2xl mx-auto p-8 flex flex-col gap-8">
      {/* Intro Section */}
      <section className="mt-16">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Site is under construction. 
        </p>
      </section>

      {/* Links Section */}
      <section className="mt-8">
        <ul className="space-y-3">
          <li>
            <a 
              href="https://linkedin.com/in/aashmangoghari" 
              className="text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
            LinkedIn
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
