"use client";

import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import LoginModal from "@/components/admin/LoginModal";

export default function Header() {
  const { isAdmin, logout, toggleAdminPanel, isPreviewMode, togglePreviewMode } = useAdmin();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-brand-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-brand-purple">UPNEXX</span>
              <span className="text-brand-blue ml-1">STUDIO</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">서비스</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">기능</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">요금제</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
            </nav>

            {/* Desktop Admin & CTA */}
            <div className="hidden md:flex items-center gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={togglePreviewMode}
                    className={`px-4 py-2 font-semibold rounded-lg transition-colors text-sm ${
                      isPreviewMode
                        ? 'bg-brand-purple hover:bg-brand-purple/80 text-white neon-glow-purple'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    title={isPreviewMode ? "편집 모드로 전환" : "미리보기 모드로 전환"}
                  >
                    {isPreviewMode ? '👁️ 미리보기' : '✏️ 편집'}
                  </button>
                  <button
                    onClick={toggleAdminPanel}
                    className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold rounded-lg transition-colors neon-glow-blue text-sm"
                  >
                    Admin 패널
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    로그인
                  </button>
                  <button className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white font-semibold rounded-lg transition-colors neon-glow-purple text-sm">
                    무료 체험
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
              <nav className="flex flex-col gap-4 mb-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">서비스</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">기능</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">요금제</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors py-2">FAQ</a>
              </nav>
              <div className="flex flex-col gap-2">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => {
                        togglePreviewMode();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 font-semibold rounded-lg transition-colors text-sm ${
                        isPreviewMode
                          ? 'bg-brand-purple hover:bg-brand-purple/80 text-white neon-glow-purple'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {isPreviewMode ? '👁️ 미리보기' : '✏️ 편집'}
                    </button>
                    <button
                      onClick={() => {
                        toggleAdminPanel();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold rounded-lg transition-colors neon-glow-blue text-sm"
                    >
                      Admin 패널
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      로그인
                    </button>
                    <button className="w-full px-6 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white font-semibold rounded-lg transition-colors neon-glow-purple text-sm">
                      무료 체험
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
