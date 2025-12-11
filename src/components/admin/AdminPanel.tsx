"use client";

import { useState, useEffect } from "react";
import { useAdmin, ContentChange, BoardVisibilityChange } from "@/contexts/AdminContext";
import { Board } from "@/types/board";

type FilterType = 'all' | 'text' | 'image' | 'video';
type TabType = 'changes' | 'boards';

export default function AdminPanel() {
  const { 
    isAdmin, 
    isAdminPanelOpen, 
    toggleAdminPanel, 
    contentChanges,
    boardVisibilityChanges,
    boardOrderChanges,
    clearContentChanges, 
    getChangeCount,
    undoLastChange,
    undoStack,
    removeContentChange,
    getChangesByBoard,
    getChangesByType,
    showHiddenBoards,
    toggleShowHiddenBoards,
    toggleBoardVisibility,
    getBoardVisibilityChange,
    moveBoardUp,
    moveBoardDown,
    getBoardOrderChange,
    getEffectiveOrder,
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState<TabType>('changes');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [groupByBoard, setGroupByBoard] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

  // Load boards data
  useEffect(() => {
    if (activeTab === 'boards' && boards.length === 0) {
      setLoadingBoards(true);
      fetch('/api/boards')
        .then(res => res.json())
        .then(data => {
          setBoards(data.boards || []);
          setLoadingBoards(false);
        })
        .catch(error => {
          console.error('Failed to load boards:', error);
          setLoadingBoards(false);
        });
    }
  }, [activeTab, boards.length]);

  if (!isAdmin || !isAdminPanelOpen) return null;

  const handleSave = async () => {
    const totalChanges = getChangeCount();
    
    if (totalChanges === 0) {
      alert('저장할 변경사항이 없습니다.');
      return;
    }

    const confirmSave = window.confirm(
      `${totalChanges}개의 변경사항을 저장하시겠습니까?\n\n` +
      `- 콘텐츠 변경: ${contentChanges.length}개\n` +
      `- 보드 가시성 변경: ${boardVisibilityChanges.length}개\n` +
      `- 보드 순서 변경: ${boardOrderChanges.length}개`
    );

    if (!confirmSave) return;

    try {
      // Show loading state
      const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement;
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = '💾 저장 중...';
      }

      // Call save API
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentChanges,
          boardVisibilityChanges,
          boardOrderChanges,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ ${result.message}\n\n` +
          `저장된 변경사항:\n` +
          `- 콘텐츠: ${result.stats.contentChanges}개\n` +
          `- 가시성: ${result.stats.boardVisibilityChanges}개\n` +
          `- 순서: ${result.stats.boardOrderChanges}개\n` +
          `- 총: ${result.stats.totalChanges}개\n\n` +
          `페이지를 새로고침합니다.`
        );
        
        // Clear changes and reload
        clearContentChanges();
        window.location.reload();
      } else {
        throw new Error(result.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(
        `❌ 저장 중 오류가 발생했습니다.\n\n` +
        `${error instanceof Error ? error.message : '알 수 없는 오류'}\n\n` +
        `다시 시도해주세요.`
      );
      
      // Reset button state
      const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement;
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = `💾 변경사항 저장 (${totalChanges})`;
      }
    }
  };

  const handleCancel = () => {
    const totalChanges = getChangeCount();
    if (totalChanges > 0) {
      const confirm = window.confirm(`${totalChanges}개의 변경사항을 취소하시겠습니까?`);
      if (confirm) {
        window.location.reload();
      }
    }
  };

  const handleUndo = () => {
    undoLastChange();
  };

  const handleRemoveChange = (boardId: string, fieldPath: string) => {
    if (window.confirm('이 변경사항을 제거하시겠습니까?')) {
      removeContentChange(boardId, fieldPath);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // 필터링된 변경사항
  const filteredChanges = filterType === 'all' 
    ? contentChanges 
    : getChangesByType(filterType as 'text' | 'image' | 'video');

  // 보드별 그룹화
  const groupedChanges: Record<string, ContentChange[]> = {};
  if (groupByBoard) {
    filteredChanges.forEach(change => {
      if (!groupedChanges[change.boardId]) {
        groupedChanges[change.boardId] = [];
      }
      groupedChanges[change.boardId].push(change);
    });
  }

  // 보드 타입 한글 변환
  const getBoardTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      hero: '히어로',
      workflow: '워크플로우',
      problem_solution: '문제/솔루션',
      benefits: '혜택',
      pricing: '가격',
      faq: 'FAQ',
      final_cta: '최종 CTA',
      footer: '푸터',
    };
    return typeMap[type] || type;
  };

  // 보드 가시성 결정 (변경사항 우선)
  const getBoardEnabled = (board: Board): boolean => {
    const change = getBoardVisibilityChange(board.id);
    return change !== null ? change : board.enabled;
  };

  // 필터링된 보드 목록 (순서 정렬 포함)
  const filteredBoards = (showHiddenBoards 
    ? boards 
    : boards.filter(board => getBoardEnabled(board))
  ).sort((a, b) => getEffectiveOrder(a) - getEffectiveOrder(b));

  const renderChange = (change: ContentChange, index: number) => (
    <div key={index} className="bg-brand-black/50 rounded-lg p-3 sm:p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
              change.type === 'text' ? 'bg-blue-500/20 text-blue-400' :
              change.type === 'image' ? 'bg-purple-500/20 text-purple-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {change.type === 'text' ? '📝 텍스트' : change.type === 'image' ? '🖼️ 이미지' : '🎬 영상'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(change.timestamp)}
            </span>
          </div>
          
          {!groupByBoard && (
            <p className="text-xs text-gray-400 mb-2">
              {change.boardId} → {change.fieldPath}
            </p>
          )}
          
          {change.type === 'text' ? (
            <div className="space-y-1">
              <div className="text-xs">
                <span className="text-red-400">이전:</span>
                <p className="text-gray-500 line-through truncate">
                  {change.oldValue.substring(0, 50)}
                  {change.oldValue.length > 50 && "..."}
                </p>
              </div>
              <div className="text-xs">
                <span className="text-green-400">변경:</span>
                <p className="text-white break-words">
                  {change.newValue.substring(0, 50)}
                  {change.newValue.length > 50 && "..."}
                </p>
              </div>
            </div>
          ) : change.type === 'image' ? (
            <div className="flex gap-2 mt-2">
              {change.oldValue && (
                <div className="flex-1">
                  <p className="text-xs text-red-400 mb-1">이전</p>
                  <img 
                    src={change.oldValue} 
                    alt="Old" 
                    className="w-full h-16 object-cover rounded border border-red-500/30"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-green-400 mb-1">새로운</p>
                <img 
                  src={change.newValue} 
                  alt="New" 
                  className="w-full h-16 object-cover rounded border border-green-500/30"
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-2 mt-2">
              {change.oldValue && (
                <div className="flex-1">
                  <p className="text-xs text-red-400 mb-1">이전</p>
                  <video 
                    src={change.oldValue}
                    className="w-full h-16 object-cover rounded border border-red-500/30"
                    muted
                  >
                    <source src={change.oldValue} type="video/mp4" />
                  </video>
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-green-400 mb-1">새로운</p>
                <video 
                  src={change.newValue}
                  className="w-full h-16 object-cover rounded border border-green-500/30"
                  muted
                >
                  <source src={change.newValue} type="video/mp4" />
                </video>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => handleRemoveChange(change.boardId, change.fieldPath)}
          className="text-red-400 hover:text-red-300 text-sm flex-shrink-0 p-1"
          title="이 변경사항 제거"
        >
          🗑️
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={toggleAdminPanel}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-brand-midgray border-l border-gray-700 z-50 overflow-y-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Admin 패널</h2>
              {getChangeCount() > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm text-brand-purple">
                    {getChangeCount()}개 변경됨
                  </span>
                  {undoStack.length > 0 && (
                    <button
                      onClick={handleUndo}
                      className="text-xs text-brand-blue hover:text-brand-blue/80 flex items-center gap-1"
                      title="마지막 변경 실행 취소"
                    >
                      ↩️ 실행 취소
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={toggleAdminPanel}
              className="text-gray-400 hover:text-white text-xl sm:text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'changes'
                  ? 'text-brand-purple border-b-2 border-brand-purple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📝 변경사항 ({contentChanges.length})
            </button>
            <button
              onClick={() => setActiveTab('boards')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'boards'
                  ? 'text-brand-purple border-b-2 border-brand-purple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📋 보드 관리 ({boardVisibilityChanges.length})
            </button>
          </div>

          {/* Changes Tab */}
          {activeTab === 'changes' && (
            <>
              {/* Info */}
              <div className="bg-brand-black/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-300">
                  ✅ 관리자 모드 활성화됨
                </p>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                  💡 텍스트/이미지를 클릭하여 편집하세요.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterType === 'all'
                      ? 'bg-brand-blue text-white neon-glow-blue'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  전체 ({contentChanges.length})
                </button>
                <button
                  onClick={() => setFilterType('text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterType === 'text'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  📝 텍스트 ({getChangesByType('text').length})
                </button>
                <button
                  onClick={() => setFilterType('image')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterType === 'image'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  🖼️ 이미지 ({getChangesByType('image').length})
                </button>
                <button
                  onClick={() => setFilterType('video')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterType === 'video'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  🎬 영상 ({getChangesByType('video').length})
                </button>
              </div>

              {/* Group Toggle */}
              <div className="flex items-center justify-between mb-4 p-3 bg-brand-black/30 rounded-lg">
                <span className="text-sm text-gray-300">보드별 그룹화</span>
                <button
                  onClick={() => setGroupByBoard(!groupByBoard)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    groupByBoard ? 'bg-brand-purple' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    groupByBoard ? 'transform translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Changes List */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">변경사항</h3>
                
                {filteredChanges.length === 0 ? (
                  <div className="bg-brand-black/50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-400 text-center">
                      {contentChanges.length === 0 
                        ? '아직 변경사항이 없습니다.' 
                        : `${filterType === 'text' ? '텍스트' : filterType === 'image' ? '이미지' : '영상'} 변경사항이 없습니다.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                    {groupByBoard ? (
                      Object.entries(groupedChanges).map(([boardId, changes]) => (
                        <div key={boardId} className="space-y-2">
                          <div className="sticky top-0 bg-brand-midgray py-2 z-10">
                            <h4 className="text-sm font-semibold text-brand-purple">
                              📌 {boardId} ({changes.length})
                            </h4>
                          </div>
                          {changes.map((change, index) => renderChange(change, index))}
                        </div>
                      ))
                    ) : (
                      filteredChanges.map((change, index) => renderChange(change, index))
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Boards Tab */}
          {activeTab === 'boards' && (
            <>
              {/* Info */}
              <div className="bg-brand-black/50 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm text-gray-300">
                  📋 보드 가시성 관리
                </p>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                  보드를 숨기거나 복원할 수 있습니다.
                </p>
              </div>

              {/* Show Hidden Boards Toggle */}
              <div className="flex items-center justify-between mb-4 p-3 bg-brand-black/30 rounded-lg">
                <span className="text-sm text-gray-300">숨겨진 보드 보기</span>
                <button
                  onClick={toggleShowHiddenBoards}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    showHiddenBoards ? 'bg-brand-purple' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    showHiddenBoards ? 'transform translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Boards List */}
              <div className="space-y-3 sm:space-y-4 mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  보드 목록 ({filteredBoards.length})
                </h3>
                
                {loadingBoards ? (
                  <div className="bg-brand-black/50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-400 text-center">
                      보드 목록을 불러오는 중...
                    </p>
                  </div>
                ) : filteredBoards.length === 0 ? (
                  <div className="bg-brand-black/50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-400 text-center">
                      {showHiddenBoards ? '숨겨진 보드가 없습니다.' : '표시할 보드가 없습니다.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredBoards.map((board, index) => {
                      const enabled = getBoardEnabled(board);
                      const hasVisibilityChange = getBoardVisibilityChange(board.id) !== null;
                      const orderChange = getBoardOrderChange(board.id);
                      const hasOrderChange = orderChange !== null;
                      const effectiveOrder = getEffectiveOrder(board);
                      const hasAnyChange = hasVisibilityChange || hasOrderChange;
                      
                      return (
                        <div 
                          key={board.id} 
                          className={`bg-brand-black/50 rounded-lg p-3 sm:p-4 ${
                            hasAnyChange ? 'border-2 border-brand-purple' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* 순서 조정 버튼 */}
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveBoardUp(board.id, boards)}
                                disabled={index === 0}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                                  index === 0 
                                    ? 'bg-gray-700 text-gray-600 cursor-not-allowed' 
                                    : 'bg-gray-600 hover:bg-brand-blue text-white'
                                }`}
                                title="위로 이동"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => moveBoardDown(board.id, boards)}
                                disabled={index === filteredBoards.length - 1}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                                  index === filteredBoards.length - 1
                                    ? 'bg-gray-700 text-gray-600 cursor-not-allowed' 
                                    : 'bg-gray-600 hover:bg-brand-blue text-white'
                                }`}
                                title="아래로 이동"
                              >
                                ▼
                              </button>
                            </div>

                            {/* 보드 정보 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-semibold text-white truncate">
                                  {board.id}
                                </span>
                                {hasVisibilityChange && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple">
                                    가시성 변경
                                  </span>
                                )}
                                {hasOrderChange && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-brand-blue/20 text-brand-blue">
                                    순서 변경
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-400">
                                  {getBoardTypeLabel(board.type)}
                                </span>
                                <span className={`text-xs ${hasOrderChange ? 'text-brand-blue font-semibold' : 'text-gray-500'}`}>
                                  순서: {effectiveOrder}
                                  {hasOrderChange && ` (원래: ${board.order})`}
                                </span>
                              </div>
                            </div>
                            
                            {/* 가시성 토글 */}
                            <button
                              onClick={() => toggleBoardVisibility(board.id, enabled)}
                              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                                enabled ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                              title={enabled ? '보드 숨기기' : '보드 복원'}
                            >
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                enabled ? 'transform translate-x-6' : ''
                              }`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="space-y-2 sm:space-y-3 sticky bottom-0 bg-brand-midgray pt-3 sm:pt-4 border-t border-gray-700">
            <button 
              data-save-button
              onClick={handleSave}
              disabled={getChangeCount() === 0}
              className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                getChangeCount() > 0
                  ? 'bg-brand-purple hover:bg-brand-purple/80 text-white neon-glow-purple'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              💾 변경사항 저장 ({getChangeCount()})
            </button>
            <button 
              onClick={handleCancel}
              className="w-full py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
            >
              ❌ 모두 취소하고 새로고침
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
