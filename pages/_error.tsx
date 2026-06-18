type ErrorPageProps = {
  statusCode?: number;
};

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 32 }}>
      <h1>Violet Project Portal</h1>
      <p>{statusCode ? `This page returned ${statusCode}.` : "This page could not be loaded."}</p>
    </main>
  );
}
