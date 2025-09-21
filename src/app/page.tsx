import GenerateCollage from "@/components/GenerateCollage";


export default function Home() {
  return (
    <div className="font-sans grid  items-center justify-items-center min-h-screen gap-16">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
       <GenerateCollage />
       {/* <DemoCollage /> */}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
