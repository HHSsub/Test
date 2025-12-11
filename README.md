# UPNEXX Studio Web

AI-Powered Advertising Platform based on CREAGEN benchmarking

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Management:** JSON-based content system
- **Storage:** Supabase (planned)
- **CDN:** Cloudflare (planned)

## Project Structure

```
upnexx-studio/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/
│   │   ├── boards/       # Board 컴포넌트 (props 기반)
│   │   ├── layout/       # Header, Footer
│   │   └── admin/        # 관리자 컴포넌트 (예정)
│   ├── contexts/         # React Context (예정)
│   ├── lib/
│   │   └── boards.ts     # JSON 로드 유틸리티
│   └── types/
│       └── board.ts      # Board 타입 정의
├── data/
│   └── boards.json       # 전체 콘텐츠 데이터
└── public/              # 정적 파일
```

## Implemented Features

✅ **Step A** - Project initialization  
✅ **Step B** - CREAGEN layout skeleton structure  
✅ **Step C** - JSON-based content system

### JSON-Based Content System

All board content is managed through `data/boards.json`:

```json
{
  "boards": [
    {
      "id": "hero-1",
      "type": "hero",
      "enabled": true,
      "order": 1,
      "content": { ... }
    }
  ]
}
```

Each board component receives data via props and renders dynamically.

## Board Components

1. **HeroBoard** - Main hero section with CTA
2. **WorkflowBoard** - 3-step process
3. **ProblemSolutionBoard** - Problem + 4 solution cards
4. **BenefitsBoard** - 4 benefit cards
5. **PricingBoard** - 3 pricing plans (interactive)
6. **FAQBoard** - FAQ accordion (interactive)
7. **FinalCTABoard** - Final conversion section
8. **Header** - Top navigation
9. **Footer** - Company information

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Development Progress

- [x] **Step A**: Project initialization
- [x] **Step B**: CREAGEN layout skeleton structure
- [x] **Step C**: boards.json data structure & JSON-based rendering
- [ ] **Step D**: Admin login functionality
- [ ] **Step E**: Inline text editing
- [ ] **Step F**: Image upload/replace (Supabase)
- [ ] **Step G**: Video upload/replace (Supabase)
- [ ] **Step H**: Cloudflare CDN integration

## Brand Colors

- **Black:** #0a0a0a
- **Purple:** #8b5bff
- **Blue:** #35a8ff

## Development Notes

This project follows the UPNEXX_STUDIO_WEB_지식동기화_v2.md specifications.
All changes must be approved before implementation.

## Key Features Implemented

- ✅ Dynamic board rendering from JSON
- ✅ Props-based component architecture
- ✅ Board enable/disable via JSON
- ✅ Board ordering via JSON
- ✅ TypeScript type safety
- ✅ Interactive FAQ accordion
- ✅ Responsive grid layouts
