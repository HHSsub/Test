import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ContentChange {
  boardId: string;
  fieldPath: string;
  newValue: string;
  type: 'text' | 'image' | 'video';
}

interface BoardVisibilityChange {
  boardId: string;
  enabled: boolean;
}

interface BoardOrderChange {
  boardId: string;
  newOrder: number;
}

interface SaveRequest {
  contentChanges: ContentChange[];
  boardVisibilityChanges: BoardVisibilityChange[];
  boardOrderChanges: BoardOrderChange[];
}

interface Board {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  content: any;
}

// Helper function to set nested property by path
function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // Handle array indices
    if (key.includes('[')) {
      const arrayKey = key.substring(0, key.indexOf('['));
      const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
      
      if (!current[arrayKey]) {
        current[arrayKey] = [];
      }
      
      if (!current[arrayKey][index]) {
        current[arrayKey][index] = {};
      }
      
      current = current[arrayKey][index];
    } else {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
  }
  
  const lastKey = keys[keys.length - 1];
  
  // Handle array indices in last key
  if (lastKey.includes('[')) {
    const arrayKey = lastKey.substring(0, lastKey.indexOf('['));
    const index = parseInt(lastKey.substring(lastKey.indexOf('[') + 1, lastKey.indexOf(']')));
    
    if (!current[arrayKey]) {
      current[arrayKey] = [];
    }
    
    current[arrayKey][index] = value;
  } else {
    current[lastKey] = value;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SaveRequest = await request.json();
    const { contentChanges, boardVisibilityChanges, boardOrderChanges } = body;

    // Fetch all boards from Supabase
    const { data: boards, error: fetchError } = await supabase
      .from('boards')
      .select('*');
    
    if (fetchError) {
      throw new Error(`Supabase fetch error: ${fetchError.message}`);
    }

    if (!boards) {
      throw new Error('No boards found');
    }

    // Track boards to update
    const boardsToUpdate: Map<string, Board> = new Map();

    // Apply content changes
    for (const change of contentChanges) {
      const board = boards.find(b => b.id === change.boardId);
      if (board) {
        // Make a copy if not already in update map
        if (!boardsToUpdate.has(board.id)) {
          boardsToUpdate.set(board.id, { ...board, content: { ...board.content } });
        }
        const boardToUpdate = boardsToUpdate.get(board.id)!;
        const pathWithoutContent = change.fieldPath.startsWith('content.') 
          ? change.fieldPath.substring(8) // "content." 제거
          : change.fieldPath;
        setNestedProperty(boardToUpdate.content, pathWithoutContent, change.newValue);
      }
    }

    // Apply visibility changes
    for (const change of boardVisibilityChanges) {
      const board = boards.find(b => b.id === change.boardId);
      if (board) {
        if (!boardsToUpdate.has(board.id)) {
          boardsToUpdate.set(board.id, { ...board });
        }
        const boardToUpdate = boardsToUpdate.get(board.id)!;
        boardToUpdate.enabled = change.enabled;
      }
    }

    // Apply order changes
    for (const change of boardOrderChanges) {
      const board = boards.find(b => b.id === change.boardId);
      if (board) {
        if (!boardsToUpdate.has(board.id)) {
          boardsToUpdate.set(board.id, { ...board });
        }
        const boardToUpdate = boardsToUpdate.get(board.id)!;
        boardToUpdate.order = change.newOrder;
      }
    }

    // Prepare upsert data
    const upsertData = Array.from(boardsToUpdate.values()).map(board => ({
      id: board.id,
      type: board.type,
      enabled: board.enabled,
      order: board.order,
      content: board.content,
      updated_at: new Date().toISOString()
    }));

    // Upsert to Supabase
    const { error: upsertError } = await supabase
      .from('boards')
      .upsert(upsertData);

    if (upsertError) {
      throw new Error(`Supabase upsert error: ${upsertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '변경사항이 성공적으로 저장되었습니다.',
      stats: {
        contentChanges: contentChanges.length,
        boardVisibilityChanges: boardVisibilityChanges.length,
        boardOrderChanges: boardOrderChanges.length,
        totalChanges: contentChanges.length + boardVisibilityChanges.length + boardOrderChanges.length,
      }
    });
  } catch (error) {
    console.error('Save API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '저장 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
