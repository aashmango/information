export default function Home() {
  return (
    <main className="min-h-screen max-w-2xl mx-auto p-8 flex flex-col gap-8">
      {/* Intro Section */}
      <section className="mt-16">
        <h1 className="text-3xl font-bold mb-4">Hi, I'm [Your Name]</h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        Aashman Goghari is a designer and software developer currently working at Palantir in New York. He specializes in software for streamlining delivery, such as Palantir Apollo, and has also contributed to tools within Palantir Foundry for data integration and pipelining. Before Palantir, he worked at Formlabs, where he designed 3D-printed installations, hardware interfaces, and websites. Aashman has a background in architecture, having graduated from the Rhode Island School of Design (RISD) in 2016. He grew up in Ahmedabad and Mumbai, India.
        </p>
      </section>

      {/* Links Section */}
      <section className="mt-8">
        <ul className="space-y-3">
          <li>
            <a 
              href="https://github.com/yourusername" 
              className="text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              → GitHub
            </a>
          </li>
          <li>
            <a 
              href="https://twitter.com/yourusername" 
              className="text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              → Twitter
            </a>
          </li>
          <li>
            <a 
              href="https://linkedin.com/in/yourusername" 
              className="text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              → LinkedIn
            </a>
          </li>
          <li>
            <a 
              href="mailto:your@email.com" 
              className="text-foreground hover:underline"
            >
              → Email
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
