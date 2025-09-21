import GenerateCollage from "@/components/GenerateCollage";
import { FaGithub } from 'react-icons/fa';


export default function Home() {
  return (
    <div className="font-sans grid  items-center justify-items-center min-h-screen gap-16">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
       <GenerateCollage />
       {/* <DemoCollage /> */}
      </main>
      <footer className="row-start-3 flex gap-[12px] flex-wrap items-center justify-center">
        <p>Contribute on Github.</p>
        <a
          href="https://github.com/jonathannnpstl/lastfm_collage_generator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black transition-colors"
        >
          <FaGithub size={24} />
    </a>
      </footer>
    </div>
  );
}
