
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-4 px-6 bg-card border-t border-border text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        © {currentYear} GenCraft. AI Project & Code Generator.
      </div>
    </footer>
  );
}
