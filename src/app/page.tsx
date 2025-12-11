import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminPanel from "@/components/admin/AdminPanel";
import HeroBoard from "@/components/boards/HeroBoard";
import WorkflowBoard from "@/components/boards/WorkflowBoard";
import ProblemSolutionBoard from "@/components/boards/ProblemSolutionBoard";
import BenefitsBoard from "@/components/boards/BenefitsBoard";
import PricingBoard from "@/components/boards/PricingBoard";
import FAQBoard from "@/components/boards/FAQBoard";
import FinalCTABoard from "@/components/boards/FinalCTABoard";
import { getEnabledBoards } from "@/lib/boards";
import { Board } from "@/types/board";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const boards = await getEnabledBoards();

  const renderBoard = (board: Board) => {
    switch (board.type) {
      case "hero":
        return <HeroBoard key={board.id} data={board} />;
      case "workflow":
        return <WorkflowBoard key={board.id} data={board} />;
      case "problem_solution":
        return <ProblemSolutionBoard key={board.id} data={board} />;
      case "benefits":
        return <BenefitsBoard key={board.id} data={board} />;
      case "pricing":
        return <PricingBoard key={board.id} data={board} />;
      case "faq":
        return <FAQBoard key={board.id} data={board} />;
      case "final_cta":
        return <FinalCTABoard key={board.id} data={board} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <AdminPanel />
      <main className="pt-16">
        {boards.map((board) => renderBoard(board))}
      </main>
      <Footer />
    </>
  );
}
