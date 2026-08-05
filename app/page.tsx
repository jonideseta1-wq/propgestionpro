export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <h1>InmoGest</h1>
      <p>
        Entrá por el subdominio de tu inmobiliaria, por ejemplo:{" "}
        <code>/delta/portal</code> o <code>/delta/admin</code> (en producción esto sería
        delta.tuplataforma.com).
      </p>
    </div>
  );
}
