import Header from "./Components/header";
import Content from "./Components/Content" // Adjust the import path as nee
export default function Home() {
  return (
    <div className="bg-[#F9F7F7] min-h-screen">
      <Header />
      <Content/>
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-[#112D4E] text-3xl font-bold">IPD Title</h1>
        {/* Your other content goes here */}
      </main>
    </div>
  );
}
