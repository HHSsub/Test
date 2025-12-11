import { BoardsData } from "@/types/board";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase에서 boards 가져오기
export async function getBoards(): Promise<BoardsData> {
  try {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return { boards: [] };
    }

    return { boards: data || [] };
  } catch (error) {
    console.error('Failed to load boards from Supabase:', error);
    return { boards: [] };
  }
}

export async function getBoardById(id: string) {
  const { boards } = await getBoards();
  return boards.find((board) => board.id === id);
}

export async function getEnabledBoards() {
  const { boards } = await getBoards();
  return boards
    .filter((board) => board.enabled)
    .sort((a, b) => a.order - b.order);
}
