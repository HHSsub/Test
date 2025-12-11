"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Board } from "@/types/board";

export interface ContentChange {
  boardId: string;
  fieldPath: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
  type: 'text' | 'image' | 'video';
}

export interface BoardVisibilityChange {
  boardId: string;
  enabled: boolean;
  timestamp: number;
}

export interface BoardOrderChange {
  boardId: string;
  oldOrder: number;
  newOrder: number;
  timestamp: number;
}

interface AdminContextType {
  isAdmin: boolean;
  isAdminPanelOpen: boolean;
  isPreviewMode: boolean;
  editingField: string | null;
  contentChanges: ContentChange[];
  undoStack: ContentChange[][];
  boardVisibilityChanges: BoardVisibilityChange[];
  boardOrderChanges: BoardOrderChange[];
  showHiddenBoards: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  toggleAdminPanel: () => void;
  togglePreviewMode: () => void;
  toggleShowHiddenBoards: () => void;
  setEditingField: (fieldPath: string | null) => void;
  addContentChange: (change: Omit<ContentChange, "timestamp">) => void;
  removeContentChange: (boardId: string, fieldPath: string) => void;
  clearContentChanges: () => void;
  undoLastChange: () => void;
  getChangeCount: () => number;
  getChangesByBoard: (boardId: string) => ContentChange[];
  getChangesByType: (type: 'text' | 'image' | 'video') => ContentChange[];
  toggleBoardVisibility: (boardId: string, currentEnabled: boolean) => void;
  getBoardVisibilityChange: (boardId: string) => boolean | null;
  moveBoardUp: (boardId: string, boards: Board[]) => void;
  moveBoardDown: (boardId: string, boards: Board[]) => void;
  getBoardOrderChange: (boardId: string) => number | null;
  getEffectiveOrder: (board: Board) => number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Upnexx!!";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingField, setEditingFieldState] = useState<string | null>(null);
  const [contentChanges, setContentChanges] = useState<ContentChange[]>([]);
  const [undoStack, setUndoStack] = useState<ContentChange[][]>([]);
  const [boardVisibilityChanges, setBoardVisibilityChanges] = useState<BoardVisibilityChange[]>([]);
  const [boardOrderChanges, setBoardOrderChanges] = useState<BoardOrderChange[]>([]);
  const [showHiddenBoards, setShowHiddenBoards] = useState(false);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
    setIsPreviewMode(false);
    setEditingFieldState(null);
    setContentChanges([]);
    setUndoStack([]);
    setBoardVisibilityChanges([]);
    setBoardOrderChanges([]);
    setShowHiddenBoards(false);
  };

  const toggleAdminPanel = () => {
    setIsAdminPanelOpen((prev) => !prev);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode((prev) => !prev);
    setEditingFieldState(null); // 미리보기 모드 전환 시 편집 필드 초기화
  };

  const toggleShowHiddenBoards = () => {
    setShowHiddenBoards((prev) => !prev);
  };

  const setEditingField = (fieldPath: string | null) => {
    setEditingFieldState(fieldPath);
  };

  const addContentChange = (change: Omit<ContentChange, "timestamp">) => {
    const newChange: ContentChange = {
      ...change,
      timestamp: Date.now(),
    };

    setContentChanges((prev) => {
      // 같은 boardId + fieldPath가 있으면 교체, 없으면 추가
      const existingIndex = prev.findIndex(
        (c) => c.boardId === change.boardId && c.fieldPath === change.fieldPath
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        // Undo를 위해 이전 상태 저장
        setUndoStack((prevUndo) => [...prevUndo, prev]);
        updated[existingIndex] = newChange;
        return updated;
      }

      // Undo를 위해 이전 상태 저장
      setUndoStack((prevUndo) => [...prevUndo, prev]);
      return [...prev, newChange];
    });
  };

  const removeContentChange = (boardId: string, fieldPath: string) => {
    setContentChanges((prev) => {
      // Undo를 위해 이전 상태 저장
      setUndoStack((prevUndo) => [...prevUndo, prev]);
      return prev.filter(
        (c) => !(c.boardId === boardId && c.fieldPath === fieldPath)
      );
    });
  };

  const clearContentChanges = () => {
    if (contentChanges.length > 0) {
      setUndoStack((prev) => [...prev, contentChanges]);
    }
    setContentChanges([]);
  };

  const undoLastChange = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setContentChanges(previousState);
      setUndoStack((prev) => prev.slice(0, -1));
    }
  };

  const getChangeCount = () => {
    return contentChanges.length + boardVisibilityChanges.length + boardOrderChanges.length;
  };

  const getChangesByBoard = (boardId: string) => {
    return contentChanges.filter((c) => c.boardId === boardId);
  };

  const getChangesByType = (type: 'text' | 'image' | 'video') => {
    return contentChanges.filter((c) => c.type === type);
  };

  const toggleBoardVisibility = (boardId: string, currentEnabled: boolean) => {
    setBoardVisibilityChanges((prev) => {
      const existingIndex = prev.findIndex((c) => c.boardId === boardId);
      const newEnabled = !currentEnabled;
      const newChange: BoardVisibilityChange = {
        boardId,
        enabled: newEnabled,
        timestamp: Date.now(),
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newChange;
        return updated;
      }

      return [...prev, newChange];
    });
  };

  const getBoardVisibilityChange = (boardId: string): boolean | null => {
    const change = boardVisibilityChanges.find((c) => c.boardId === boardId);
    return change ? change.enabled : null;
  };

  const moveBoardUp = (boardId: string, boards: Board[]) => {
    // 현재 순서 기반으로 정렬된 보드 목록 (변경사항 반영)
    const sortedBoards = [...boards].sort((a, b) => {
      const aOrder = getEffectiveOrder(a);
      const bOrder = getEffectiveOrder(b);
      return aOrder - bOrder;
    });

    const currentIndex = sortedBoards.findIndex((b) => b.id === boardId);
    if (currentIndex <= 0) return; // 이미 최상단이거나 찾지 못함

    const currentBoard = sortedBoards[currentIndex];
    const previousBoard = sortedBoards[currentIndex - 1];

    // 두 보드의 order를 교환
    const currentNewOrder = getEffectiveOrder(previousBoard);
    const previousNewOrder = getEffectiveOrder(currentBoard);

    // 현재 보드 순서 변경
    setBoardOrderChanges((prev) => {
      const updated = [...prev];
      const currentChangeIndex = updated.findIndex((c) => c.boardId === boardId);
      const newChange: BoardOrderChange = {
        boardId,
        oldOrder: currentBoard.order,
        newOrder: currentNewOrder,
        timestamp: Date.now(),
      };

      if (currentChangeIndex >= 0) {
        updated[currentChangeIndex] = newChange;
      } else {
        updated.push(newChange);
      }

      // 이전 보드 순서 변경
      const prevChangeIndex = updated.findIndex((c) => c.boardId === previousBoard.id);
      const prevChange: BoardOrderChange = {
        boardId: previousBoard.id,
        oldOrder: previousBoard.order,
        newOrder: previousNewOrder,
        timestamp: Date.now(),
      };

      if (prevChangeIndex >= 0) {
        updated[prevChangeIndex] = prevChange;
      } else {
        updated.push(prevChange);
      }

      return updated;
    });
  };

  const moveBoardDown = (boardId: string, boards: Board[]) => {
    // 현재 순서 기반으로 정렬된 보드 목록 (변경사항 반영)
    const sortedBoards = [...boards].sort((a, b) => {
      const aOrder = getEffectiveOrder(a);
      const bOrder = getEffectiveOrder(b);
      return aOrder - bOrder;
    });

    const currentIndex = sortedBoards.findIndex((b) => b.id === boardId);
    if (currentIndex === -1 || currentIndex >= sortedBoards.length - 1) return; // 이미 최하단이거나 찾지 못함

    const currentBoard = sortedBoards[currentIndex];
    const nextBoard = sortedBoards[currentIndex + 1];

    // 두 보드의 order를 교환
    const currentNewOrder = getEffectiveOrder(nextBoard);
    const nextNewOrder = getEffectiveOrder(currentBoard);

    // 현재 보드 순서 변경
    setBoardOrderChanges((prev) => {
      const updated = [...prev];
      const currentChangeIndex = updated.findIndex((c) => c.boardId === boardId);
      const newChange: BoardOrderChange = {
        boardId,
        oldOrder: currentBoard.order,
        newOrder: currentNewOrder,
        timestamp: Date.now(),
      };

      if (currentChangeIndex >= 0) {
        updated[currentChangeIndex] = newChange;
      } else {
        updated.push(newChange);
      }

      // 다음 보드 순서 변경
      const nextChangeIndex = updated.findIndex((c) => c.boardId === nextBoard.id);
      const nextChange: BoardOrderChange = {
        boardId: nextBoard.id,
        oldOrder: nextBoard.order,
        newOrder: nextNewOrder,
        timestamp: Date.now(),
      };

      if (nextChangeIndex >= 0) {
        updated[nextChangeIndex] = nextChange;
      } else {
        updated.push(nextChange);
      }

      return updated;
    });
  };

  const getBoardOrderChange = (boardId: string): number | null => {
    const change = boardOrderChanges.find((c) => c.boardId === boardId);
    return change ? change.newOrder : null;
  };

  const getEffectiveOrder = (board: Board): number => {
    const change = getBoardOrderChange(board.id);
    return change !== null ? change : board.order;
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isAdminPanelOpen,
        isPreviewMode,
        editingField,
        contentChanges,
        undoStack,
        boardVisibilityChanges,
        boardOrderChanges,
        showHiddenBoards,
        login,
        logout,
        toggleAdminPanel,
        togglePreviewMode,
        toggleShowHiddenBoards,
        setEditingField,
        addContentChange,
        removeContentChange,
        clearContentChanges,
        undoLastChange,
        getChangeCount,
        getChangesByBoard,
        getChangesByType,
        toggleBoardVisibility,
        getBoardVisibilityChange,
        moveBoardUp,
        moveBoardDown,
        getBoardOrderChange,
        getEffectiveOrder,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
