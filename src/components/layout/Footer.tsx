export function Footer() {
  return (
    <footer className="mt-auto border-t border-game-border py-6 text-center text-sm text-game-muted">
      <p>
        © {new Date().getFullYear()} Celebrity Quiz — Testez vos connaissances
      </p>
      <p className="mt-1 text-xs">
        Les photos sont des placeholders — remplacez-les par les vraies images dans{' '}
        <code className="text-game-accent">/src/data/celebrities/</code>
      </p>
    </footer>
  )
}
