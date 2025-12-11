// Board 공통 인터페이스
export interface BaseBoard {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
}

// Hero Board
export interface HeroBoard extends BaseBoard {
  type: "hero";
  content: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta?: string;
    mediaType: "image" | "video";
    mediaSrc: string;
  };
}

// Workflow Board
export interface WorkflowBoard extends BaseBoard {
  type: "workflow";
  content: {
    title: string;
    description: string;
    steps: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

// Problem/Solution Board
export interface ProblemSolutionBoard extends BaseBoard {
  type: "problem_solution";
  content: {
    title: string;
    subtitle: string;
    cards: Array<{
      image: string;
      title: string;
      description: string;
    }>;
  };
}

// Benefits Board
export interface BenefitsBoard extends BaseBoard {
  type: "benefits";
  content: {
    title: string;
    cards: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

// Pricing Board
export interface PricingBoard extends BaseBoard {
  type: "pricing";
  content: {
    title: string;
    subtitle: string;
    plans: Array<{
      name: string;
      price: string;
      features: string[];
      cta: string;
      highlighted?: boolean;
    }>;
  };
}

// FAQ Board
export interface FAQBoard extends BaseBoard {
  type: "faq";
  content: {
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
}

// Final CTA Board
export interface FinalCTABoard extends BaseBoard {
  type: "final_cta";
  content: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta?: string;
    mediaType: "image" | "video";
    mediaSrc: string;
  };
}

// Footer Board
export interface FooterBoard extends BaseBoard {
  type: "footer";
  content: {
    companyInfo: {
      name: string;
      description: string;
    };
    links: Array<{
      title: string;
      items: Array<{
        label: string;
        url: string;
      }>;
    }>;
    social: Array<{
      platform: string;
      url: string;
    }>;
    copyright: string;
  };
}

// 전체 Board 유니온 타입
export type Board = 
  | HeroBoard 
  | WorkflowBoard 
  | ProblemSolutionBoard
  | BenefitsBoard
  | PricingBoard
  | FAQBoard
  | FinalCTABoard
  | FooterBoard;

// 전체 boards 데이터 구조
export interface BoardsData {
  boards: Board[];
}
