/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Baekdadam (백다담) Pop-up Store Interactive Tea Kitchen Mini-game
 * Cooking Mama style recipe selection, wrapping peel, timing drop, custom ingredients,
 * speed stirring time attack, Korean tea fortune, MBTI personality diagnosis, and mobile image save.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Flame, 
  Star,
  Share2,
  X,
  Database
} from 'lucide-react';
import { saveSurveyResponse } from './firebase.ts';
import { soundEngine } from './sound.ts';
import { 
  KoreanFlowerPattern, 
  KoreanCloudPattern, 
  KoreanKnotPattern, 
  KoreanLatticePattern,
  KoreanCornerAccent
} from './components/KoreanPatterns.tsx';

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

export interface MenuItem {
  id: 'pu_erh_latte' | 'grapefruit_oolong' | 'black_ade' | 'oolong_milk';
  name: string;
  subTitle: string;
  chagoName: string;
  chagoColor: string; // Brown tablet color (#382319)
  pointColor: string; // Vinyl packet point color (#D99219, #D52B2C, #C88F91, #48A52C)
  dissolveColor: string; // Exact watercolor bloom color when melting into cup
  liquidBaseColor: string;
  difficulty: number; // 1 to 3
  tasteDesc: string;
  recipeIngredients: string[];
  typeName: string;
  typeKeywords: string[];
  mbtiDesc: string;
  deskWellnessTip: string;
  bestMatch: string;
  goldenHour: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'pu_erh_latte',
    name: '연유 보이차 라떼',
    subTitle: '보이차고 + 달콤 연유 + 신선한 우유',
    chagoName: '운남 보이차고',
    chagoColor: '#382319', // 갈색 차고
    pointColor: '#D99219', // 보이차고 포인트 컬러 (비닐 껍질 색상)
    dissolveColor: '#D99219', // 녹아서 퍼지는 색상
    liquidBaseColor: '#4A2F20',
    difficulty: 3,
    tasteDesc: '깊고 진한 보이차의 구수함과 달콤한 연유, 부드러운 우유가 어우러진 든든한 한 잔',
    recipeIngredients: ['보이차고', '연유', '우유'],
    typeName: '묵직한 몰입형 (Deep Focus Type)',
    typeKeywords: ['#차분한_완벽주의', '#깊은_통찰', '#몰입의_미학', '#든든한_안정감'],
    mbtiDesc: '바쁜 일상과 수많은 업무 속에서도 나만의 단단한 호흡을 지키는 사람입니다. 겉으로는 조용하고 신중해 보이지만, 내면에는 오랜 시간 발효된 보이차처럼 깊고 풍부한 생각과 우직한 뚝심을 품고 있습니다.',
    deskWellnessTip: '오후 집중력이 흐려질 때, 따스한 라떼 한 잔과 함께 모니터에서 눈을 떼고 3분간 깊은 복식호흡을 해보세요.',
    bestMatch: '홍차 에이드 (지친 순간 톡 쏘는 생기를 불어넣어 주는 궁합)',
    goldenHour: '오후 2시 ~ 4시, 고도의 집중이 필요한 데스크 타임'
  },
  {
    id: 'grapefruit_oolong',
    name: '허니 자몽 우롱티',
    subTitle: '우롱차고 + 맑은 물 + 꿀 자몽청',
    chagoName: '대만 우롱차고',
    chagoColor: '#382319', // 갈색 차고
    pointColor: '#48A52C', // 우롱차고 포인트 컬러 (비닐 껍질 색상)
    dissolveColor: '#48A52C', // 녹아서 퍼지는 색상
    liquidBaseColor: '#C47833',
    difficulty: 2,
    tasteDesc: '향긋한 우롱차에 쌉싸름한 붉은 자몽청과 꿀이 감도는 상큼 청량한 풍미',
    recipeIngredients: ['우롱차고', '맑은 물', '꿀 자몽청'],
    typeName: '싱그러운 활력형 (Sparkling Energy Type)',
    typeKeywords: ['#생기_발랄', '#센스만점', '#트렌드_세터', '#달콤쌉싸름'],
    mbtiDesc: '주변에 맑고 긍정적인 에너지를 전파하는 활력 충전기 같은 존재입니다. 우롱차의 그윽한 잔향과 자몽의 톡톡 튀는 과즙처럼, 다채로운 호기심과 센스 있는 감각으로 일상에 유쾌한 활기를 불어넣습니다.',
    deskWellnessTip: '지루한 회의나 루틴한 일과 중, 얼음이 가득 든 허니 자몽티를 마시며 어깨 스트레칭을 3회 반복해보세요.',
    bestMatch: '우롱 밀크티 (포근하게 감싸주는 부드러운 단짝)',
    goldenHour: '점심 식사 직후, 기분 전환이 절실한 오후 1시'
  },
  {
    id: 'black_ade',
    name: '홍차 에이드',
    subTitle: '홍차고 + 톡톡 쏘는 탄산수',
    chagoName: '기문 홍차고',
    chagoColor: '#382319', // 갈색 차고
    pointColor: '#D52B2C', // 홍차고 포인트 컬러 (비닐 껍질 색상)
    dissolveColor: '#D52B2C', // 녹아서 퍼지는 색상
    liquidBaseColor: '#8C3122',
    difficulty: 1,
    tasteDesc: '섬세한 훈연향의 홍차와 톡톡 터지는 탄산이 어우러져 기분까지 상쾌해지는 에이드',
    recipeIngredients: ['홍차고', '청량 탄산수'],
    typeName: '깔끔한 리셋형 (Pure Reset Type)',
    typeKeywords: ['#쿨한_결단력', '#미니멀리스트', '#스트레스_제로', '#명쾌함'],
    mbtiDesc: '군더더기 없는 명쾌함과 깔끔한 일 처리를 선호하는 현대적 미니멀리스트입니다. 복잡하게 얽힌 문제도 톡 쏘는 탄산처럼 단번에 정리하며, 언제나 시원시원하고 솔직한 매력으로 신뢰를 얻습니다.',
    deskWellnessTip: '스트레스가 머리끝까지 찰 때, 시원한 탄산 기포 소리에 귀를 기울이며 찰나의 마인드풀니스를 경험해보세요.',
    bestMatch: '연유 보이차 라떼 (묵직하게 중심을 잡아주는 멘토 같은 차)',
    goldenHour: '나른한 오전 11시, 맑은 두뇌 회전이 필요한 순간'
  },
  {
    id: 'oolong_milk',
    name: '우롱 밀크티',
    subTitle: '우롱차고 + 달콤 각설탕 + 부드러운 우유',
    chagoName: '고산 우롱차고',
    chagoColor: '#382319', // 갈색 차고
    pointColor: '#48A52C', // 우롱차고 포인트 컬러 (비닐 껍질 색상)
    dissolveColor: '#48A52C', // 녹아서 퍼지는 색상
    liquidBaseColor: '#7A5232',
    difficulty: 2,
    tasteDesc: '진하게 우려낸 고산 우롱차의 풍부한 바디감에 은은한 단맛과 부드러운 우유의 조화',
    recipeIngredients: ['우롱차고', '각설탕', '우유'],
    typeName: '포근한 위로형 (Gentle Comfort Type)',
    typeKeywords: ['#따뜻한_공감', '#섬세한_배려', '#소확행_러버', '#달콤한_휴식'],
    mbtiDesc: '부드러운 우유 거품처럼 주변 사람들의 마음을 따스하게 어루만지는 힐러입니다. 남들의 작은 기분 변화도 세심하게 알아채며, 소소한 일상 속 행복을 소중히 여길 줄 아는 다정하고 낭만적인 영혼의 소유자입니다.',
    deskWellnessTip: '오늘 하루도 수고한 나 자신에게 밀크티 한 모금을 선물하며 "오늘도 참 잘 해냈다"고 마음속으로 칭찬해주세요.',
    bestMatch: '허니 자몽 우롱티 (지친 일상에 미소를 짓게 해주는 조합)',
    goldenHour: '퇴근 직전 혹은 나만의 저녁 홈카페 힐링 타임'
  }
];

export const TEA_FORTUNES = [
  {
    title: '맑은 찻물의 기운',
    fortune: '마음속 엉킨 생각들이 맑은 찻물처럼 가지런해지고, 뜻밖의 평온과 행운이 깃드는 날입니다.',
    luckyColor: '세이지 그린',
    luckyHour: '오후 2시'
  },
  {
    title: '은은한 향기의 결실',
    fortune: '정성스레 우려낸 차의 그윽한 잔향처럼, 그동안 들인 노력이 주변에 깊은 인정과 결실을 맺습니다.',
    luckyColor: '황금빛 우롱색',
    luckyHour: '오전 11시'
  },
  {
    title: '달콤한 인연의 선물',
    fortune: '달콤한 연유 한 방울처럼, 당신의 오늘을 기분 좋게 물들여줄 다정하고 반가운 인연이 찾아옵니다.',
    luckyColor: '크리미 아이보리',
    luckyHour: '오후 4시'
  },
  {
    title: '청량한 도약의 날',
    fortune: '톡톡 터지는 탄산수처럼 묵은 피로가 말끔히 씻겨나가고, 새로운 도전에 활력이 샘솟는 날입니다.',
    luckyColor: '루비 레드',
    luckyHour: '점심 12시 30분'
  },
  {
    title: '온화한 쉼표의 하루',
    fortune: '따스한 찻잔을 두 손으로 감싸듯, 숨 가쁜 일상에 포근한 쉼표 하나가 찾아와 마음을 달래줍니다.',
    luckyColor: '따뜻한 어텀 브라운',
    luckyHour: '오후 5시'
  }
];

// ==========================================
// 2. ILLUSTRATION SVGS
// ==========================================

export function TeaSpoonSVG({ className = "w-9 h-38" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="spoonMetalGradient" x1="0" y1="0" x2="32" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAF7F0" />
          <stop offset="0.25" stopColor="#E4D9C8" />
          <stop offset="0.65" stopColor="#BAA893" />
          <stop offset="1" stopColor="#8C7762" />
        </linearGradient>
      </defs>
      <rect x="13.5" y="4" width="5" height="106" rx="2.5" fill="url(#spoonMetalGradient)" stroke="#534235" strokeWidth="1.2" />
      <circle cx="16" cy="7.5" r="5" fill="#D4C5B0" stroke="#534235" strokeWidth="1.2" />
      <circle cx="16" cy="7.5" r="2" fill="#FAF7F0" />
      <line x1="16" y1="16" x2="16" y2="104" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
      <path d="M13.5 108C13.5 116 8 124 8 134C8 143 11.5 148 16 148C20.5 148 24 143 24 134C24 124 18.5 108 18.5 108Z" fill="url(#spoonMetalGradient)" stroke="#534235" strokeWidth="1.4" />
      <ellipse cx="16" cy="133" rx="5" ry="8.5" fill="#FFFFFF" opacity="0.65" />
    </svg>
  );
}

export function BrownChagoTablet({
  size = "md",
  className = "",
  showBounce = false,
  showLabel = false
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBounce?: boolean;
  showLabel?: boolean;
}) {
  const sizeDims = {
    sm: "w-14 h-14",
    md: "w-22 h-22",
    lg: "w-28 h-28",
    xl: "w-48 h-48"
  }[size];

  const textSize = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${showBounce ? 'animate-bounce' : ''}`}>
      {/* 3D Pressed Brown Tea Concentrate Tablet */}
      <div 
        className={`${sizeDims} ${className} rounded-2xl relative flex items-center justify-center p-2.5 transition-transform shadow-2xl`}
        style={{
          // Authentic dark tea brown
          backgroundColor: '#382218',
          backgroundImage: 'radial-gradient(circle at 35% 30%, #4D3224 0%, #382218 65%, #22130C 100%)',
          boxShadow: '0 12px 28px rgba(34, 19, 12, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.22), inset 0 -3px 4px rgba(0, 0, 0, 0.7)',
          border: '1.5px solid #24140D'
        }}
      >
        {/* Subtle beveled rim inset */}
        <div 
          className="absolute inset-1.5 rounded-xl pointer-events-none"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.45)'
          }}
        />

        {/* Debossed octagonal border stamped into the tea cake */}
        <div 
          className="relative w-4/5 h-4/5 rounded-xl flex items-center justify-center p-1"
          style={{
            border: '1.5px solid #20110A',
            boxShadow: 'inset 1.5px 1.5px 3px rgba(0,0,0,0.85), 0 1px 1px rgba(255,255,255,0.14)'
          }}
        >
          {/* Transparent Engraved '백다담' Carving (투명 각인 글씨) */}
          <span 
            className={`font-serif font-black tracking-widest ${textSize} select-none`}
            style={{
              color: 'transparent',
              textShadow: '0 1.5px 1.5px rgba(255, 255, 255, 0.25), 0 -1.5px 2px rgba(0, 0, 0, 0.95), 1px 0 1px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.15em'
            }}
          >
            백다담
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-[10px] font-bold text-[#8C3A2B] bg-white/95 px-2.5 py-0.5 rounded-full border border-[#D4C5B0] shadow-md mt-2 whitespace-nowrap animate-pulse">
          ✨ 백다담 차고 개봉 완료!
        </span>
      )}
    </div>
  );
}

export function WrappedChagoPacketSVG({ 
  menu,
  peelCount = 0 
}: { 
  menu?: MenuItem; 
  peelCount: number;
}) {
  // Foil tearing clip-paths revealing the brown tablet underneath
  const clipPaths = [
    'polygon(0 0, 100% 0, 100% 100%, 0 100%)', // 0: full foil wrapped
    'polygon(0 0, 78% 0, 100% 22%, 100% 100%, 0 100%)', // 1: top-right corner peeled
    'polygon(0 0, 52% 0, 100% 48%, 100% 100%, 0 100%)', // 2: deeper corner peel
    'polygon(0 0, 24% 0, 100% 76%, 100% 100%, 0 100%)', // 3: half peeled
    'polygon(0 25%, 0 0, 25% 0, 100% 75%, 100% 100%, 75% 100%)', // 4: mostly torn open
    'polygon(0 0, 0 0, 0 0, 0 0)' // 5: completely peeled off
  ];

  const pointColor = menu?.pointColor || '#D99219';

  return (
    <div className="relative w-56 h-56 flex items-center justify-center cursor-pointer select-none">
      {/* Underlying Brown Chago Tablet with transparent engraved '백다담' */}
      <div 
        className={`absolute z-10 transition-all duration-500 ${
          peelCount >= 5 ? 'opacity-100 scale-100' : 'opacity-95 scale-95'
        }`}
      >
        <BrownChagoTablet size="xl" showBounce={peelCount >= 5} showLabel={peelCount >= 5} />
      </div>

      {/* User's uploaded foil wrapper image, zoomed in even more (scale-[2.5]) and tinted with tea point color */}
      <div 
        className={`w-52 h-52 rounded-3xl relative transition-all duration-300 shadow-2xl z-20 flex items-center justify-center overflow-hidden border border-black/10 ${
          peelCount >= 5 ? 'opacity-0 scale-125 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        style={{
          clipPath: clipPaths[Math.min(peelCount, 5)],
          transform: `rotate(${peelCount * 3}deg) scale(${1 - peelCount * 0.02})`,
          boxShadow: '0 16px 36px rgba(0,0,0,0.35)'
        }}
      >
        {/* Ultra High-Definition Crinkled Metallic Foil Photo Texture */}
        <img 
          src="/assets/images/hd_chago_foil.jpg"
          alt="차고 고화질 은박 껍질"
          className="w-full h-full object-cover scale-110 select-none pointer-events-none"
          style={{
            filter: 'grayscale(100%) contrast(130%) brightness(105%)'
          }}
        />

        {/* Primary Point Color Tint (Preserves all reflective highlights and creases in point color) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: pointColor,
            mixBlendMode: 'color'
          }}
        />

        {/* Secondary Color Richness Overlay (Ensures point color is vivid and rich in the crevices) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: pointColor,
            mixBlendMode: 'multiply',
            opacity: 0.25
          }}
        />
      </div>
    </div>
  );
}

export function MenuDrinkCupSVG({
  menu,
  size = "md",
  isGarnished = true,
  isDissolving = false,
  dissolveProgress = 1
}: {
  menu: MenuItem;
  size?: "sm" | "md" | "lg";
  isGarnished?: boolean;
  isDissolving?: boolean;
  dissolveProgress?: number;
}) {
  const sizeClasses = {
    sm: "w-20 h-30",
    md: "w-40 h-58",
    lg: "w-52 h-74"
  }[size];

  // Specific visual styling per menu
  const isLatte = menu.id === 'pu_erh_latte';
  const isGrapefruit = menu.id === 'grapefruit_oolong';
  const isAde = menu.id === 'black_ade';
  const isMilkTea = menu.id === 'oolong_milk';

  return (
    <div className={`relative ${sizeClasses} flex flex-col justify-end items-center select-none`}>
      {/* Top Garnish: Grapefruit slice if grapefruit oolong */}
      {isGrapefruit && isGarnished && (
        <div className="absolute -top-3.5 -right-3 z-30 transform rotate-12 drop-shadow-md">
          <svg className={size === 'sm' ? "w-8 h-8" : "w-13 h-13"} viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="#E65345" stroke="#C2382B" strokeWidth="2" />
            <circle cx="24" cy="24" r="18" fill="#FF7D6B" stroke="#FFF" strokeWidth="1.5" />
            <path d="M24 6V42M6 24H42M11.3 11.3L36.7 36.7M11.3 36.7L36.7 11.3" stroke="#FFF" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* Glass Tumbler Container */}
      <div className="w-full h-full border-4 border-[#D9CEBF] rounded-b-[2.5rem] rounded-t-lg bg-white/45 shadow-inner backdrop-blur-sm relative overflow-hidden flex flex-col justify-end p-2">
        {/* Glass reflection highlight on left */}
        <div className="absolute top-2 left-2 w-2 bottom-6 bg-gradient-to-r from-white/70 to-transparent rounded-full z-20 pointer-events-none" />
        
        {/* Glass rim shimmer */}
        <div className="absolute top-0 inset-x-2 h-1.5 bg-white/80 rounded-full z-20 pointer-events-none" />

        {/* Sparkling bubbles if black ade */}
        {isAde && (
          <div className="absolute inset-0 z-10 flex justify-around pointer-events-none opacity-50">
            <span className="animate-ping text-[10px] delay-100">🫧</span>
            <span className="animate-pulse text-xs delay-300">🫧</span>
            <span className="animate-ping text-[10px] delay-500">🫧</span>
          </div>
        )}

        {/* Liquid Container - 100% clipped inside */}
        <div 
          className="w-full rounded-b-[2rem] relative flex items-center justify-center overflow-hidden transition-all duration-700"
          style={{
            height: '84%',
            backgroundColor: isLatte ? '#F4EDE2' : (isMilkTea ? '#CBB49E' : menu.liquidBaseColor)
          }}
        >
          {/* Chago dissolved watercolor background layer (Point colors: #D99219, #D52B2C, #48A52C) */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundColor: menu.dissolveColor,
              opacity: (isLatte ? 0.65 : (isMilkTea ? 0.75 : 0.88)) * dissolveProgress
            }}
          />

          {/* Organic watercolor blooming circles spreading strictly INSIDE the cup liquid in tea point colors */}
          {isDissolving && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
              <div
                className="absolute rounded-full tea-bloom filter blur-md"
                style={{ 
                  backgroundColor: menu.dissolveColor,
                  width: '90px',
                  height: '90px',
                  bottom: '22%'
                }}
              />
              <div
                className="absolute rounded-full tea-bloom-delayed filter blur-lg"
                style={{ 
                  backgroundColor: menu.dissolveColor,
                  width: '115px',
                  height: '115px',
                  bottom: '12%',
                  opacity: 0.92
                }}
              />
              <div
                className="absolute rounded-full tea-bloom-ambient filter blur-xl"
                style={{ 
                  backgroundColor: menu.dissolveColor,
                  width: '145px',
                  height: '145px',
                  bottom: '2%',
                  opacity: 0.95
                }}
              />
            </div>
          )}

          {/* Ice Cubes */}
          <div className="absolute top-3 left-3 w-6 h-6 bg-white/40 rounded-lg transform rotate-12 border border-white/50 backdrop-blur-xs z-10 shadow-xs pointer-events-none" />
          <div className="absolute top-7 right-4 w-5 h-5 bg-white/30 rounded-lg transform -rotate-12 border border-white/40 backdrop-blur-xs z-10 shadow-xs pointer-events-none" />

          {/* Latte milk swirl overlay */}
          {isLatte && (
            <div 
              className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/90 to-transparent pointer-events-none z-10"
            />
          )}

          {/* Condensed milk bottom layer */}
          {isLatte && isGarnished && (
            <div 
              className="absolute bottom-0 inset-x-0 h-1/4 bg-[#FAF4E6]/95 pointer-events-none z-10 border-t border-white/30"
            />
          )}

          {/* Grapefruit fruit pulp pieces at bottom */}
          {isGrapefruit && isGarnished && (
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-[#D64536]/80 to-transparent pointer-events-none z-10 flex justify-center items-end pb-1 gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7D6B] opacity-80" />
              <span className="w-2 h-2 rounded-full bg-[#E65345] opacity-75" />
              <span className="w-3 h-3 rounded-full bg-[#FF9688] opacity-80" />
            </div>
          )}

          {/* Sugar cube floating for oolong milk tea */}
          {isMilkTea && isGarnished && (
            <div className="absolute bottom-4 left-6 w-4 h-4 rounded-sm bg-white/80 border border-white shadow-xs transform rotate-45 pointer-events-none z-10" />
          )}
        </div>
      </div>

      {/* Glass coaster / shadow */}
      <div className="w-4/5 h-2 bg-[#534235]/15 rounded-full filter blur-[2px] mt-1.5" />
    </div>
  );
}

// ==========================================
// 3. MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
  // Navigation Steps:
  // 0: Clean Landing Screen (단 하나의 '티 만들어보기' 시작하기 버튼, 안락하고 눈이 편한 레이아웃)
  // 1: Menu Selection (쿠킹마마 스타일: 4가지 메뉴 + 난이도 별점 + 맛 평가 1줄 + 완성 찻잔)
  // 2: Interactive Cooking Game (껍질 벗기기 5회 -> 타이밍 퐁당 -> 5초 용해/재료 추가 -> 스피드 티스푼 젓기)
  // 3: Recipe Completion Card (오늘의 운세 + MBTI 성격 상세 분석 + 모바일 저장 해결)
  // 4: Tasting & 1-Minute Pop-up Survey (Firestore 누적 저장)
  const [step, setStep] = useState<number>(0);

  // Selected Recipe
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>(MENU_ITEMS[0]);

  // Audio state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Mini-game Sub-phases
  // 'peel' -> 'drop_aim' -> 'dissolve' -> 'ingredients' -> 'stir_speed' -> 'done'
  const [gamePhase, setGamePhase] = useState<'peel' | 'drop_aim' | 'dissolve' | 'ingredients' | 'stir_speed' | 'done'>('peel');

  // Game Score & Stats
  const [peelCount, setPeelCount] = useState<number>(0);
  const [timingOffset, setTimingOffset] = useState<number>(50); // 0 to 100 for drop gauge
  const [timingDirection, setTimingDirection] = useState<'left' | 'right'>('right');
  const [dropAccuracy, setDropAccuracy] = useState<'PERFECT' | 'GREAT' | 'GOOD' | null>(null);
  const [dropScore, setDropScore] = useState<number>(0);

  // Dissolve & Ingredients
  const [dissolveTimer, setDissolveTimer] = useState<number>(5);
  const [pourProgress, setPourProgress] = useState<number>(0);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [isIngredientAdded, setIsIngredientAdded] = useState<boolean>(false);

  // Speed Stirring Time Attack
  const [stirProgress, setStirProgress] = useState<number>(0); // 0 to 3 turns
  const [stirAngleAccum, setStirAngleAccum] = useState<number>(0);
  const [stirStartTime, setStirStartTime] = useState<number | null>(null);
  const [stirElapsedTime, setStirElapsedTime] = useState<number>(0); // in seconds
  const [isStirTimerRunning, setIsStirTimerRunning] = useState<boolean>(false);
  const [spoonPos, setSpoonPos] = useState<{ x: number; y: number }>({ x: 0, y: -10 });
  const cupAreaRef = useRef<HTMLDivElement | null>(null);
  const lastAngleRef = useRef<number | null>(null);

  // Final Total Game Score & Title
  const [totalScore, setTotalScore] = useState<number>(850);
  const [fortuneIndex, setFortuneIndex] = useState<number>(0);

  // Mobile Image Modal Preview state
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tasting Pass State (Step 4 Tasting Voucher, Survey removed per user request)
  const [isRedeemed, setIsRedeemed] = useState<boolean>(false);
  const [redeemedTime, setRedeemedTime] = useState<string>('');
  const [voucherCode, setVoucherCode] = useState<string>('BKDM-7821');

  // Firebase Firestore auto-saving state for (최종 점수, 선택한 음료, 000type)
  const [firestoreDocId, setFirestoreDocId] = useState<string | null>(null);
  const [isSavingFirestore, setIsSavingFirestore] = useState<boolean>(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Auto-save session summary (최종 점수, 선택한 음료, 000type) to Firebase Firestore
  useEffect(() => {
    if (step === 3 && !firestoreDocId) {
      let isMounted = true;
      const saveRecord = async () => {
        try {
          setIsSavingFirestore(true);
          const docId = await saveSurveyResponse({
            ageGroup: '팝업 방문객',
            occupation: '다도 체험객',
            taste: 5,
            convenience: 5,
            dailyIntent: 5,
            moment: '티 키친 팝업스토어',
            recipeTitle: `${selectedMenu.name} (최종점수: ${totalScore}점)`,
            diagnosedType: selectedMenu.typeName,
            matchedTasting: selectedMenu.tasteDesc,
            selectedChago: selectedMenu.chagoName,
            selectedBase: selectedMenu.recipeIngredients.join(' + '),
            selectedTopping: `최종점수: ${totalScore}점 | 젓기: ${stirElapsedTime.toFixed(2)}초`
          });
          if (isMounted) {
            setFirestoreDocId(docId);
          }
        } catch (err) {
          console.warn('Firestore auto-save notice (will sync when online):', err);
        } finally {
          if (isMounted) {
            setIsSavingFirestore(false);
          }
        }
      };
      saveRecord();
      return () => {
        isMounted = false;
      };
    }
  }, [step, firestoreDocId, selectedMenu, totalScore, stirElapsedTime]);

  // Timing drop gauge oscillation
  useEffect(() => {
    let animId: number;
    if (step === 2 && gamePhase === 'drop_aim' && !dropAccuracy) {
      const stepAnim = () => {
        setTimingOffset(prev => {
          let next = prev + (timingDirection === 'right' ? 2.2 : -2.2);
          if (next >= 98) {
            setTimingDirection('left');
            next = 98;
          } else if (next <= 2) {
            setTimingDirection('right');
            next = 2;
          }
          return next;
        });
        animId = requestAnimationFrame(stepAnim);
      };
      animId = requestAnimationFrame(stepAnim);
    }
    return () => cancelAnimationFrame(animId);
  }, [step, gamePhase, timingDirection, dropAccuracy]);

  // 5 seconds Dissolve Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (step === 2 && gamePhase === 'dissolve') {
      timer = setInterval(() => {
        setDissolveTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer!);
            setGamePhase('ingredients');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, gamePhase]);

  // Ingredient pouring timer (3.0s total)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPouring && pourProgress < 100) {
      interval = setInterval(() => {
        setPourProgress(prev => {
          const next = prev + 1.2;
          if (next >= 100) {
            clearInterval(interval!);
            setIsPouring(false);
            setIsIngredientAdded(true);
            soundEngine.playSfx('great');
            setTimeout(() => {
              setGamePhase('stir_speed');
              startStirTimer();
            }, 600);
            return 100;
          }
          return next;
        });
      }, 30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPouring, pourProgress]);

  // Live stopwatch for speed stirring
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isStirTimerRunning && stirStartTime) {
      timer = setInterval(() => {
        const elapsed = (performance.now() - stirStartTime) / 1000;
        setStirElapsedTime(elapsed);
      }, 30);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStirTimerRunning, stirStartTime]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Start the Cooking Game for selected menu
  const handleSelectMenuAndStart = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setGamePhase('peel');
    setPeelCount(0);
    setDropAccuracy(null);
    setDropScore(0);
    setDissolveTimer(5);
    setPourProgress(0);
    setIsPouring(false);
    setIsIngredientAdded(false);
    setStirProgress(0);
    setStirAngleAccum(0);
    setStirStartTime(null);
    setStirElapsedTime(0);
    setIsStirTimerRunning(false);
    setSpoonPos({ x: 0, y: -10 });
    lastAngleRef.current = null;
    setIsRedeemed(false);
    setRedeemedTime('');
    setVoucherCode(`BKDM-${Math.floor(1000 + Math.random() * 9000)}`);
    setFirestoreDocId(null);
    setIsSavingFirestore(false);
    setStep(2);
    soundEngine.playSfx('tap');
  };

  // 1. Chago Peeling Action (5 taps)
  const handleTapPeelWrapper = () => {
    if (peelCount >= 5) return;
    const nextCount = peelCount + 1;
    setPeelCount(nextCount);
    soundEngine.playSfx('peel');

    if (nextCount >= 5) {
      soundEngine.playSfx('perfect');
      setTimeout(() => {
        setGamePhase('drop_aim');
      }, 700);
    }
  };

  // 2. Timing Aim Drop Action
  const handleTriggerDrop = () => {
    if (dropAccuracy) return; // already dropped

    // Distance from center (50)
    const diff = Math.abs(timingOffset - 50);
    let grade: 'PERFECT' | 'GREAT' | 'GOOD' = 'GOOD';
    let score = 150;

    if (diff <= 12) {
      grade = 'PERFECT';
      score = 300;
      soundEngine.playSfx('perfect');
    } else if (diff <= 26) {
      grade = 'GREAT';
      score = 220;
      soundEngine.playSfx('great');
    } else {
      grade = 'GOOD';
      score = 150;
      soundEngine.playSfx('drop');
    }

    setDropAccuracy(grade);
    setDropScore(score);

    setTimeout(() => {
      soundEngine.playSfx('drop');
      setGamePhase('dissolve');
    }, 900);
  };

  // 3. Start Stir Timer
  const startStirTimer = () => {
    setStirStartTime(performance.now());
    setIsStirTimerRunning(true);
  };

  // 4. Teaspoon Stirring Move (Cursor Tracking, stationary cup)
  const handleStirStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (gamePhase !== 'stir_speed') return;
    lastAngleRef.current = null;
    if (!isStirTimerRunning) {
      startStirTimer();
    }
    handleStirMove(e);
  };

  const handleStirMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (gamePhase !== 'stir_speed') return;
    if (!cupAreaRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const cupRect = cupAreaRef.current.getBoundingClientRect();
    const centerX = cupRect.left + cupRect.width / 2;
    const centerY = cupRect.top + cupRect.height * 0.46; // Center of liquid area

    const rawX = clientX - centerX;
    const rawY = clientY - centerY;

    // Constrain teaspoon within liquid bounds
    const clampedX = Math.max(-46, Math.min(46, rawX));
    const clampedY = Math.max(-48, Math.min(48, rawY));
    setSpoonPos({ x: clampedX, y: clampedY });

    const currentAngle = Math.atan2(rawY, rawX) * (180 / Math.PI);

    if (lastAngleRef.current !== null) {
      let delta = currentAngle - lastAngleRef.current;
      if (delta < -180) delta += 360;
      if (delta > 180) delta -= 360;

      // Clockwise rotation (positive delta)
      if (delta > 0 && delta < 90) {
        setStirAngleAccum(prev => {
          const nextAccum = prev + delta;
          const completeTurns = Math.min(3, Math.floor(nextAccum / 360));
          setStirProgress(completeTurns);

          if (completeTurns >= 3 && isStirTimerRunning) {
            setIsStirTimerRunning(false);
            const finalElapsed = stirStartTime ? (performance.now() - stirStartTime) / 1000 : 2.5;
            setStirElapsedTime(finalElapsed);
            soundEngine.playSfx('complete');

            // Calculate final score
            let stirScore = 400;
            if (finalElapsed <= 2.2) stirScore = 500;
            else if (finalElapsed <= 3.5) stirScore = 460;
            else if (finalElapsed <= 5.0) stirScore = 420;

            const computedTotal = 200 + dropScore + stirScore;
            setTotalScore(computedTotal);
            setFortuneIndex(Math.floor(Math.random() * TEA_FORTUNES.length));

            setTimeout(() => {
              setGamePhase('done');
            }, 600);
          }
          return nextAccum;
        });
      }
    }
    lastAngleRef.current = currentAngle;
  };

  // Generate High-Res Image for Mobile & Desktop
  const handleGenerateRecipeImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Hanji paper tone
    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, 750, 1000);

    // Decorative Korean lattice border
    ctx.strokeStyle = '#D9CEBF';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 690, 940);

    ctx.strokeStyle = '#534235';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, 670, 920);

    // Header branding
    ctx.fillStyle = '#8C3A2B';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('白茶談 팝업스토어 전용 레시피 카드', 375, 100);

    ctx.fillStyle = '#392B21';
    ctx.font = 'bold 44px serif';
    ctx.fillText(selectedMenu.name, 375, 165);

    ctx.fillStyle = '#7A9A8B';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(selectedMenu.typeName, 375, 205);

    // Score Badge
    ctx.fillStyle = '#EFE7DA';
    ctx.fillRect(200, 235, 350, 48);
    ctx.strokeStyle = '#D4C5B0';
    ctx.lineWidth = 1;
    ctx.strokeRect(200, 235, 350, 48);

    ctx.fillStyle = '#392B21';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`다도 점수: ${totalScore}점 (젓기: ${stirElapsedTime.toFixed(2)}초)`, 375, 267);

    // ==========================================
    // Drink Visual Frame (Centered in 750 x 1000 Canvas)
    // ==========================================
    const frameX = 140;
    const frameY = 300;
    const frameW = 470;
    const frameH = 340;

    // Soft warm background frame
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameW, frameH, 24);
    ctx.fill();
    ctx.strokeStyle = '#E0D4C3';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cup dimensions (centered in frame)
    const cupX = 275;
    const cupY = 330;
    const cupW = 200;
    const cupH = 265;
    const cupR = 36; // rounded bottom radius

    // 1. Soft cup shadow
    ctx.fillStyle = 'rgba(83, 66, 53, 0.08)';
    ctx.beginPath();
    ctx.ellipse(cupX + cupW / 2, cupY + cupH + 12, cupW * 0.48, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Liquid in Glass (clipped to cup body)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cupX + 8, cupY + 10);
    ctx.lineTo(cupX + cupW - 8, cupY + 10);
    ctx.lineTo(cupX + cupW - 14, cupY + cupH - cupR);
    ctx.quadraticCurveTo(cupX + cupW - 14, cupY + cupH, cupX + cupW - cupR - 10, cupY + cupH);
    ctx.lineTo(cupX + cupR + 10, cupY + cupH);
    ctx.quadraticCurveTo(cupX + 14, cupY + cupH, cupX + 14, cupY + cupH - cupR);
    ctx.closePath();
    ctx.clip();

    // Liquid gradient fill
    const liquidGrad = ctx.createLinearGradient(cupX, cupY + 30, cupX, cupY + cupH);
    if (selectedMenu.id === 'pu_erh_latte') {
      liquidGrad.addColorStop(0, '#F5EDE2');
      liquidGrad.addColorStop(0.35, '#E2C8A8');
      liquidGrad.addColorStop(1, '#8C4D26');
    } else if (selectedMenu.id === 'oolong_milk') {
      liquidGrad.addColorStop(0, '#FAF0E4');
      liquidGrad.addColorStop(0.3, '#D9BFA2');
      liquidGrad.addColorStop(1, '#6F4E37');
    } else if (selectedMenu.id === 'black_ade') {
      liquidGrad.addColorStop(0, '#B23A2B');
      liquidGrad.addColorStop(0.6, '#8A2015');
      liquidGrad.addColorStop(1, '#4A1009');
    } else { // grapefruit_oolong
      liquidGrad.addColorStop(0, '#E87A5D');
      liquidGrad.addColorStop(0.5, '#D45D3A');
      liquidGrad.addColorStop(1, '#657834');
    }
    ctx.fillStyle = liquidGrad;
    ctx.fill();

    // Ice Cubes floating
    const drawIceCube = (ix: number, iy: number, iw: number, ih: number, rot: number) => {
      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-iw / 2, -ih / 2, iw, ih, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(-iw / 2 + 4, -ih / 2 + 4, iw - 8, 3);
      ctx.restore();
    };

    drawIceCube(cupX + 55, cupY + 110, 48, 44, -12);
    drawIceCube(cupX + 140, cupY + 125, 46, 42, 16);
    drawIceCube(cupX + 85, cupY + 175, 52, 46, 8);

    // Floating Tea Chago Tablet at bottom
    ctx.save();
    ctx.translate(cupX + cupW / 2 - 5, cupY + cupH - 55);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#382218';
    ctx.beginPath();
    ctx.roundRect(-28, -24, 56, 48, 10);
    ctx.fill();
    ctx.strokeStyle = '#20110A';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-22, -18, 44, 36);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = 'bold 13px serif';
    ctx.textAlign = 'center';
    ctx.fillText('백다담', 0, 5);
    ctx.restore();

    // Sparkling bubbles if ade
    if (selectedMenu.id === 'black_ade') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      const bubbles = [
        [cupX + 50, cupY + 220, 4], [cupX + 80, cupY + 140, 5],
        [cupX + 130, cupY + 200, 3], [cupX + 160, cupY + 110, 6],
        [cupX + 110, cupY + 80, 4], [cupX + 70, cupY + 70, 5]
      ];
      bubbles.forEach(([bx, by, br]) => {
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Condensed milk swirl if latte / milk tea
    if (selectedMenu.id === 'pu_erh_latte' || selectedMenu.id === 'oolong_milk') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(cupX + cupW / 2, cupY + 45, cupW * 0.42, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cupX + 70, cupY + 46, 22, 0, Math.PI);
      ctx.arc(cupX + 110, cupY + 46, 22, 0, Math.PI);
      ctx.arc(cupX + 140, cupY + 46, 18, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore(); // end clip

    // 3. Glass Tumbler Outer Outline & Rim
    ctx.strokeStyle = '#D9CEBF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cupX + 8, cupY + 10);
    ctx.lineTo(cupX + cupW - 8, cupY + 10);
    ctx.lineTo(cupX + cupW - 14, cupY + cupH - cupR);
    ctx.quadraticCurveTo(cupX + cupW - 14, cupY + cupH, cupX + cupW - cupR - 10, cupY + cupH);
    ctx.lineTo(cupX + cupR + 10, cupY + cupH);
    ctx.quadraticCurveTo(cupX + 14, cupY + cupH, cupX + 14, cupY + cupH - cupR);
    ctx.closePath();
    ctx.stroke();

    // Glass rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cupX + 18, cupY + 11);
    ctx.lineTo(cupX + cupW - 18, cupY + 11);
    ctx.stroke();

    // Glass vertical reflection streak on left
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.beginPath();
    ctx.roundRect(cupX + 22, cupY + 28, 9, cupH - 65, 4);
    ctx.fill();

    // 4. Garnishes on Rim (Grapefruit / Lemon / Mint)
    if (selectedMenu.id === 'grapefruit_oolong') {
      const gx = cupX + cupW - 18;
      const gy = cupY + 16;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(0.35);
      ctx.fillStyle = '#E65345';
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C2382B';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF7D6B';
      ctx.beginPath();
      ctx.arc(0, 0, 27, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      for (let a = 0; a < 8; a++) {
        const rad = (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rad) * 27, Math.sin(rad) * 27);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = '#556E5C';
      ctx.beginPath();
      ctx.ellipse(gx - 28, gy - 20, 14, 8, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(gx - 40, gy - 16, 12, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (selectedMenu.id === 'black_ade') {
      const lx = cupX + cupW - 18;
      const ly = cupY + 16;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(0.25);
      ctx.fillStyle = '#F4C200';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE066';
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < 8; a++) {
        const rad = (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rad) * 23, Math.sin(rad) * 23);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = '#392B21';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`조합: ${selectedMenu.recipeIngredients.join(' + ')}`, 375, 672);

    // Taste description
    ctx.fillStyle = '#534235';
    ctx.font = 'italic 19px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${selectedMenu.tasteDesc}"`, 375, 715);

    // Fortune Box
    ctx.fillStyle = '#F4EDE2';
    ctx.fillRect(60, 755, 630, 95);
    ctx.strokeStyle = '#D4C5B0';
    ctx.strokeRect(60, 755, 630, 95);

    ctx.fillStyle = '#8C3A2B';
    ctx.font = 'bold 18px serif';
    ctx.fillText(`[오늘의 찻잔 운세] ${TEA_FORTUNES[fortuneIndex].title}`, 375, 790);

    ctx.fillStyle = '#534235';
    ctx.font = '16px sans-serif';
    ctx.fillText(TEA_FORTUNES[fortuneIndex].fortune, 375, 825);

    // Footer
    ctx.fillStyle = '#8C7762';
    ctx.font = '15px sans-serif';
    ctx.fillText('대한민국 전통 차의 새로운 경험 | 나만의 한 잔, 백다담', 375, 920);

    const dataUrl = canvas.toDataURL('image/png');
    setGeneratedCardUrl(dataUrl);
    setShowImageModal(true);
    soundEngine.playSfx('tap');
  };

  // Direct PNG Download Helper with Mobile Share Sheet Support
  const handleDownloadImage = async () => {
    if (!generatedCardUrl) return;

    // 1. Mobile Web Share API: Saves directly to Camera Roll on iOS Safari / Android
    if (navigator.share) {
      try {
        const res = await fetch(generatedCardUrl);
        const blob = await res.blob();
        const file = new File([blob], `백다담_나만의레시피_${selectedMenu.name}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `백다담 ${selectedMenu.name} 레시피`,
            text: `백다담 팝업스토어에서 만든 나만의 차 레시피 (${selectedMenu.typeName})`
          });
          soundEngine.playSfx('complete');
          return;
        }
      } catch (err) {
        console.log('Mobile share dismissed or fallback');
      }
    }

    // 2. Direct Anchor Click for Desktop browsers
    const link = document.createElement('a');
    link.download = `백다담_나만의레시피_${selectedMenu.name}.png`;
    link.href = generatedCardUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundEngine.playSfx('tap');
  };

  // Barista Stamp Redemption Handler (Step 4 Tasting Voucher)
  const handleRedeemVoucher = () => {
    if (isRedeemed) return;
    setIsRedeemed(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setRedeemedTime(timeStr);
    soundEngine.playSfx('complete');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] hanji-texture hanok-grid text-[#392B21] flex flex-col justify-between selection:bg-[#556E5C]/20 select-none">
      
      {/* ======================================================== */}
      {/* BRAND HEADER BAR (With Official Baekdadam Logo & Audio) */}
      {/* ======================================================== */}
      <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between border-b border-[#E0D4C3] bg-[#FAF7F0]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          {step > 0 && (
            <button
              onClick={() => {
                if (step === 2) setStep(1);
                else if (step > 0) setStep(prev => prev - 1);
                soundEngine.playSfx('tap');
              }}
              className="p-1.5 rounded-full hover:bg-[#EFE7DA] text-[#534235] transition-colors"
              aria-label="이전 화면"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Official Baekdadam Octagonal Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/assets/aistudio/___________2026-11-05______8.13.37_832fcfdc.png" 
              alt="백다담 로고" 
              className="w-8 h-8 object-contain rounded-md"
            />
            <span className="font-serif font-bold text-base text-[#392B21] tracking-tight">
              백다담 <span className="text-[11px] font-normal text-[#8C3A2B]">白茶談</span>
            </span>
          </div>
        </div>

        {/* Right Action Icons: BGM Mute Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-full border transition-all flex items-center gap-1 text-xs ${
              isMuted 
                ? 'border-[#E0D4C3] bg-white/70 text-[#8C7762]' 
                : 'border-[#556E5C] bg-[#556E5C]/10 text-[#556E5C]'
            }`}
            title={isMuted ? "소리 켜기" : "소리 끄기"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          </button>
        </div>
      </header>

      {/* Main Responsive Wrapper (Max-w-md strictly optimized for mobile phone view) */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between relative overflow-hidden">
        
        {/* ======================================================== */}
        {/* STEP 0: CLEAN & MINIMAL LANDING SCREEN */}
        {/* User requested: Single "티 만들어보기" button, relaxed visual */}
        {/* ======================================================== */}
        {step === 0 && (
          <div className="flex-1 flex flex-col justify-between p-6 fade-in text-center">
            {/* Top Emblem */}
            <div className="flex justify-center pt-4">
              <KoreanFlowerPattern className="w-8 h-8 opacity-75" color="#556E5C" />
            </div>

            {/* Central Hero: Official Logo, Title & Calm Description */}
            <div className="my-auto flex flex-col items-center">
              {/* Baekdadam Octagonal Emblem Box */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-2 border-[#D9CEBF] shadow-md flex items-center justify-center p-3 mb-6 relative">
                <KoreanCornerAccent className="absolute top-1 left-1 w-4 h-4" color="#D4C5B0" />
                <KoreanCornerAccent className="absolute bottom-1 right-1 w-4 h-4 transform rotate-180" color="#D4C5B0" />
                <img 
                  src="/assets/aistudio/___________2026-11-05______8.13.37_832fcfdc.png" 
                  alt="백다담 브랜드 로고" 
                  className="w-full h-full object-contain"
                />
              </div>

              <span className="text-xs font-bold tracking-widest text-[#7A9A8B] uppercase mb-1.5 flex items-center gap-1.5">
                <KoreanKnotPattern className="w-3.5 h-3.5" color="#7A9A8B" />
                BAEKDADAM TEA KITCHEN
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#392B21] tracking-tight leading-snug">
                나만의 한 잔,<br />백다담
              </h1>

              <div className="w-12 h-0.5 bg-[#8C3A2B] my-4 rounded-full" />

              <p className="text-sm text-[#534235]/80 font-serif leading-relaxed max-w-xs">
                동결 농축 차고(茶膏) 한 알로<br />
                직접 완성하는 감성 다도 미니게임
              </p>
            </div>

            {/* Bottom Single CTA: Start Making Tea */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-[#8C7762]">
                <Clock className="w-3.5 h-3.5" />
                <span>체험 소요 시간 약 60초</span>
                <span>•</span>
                <span>무료 시음권 제공</span>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  soundEngine.playBGM();
                  soundEngine.playSfx('tap');
                }}
                className="w-full py-4 rounded-2xl bg-[#534235] hover:bg-[#392B21] active:scale-[0.98] text-[#FAF7F0] font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>티 만들어보기</span>
                <Sparkles className="w-4 h-4 text-[#FAF7F0] group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: COOKING MAMA STYLE MENU SELECTION SCREEN */}
        {/* 4 Drinks with Real Completed Visuals, Difficulty Stars, Taste Description */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between p-5 fade-in overflow-y-auto">
            <div className="mb-3 text-center">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A9A8B] tracking-wider uppercase mb-1">
                <KoreanCloudPattern className="w-4 h-2" color="#7A9A8B" />
                <span>MENU SELECTION</span>
                <KoreanCloudPattern className="w-4 h-2 transform scale-x-[-1]" color="#7A9A8B" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#392B21]">오늘 만들어볼 티를 고르세요</h2>
              <p className="text-xs text-[#534235]/70 mt-0.5">원하는 메뉴를 터치해 직접 제조해보세요.</p>
            </div>

            {/* 4 Dedicated Menu Cards */}
            <div className="space-y-3 flex-1 my-1">
              {MENU_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectMenuAndStart(item)}
                  className="bg-white/85 hover:bg-white rounded-2xl p-3.5 border-2 border-[#E0D4C3] hover:border-[#534235] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group active:scale-[0.99]"
                >
                  {/* Real Completed Drink Visual */}
                  <div className="w-20 h-24 shrink-0 bg-[#FAF7F0] rounded-xl border border-[#E0D4C3] flex items-center justify-center overflow-hidden p-1 shadow-inner">
                    <MenuDrinkCupSVG menu={item} size="sm" isGarnished={true} />
                  </div>

                  {/* Menu Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-base text-[#392B21] font-serif group-hover:text-[#8C3A2B] transition-colors truncate">
                        {item.name}
                      </span>

                      {/* Difficulty with '난이도' text prepended as requested */}
                      <div className="flex items-center gap-0.5 shrink-0 bg-[#EFE7DA] px-2 py-0.5 rounded-full text-[10px] text-[#534235] font-semibold">
                        <span className="text-[10px] text-[#8C7762]">난이도</span>
                        <div className="flex text-[#D99219]">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={i < item.difficulty ? "text-[#D99219]" : "text-[#D9CEBF]"}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#8C7762] font-medium leading-tight">
                      {item.subTitle}
                    </p>

                    <p className="text-xs text-[#534235]/80 mt-1 leading-snug line-clamp-2">
                      {item.tasteDesc}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#556E5C] font-bold bg-[#7A9A8B]/15 px-2 py-0.5 rounded-md">
                        {item.typeName.split(' ')[0]}
                      </span>
                      <span className="text-xs font-bold text-[#8C3A2B] group-hover:underline">
                        만들기 시작 →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-center text-[#8C7762] pt-2">
              체험 후 티 바에서 내가 만든 메뉴를 <strong>직접 무료 시음</strong>하실 수 있습니다.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: INTERACTIVE COOKING MINI-GAME (Cooking Mama Style) */}
        {/* 1. Unwrapping Chago (5 taps) */}
        {/* 2. Timing Aim Drop into cup (PERFECT! / GREAT!) */}
        {/* 3. 5s Dissolve & Custom Ingredients */}
        {/* 4. Speed Stirring Time Attack (Stir stopwatch & ranking) */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between p-5 fade-in text-center relative select-none">
            {/* Top Phase Header (Fixed height h-24 to prevent layout shifts) */}
            <div className="h-24 shrink-0 flex flex-col items-center justify-start">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#556E5C] text-white uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {gamePhase === 'peel' && '1단계: 차고 껍질 벗기기'}
                {gamePhase === 'drop_aim' && '2단계: 타이밍 퐁당 맞추기'}
                {gamePhase === 'dissolve' && '3단계: 5초 차고 용해'}
                {gamePhase === 'ingredients' && `4단계: ${selectedMenu.name} 재료 넣기`}
                {gamePhase === 'stir_speed' && '마무리: 스피드 티스푼 젓기!'}
                {gamePhase === 'done' && '제조 완성!'}
              </span>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#392B21] mt-1.5 h-12 flex items-center justify-center leading-snug">
                {gamePhase === 'peel' && '포장지를 5번 터치해 차고를 꺼내세요!'}
                {gamePhase === 'drop_aim' && '녹색 PERFECT 구간에 맞춰 떨어뜨리세요!'}
                {gamePhase === 'dissolve' && '차고 한 알이 찻잔 속에서 녹아듭니다'}
                {gamePhase === 'ingredients' && (
                  selectedMenu.id === 'pu_erh_latte' ? '연유병을 3초간 꾹 눌러 연유를 넣으세요!' :
                  selectedMenu.id === 'grapefruit_oolong' ? '자몽 과육을 컵 안으로 퐁당 넣으세요!' :
                  selectedMenu.id === 'black_ade' ? '톡톡 터지는 탄산수를 채워주세요!' :
                  '달콤한 각설탕을 컵에 넣어주세요!'
                )}
                {gamePhase === 'stir_speed' && '시계 방향으로 3바퀴 최대한 빨리 저으세요!'}
                {gamePhase === 'done' && '정갈한 한 잔이 완벽하게 빚어졌습니다!'}
              </h2>

              <p className="text-xs text-[#534235]/70 h-4 flex items-center justify-center">
                {gamePhase === 'peel' && `터치 달성도 : ${peelCount} / 5회`}
                {gamePhase === 'drop_aim' && '가운데 정렬될 때 아래 버튼을 누르면 높은 점수!'}
                {gamePhase === 'dissolve' && `동결 농축 큐브가 찻물에 서서히 퍼집니다 (${dissolveTimer}초)`}
                {gamePhase === 'ingredients' && (isPouring ? `⏱️ 붓는 중... (${Math.max(0, 3 - (pourProgress / 100) * 3).toFixed(1)}초)` : '재료를 넣어 완성도를 높입니다')}
                {gamePhase === 'stir_speed' && `⏱️ 스톱워치: ${stirElapsedTime.toFixed(2)}초 (${stirProgress} / 3 바퀴)`}
                {gamePhase === 'done' && `총점: ${totalScore}점 획득!`}
              </p>
            </div>

            {/* Central Interactive Cooking Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full touch-none select-none my-1">
              
              {/* ======================================================== */}
              {/* SUB-PHASE 1: CHAGO PEELING MINI-GAME (5 Taps) */}
              {/* ======================================================== */}
              {gamePhase === 'peel' && (
                <div 
                  onClick={handleTapPeelWrapper}
                  className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
                >
                  <WrappedChagoPacketSVG menu={selectedMenu} peelCount={peelCount} />

                  <div className="mt-4 bg-white/95 px-4 py-1.5 rounded-full border border-[#D4C5B0] shadow-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8C3A2B] animate-ping" />
                    <span className="text-xs font-bold text-[#534235]">
                      포장지를 톡톡 터치하세요 ({peelCount}/5)
                    </span>
                  </div>

                  {/* Progress dots */}
                  <div className="flex gap-1.5 mt-2.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border transition-all ${
                          i < peelCount ? 'bg-[#8C3A2B] border-[#8C3A2B] scale-110' : 'bg-white border-[#D4C5B0]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-PHASE 2: TIMING DROP AIM GAUGE MINI-GAME */}
              {/* ======================================================== */}
              {gamePhase === 'drop_aim' && (
                <div className="flex flex-col items-center w-full">
                  {/* Aim Oscillator Bar */}
                  <div className="w-64 bg-white/90 rounded-full h-7 border-2 border-[#D4C5B0] p-1 relative flex items-center mb-4 shadow-sm overflow-hidden">
                    {/* Zones: Good -> Great -> Perfect (center) -> Great -> Good */}
                    <div className="absolute inset-y-1 left-[25%] right-[25%] bg-[#D99219]/25 rounded-sm" />
                    <div className="absolute inset-y-1 left-[40%] right-[40%] bg-[#556E5C]/35 rounded-sm flex items-center justify-center">
                      <span className="text-[9px] font-bold text-[#556E5C]">PERFECT</span>
                    </div>

                    {/* Oscillating Needle Pointer */}
                    <div 
                      className="absolute top-1 bottom-1 w-3 bg-[#8C3A2B] rounded-full shadow-md transform -translate-x-1/2 transition-all duration-75"
                      style={{ left: `${timingOffset}%` }}
                    />
                  </div>

                  {/* Suspended Authentic Chago Tablet waiting to drop (Brown tablet stamped with Baekdadam logo) */}
                  <div 
                    className={`transition-transform mb-3 ${
                      dropAccuracy ? 'translate-y-24 scale-75 opacity-0 duration-500' : 'animate-bounce'
                    }`}
                  >
                    <BrownChagoTablet size="sm" className="w-16 h-16" />
                  </div>

                  {/* Drop Accuracy Pop-up Banner */}
                  {dropAccuracy && (
                    <div className="absolute z-30 bg-[#392B21] text-white px-5 py-2 rounded-2xl shadow-2xl border-2 border-[#D99219] animate-bounce flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#F4C200] fill-[#F4C200]" />
                      <span className="font-bold text-lg">{dropAccuracy}! +{dropScore}점</span>
                    </div>
                  )}

                  {/* Central Target Cup */}
                  <div ref={cupAreaRef} className="relative z-10">
                    <MenuDrinkCupSVG 
                      menu={selectedMenu} 
                      size="md" 
                      isGarnished={false} 
                      dissolveProgress={0} 
                    />
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-PHASE 3: DISSOLVING & CUSTOM INGREDIENTS */}
              {/* ======================================================== */}
              {(gamePhase === 'dissolve' || gamePhase === 'ingredients') && (
                <div className="flex flex-col items-center relative w-full">
                  {/* Ingredient Interactive Dispenser Button during ingredients phase */}
                  {gamePhase === 'ingredients' && !isIngredientAdded && (
                    <div className="absolute -top-3 z-30 flex flex-col items-center">
                      {selectedMenu.id === 'pu_erh_latte' && (
                        <button
                          onMouseDown={() => setIsPouring(true)}
                          onMouseUp={() => setIsPouring(false)}
                          onTouchStart={() => setIsPouring(true)}
                          onTouchEnd={() => setIsPouring(false)}
                          className="cursor-pointer active:scale-95 transition-transform flex flex-col items-center group touch-none"
                        >
                          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-[#E0D4C3] shadow-md flex items-center justify-center relative overflow-hidden">
                            <div
                              className="absolute inset-0 bg-[#F4B740]/25 transition-all duration-75"
                              style={{ height: `${pourProgress}%`, top: 'auto', bottom: 0 }}
                            />
                            <span className="text-2xl">🍯</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#534235] mt-1.5 bg-white/95 px-3 py-0.5 rounded-full border border-[#D4C5B0]">
                            {isPouring ? `⏱️ 연유 붓는 중...` : '연유병 3초간 꾹 누르기'}
                          </span>
                        </button>
                      )}

                      {selectedMenu.id === 'grapefruit_oolong' && (
                        <button
                          onClick={() => {
                            setIsIngredientAdded(true);
                            soundEngine.playSfx('great');
                            setTimeout(() => {
                              setGamePhase('stir_speed');
                              startStirTimer();
                            }, 500);
                          }}
                          className="cursor-pointer active:scale-95 transition-transform flex flex-col items-center animate-bounce"
                        >
                          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-[#E0D4C3] shadow-md flex items-center justify-center text-3xl">
                            🍊
                          </div>
                          <span className="text-[11px] font-bold text-[#C2382B] mt-1.5 bg-white/95 px-3 py-0.5 rounded-full border border-[#C2382B]/30">
                            자몽 과육 퐁당 넣기 (터치)
                          </span>
                        </button>
                      )}

                      {selectedMenu.id === 'black_ade' && (
                        <button
                          onClick={() => {
                            setIsIngredientAdded(true);
                            soundEngine.playSfx('great');
                            setTimeout(() => {
                              setGamePhase('stir_speed');
                              startStirTimer();
                            }, 500);
                          }}
                          className="cursor-pointer active:scale-95 transition-transform flex flex-col items-center animate-bounce"
                        >
                          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-[#E0D4C3] shadow-md flex items-center justify-center text-3xl">
                            🫧
                          </div>
                          <span className="text-[11px] font-bold text-[#556E5C] mt-1.5 bg-white/95 px-3 py-0.5 rounded-full border border-[#556E5C]/30">
                            탄산수 채우기 (터치)
                          </span>
                        </button>
                      )}

                      {selectedMenu.id === 'oolong_milk' && (
                        <button
                          onClick={() => {
                            setIsIngredientAdded(true);
                            soundEngine.playSfx('great');
                            setTimeout(() => {
                              setGamePhase('stir_speed');
                              startStirTimer();
                            }, 500);
                          }}
                          className="cursor-pointer active:scale-95 transition-transform flex flex-col items-center animate-bounce"
                        >
                          <div className="w-16 h-16 bg-white rounded-2xl border-2 border-[#E0D4C3] shadow-md flex items-center justify-center text-2xl">
                            🧊
                          </div>
                          <span className="text-[11px] font-bold text-[#534235] mt-1.5 bg-white/95 px-3 py-0.5 rounded-full border border-[#D4C5B0]">
                            각설탕 퐁당 넣기 (터치)
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Central Cup with Organic Watercolor Dispersion strictly inside */}
                  <div ref={cupAreaRef} className="relative z-10">
                    <MenuDrinkCupSVG 
                      menu={selectedMenu} 
                      size="md" 
                      isGarnished={isIngredientAdded}
                      isDissolving={gamePhase === 'dissolve'}
                      dissolveProgress={gamePhase === 'dissolve' ? (5 - dissolveTimer) / 5 : 1}
                    />
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-PHASE 4: SPEED STIRRING TIME ATTACK (Who stirs fastest!) */}
              {/* Cup 100% stationary, Teaspoon freely tracks mouse/touch */}
              {/* ======================================================== */}
              {(gamePhase === 'stir_speed' || gamePhase === 'done') && (
                <div className="flex flex-col items-center relative w-full">
                  {/* Central Cup - Fixed, Stationary */}
                  <div ref={cupAreaRef} className="relative z-10 flex flex-col items-center select-none">
                    <MenuDrinkCupSVG 
                      menu={selectedMenu} 
                      size="md" 
                      isGarnished={true}
                      dissolveProgress={1}
                    />

                    {/* Interactive Stirring Overlay */}
                    {gamePhase === 'stir_speed' && (
                      <div
                        className="absolute inset-0 z-30 cursor-crosshair touch-none select-none flex items-center justify-center overflow-visible"
                        onMouseMove={handleStirMove}
                        onTouchMove={handleStirMove}
                        onTouchStart={handleStirStart}
                        onMouseDown={handleStirStart}
                      >
                        {/* Concentric Guide Ring */}
                        <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-dashed border-[#8C3A2B]/45 pointer-events-none flex items-center justify-center animate-pulse">
                          <span className="text-[10px] font-bold text-[#8C3A2B] bg-white/90 px-2.5 py-0.5 rounded-full shadow-xs">
                            ↻ 초고속 3바퀴 회전!
                          </span>
                        </div>

                        {/* Interactive Teaspoon - Only this moves like a mouse cursor */}
                        <div
                          className="absolute top-[46%] left-1/2 pointer-events-none transition-transform duration-75"
                          style={{
                            transform: `translate(calc(-50% + ${spoonPos.x}px), calc(-50% + ${spoonPos.y - 36}px)) rotate(${spoonPos.x * 0.4}deg)`,
                            filter: 'drop-shadow(2px 6px 8px rgba(83, 66, 53, 0.35))'
                          }}
                        >
                          <TeaSpoonSVG className="w-10 h-44" />
                        </div>

                        {/* Speed Stopwatch Badge */}
                        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
                          <div className="bg-[#392B21]/90 backdrop-blur-sm text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/20">
                            <Clock className="w-3.5 h-3.5 text-[#F4C200] animate-spin" />
                            <span>기록: {stirElapsedTime.toFixed(2)}초</span>
                            <span className="text-[#E8DEC8]">({stirProgress} / 3 바퀴)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls Bar (Fixed height h-14 to prevent vertical shift) */}
            <div className="w-full h-14 shrink-0 flex items-center justify-center">
              {gamePhase === 'drop_aim' && !dropAccuracy && (
                <button
                  onClick={handleTriggerDrop}
                  className="w-full py-3.5 rounded-2xl bg-[#8C3A2B] hover:bg-[#6E2B1E] text-white font-bold text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4 text-[#F4C200]" />
                  <span>지금 퐁당 떨어뜨리기!</span>
                </button>
              )}

              {gamePhase === 'dissolve' && (
                <div className="w-full bg-[#EFE7DA] rounded-full h-3 overflow-hidden p-0.5 border border-[#E0D4C3]">
                  <div
                    className="h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ 
                      width: `${((5 - dissolveTimer) / 5) * 100}%`,
                      backgroundColor: selectedMenu.dissolveColor
                    }}
                  />
                </div>
              )}

              {gamePhase === 'ingredients' && (
                <button
                  onClick={() => {
                    setIsIngredientAdded(true);
                    setPourProgress(100);
                    soundEngine.playSfx('great');
                    setTimeout(() => {
                      setGamePhase('stir_speed');
                      startStirTimer();
                    }, 400);
                  }}
                  className="text-xs text-[#534235]/70 underline py-1 hover:text-[#534235]"
                >
                  원터치로 바로 재료 넣기 완료
                </button>
              )}

              {gamePhase === 'stir_speed' && (
                <button
                  onClick={() => {
                    const next = stirProgress + 1;
                    setStirProgress(next);
                    if (next >= 3) {
                      setIsStirTimerRunning(false);
                      setStirElapsedTime(2.1);
                      soundEngine.playSfx('complete');
                      setTotalScore(950);
                      setTimeout(() => setGamePhase('done'), 400);
                    }
                  }}
                  className="text-xs text-[#534235]/70 underline py-1 hover:text-[#534235]"
                >
                  터치로 1회씩 젓기 ({stirProgress}/3)
                </button>
              )}

              {gamePhase === 'done' && (
                <button
                  onClick={() => {
                    setStep(3);
                    soundEngine.playSfx('tap');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#556E5C] hover:bg-[#556E5C]/90 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 animate-bounce"
                >
                  <span>나만의 티 레시피 카드 확인</span>
                  <Sparkles className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: RECIPE CARD, TEA FORTUNE, MBTI TYPE DEEP DIVE */}
        {/* User requested: Mobile photo save fix, Random tea fortune, MBTI deep dive */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between p-4 fade-in overflow-y-auto space-y-4">
            
            {/* Top Score & Honor Ranking Banner */}
            <div className="bg-gradient-to-r from-[#534235] to-[#392B21] text-white rounded-2xl p-4 shadow-md flex items-center justify-between border border-[#8C7762]/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F4C200]/20 border border-[#F4C200]/40 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#F4C200] uppercase tracking-wider">POP-UP RANK #1</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">수석 다도사</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">다도 스코어 {totalScore}점</h3>
                  <p className="text-[11px] text-[#EFE7DA]/75">스피드 젓기 기록: {stirElapsedTime.toFixed(2)}초</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#EFE7DA]/80">난이도</span>
                <div className="text-[#F4C200] text-sm">
                  {Array.from({ length: selectedMenu.difficulty }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            </div>

            {/* The Main Recipe Card Display */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#D9CEBF] shadow-sm relative overflow-hidden">
              <KoreanCornerAccent className="absolute top-2 left-2 w-4 h-4" color="#D4C5B0" />
              <KoreanCornerAccent className="absolute top-2 right-2 w-4 h-4 transform rotate-90" color="#D4C5B0" />
              <KoreanCornerAccent className="absolute bottom-2 left-2 w-4 h-4 transform -rotate-90" color="#D4C5B0" />
              <KoreanCornerAccent className="absolute bottom-2 right-2 w-4 h-4 transform rotate-180" color="#D4C5B0" />

              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#8C3A2B] font-serif font-bold">
                  <KoreanFlowerPattern className="w-3.5 h-3.5" color="#8C3A2B" />
                  <span>백다담 팝업 시그니처 레시피</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#392B21] mt-0.5">{selectedMenu.name}</h2>
                <p className="text-xs text-[#7A9A8B] font-bold mt-0.5">{selectedMenu.typeName}</p>
              </div>

              {/* Real Completed Drink Visual */}
              <div className="flex justify-center py-2">
                <MenuDrinkCupSVG menu={selectedMenu} size="md" isGarnished={true} />
              </div>

              {/* Recipe Ingredients Pill Tags */}
              <div className="flex flex-wrap justify-center gap-1.5 my-3">
                {selectedMenu.recipeIngredients.map((ing, idx) => (
                  <span key={idx} className="bg-[#FAF7F0] border border-[#E0D4C3] text-[11px] text-[#534235] px-2.5 py-1 rounded-full font-medium">
                    {ing}
                  </span>
                ))}
              </div>

              <p className="text-xs text-[#534235] font-serif italic text-center leading-relaxed bg-[#FAF7F0] p-3 rounded-xl border border-[#E0D4C3]/60">
                "{selectedMenu.tasteDesc}"
              </p>
            </div>

            {/* ======================================================== */}
            {/* 팝업 다도 체험 결과 정리: 1. 최종 점수, 2. 선택한 음료, 3. 000type */}
            {/* Firebase Firestore에 안전하게 자동 저장 */}
            {/* ======================================================== */}
            <div className="bg-white rounded-3xl p-4.5 border-2 border-[#D9CEBF] shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E0D4C3] pb-2.5">
                <div className="flex items-center gap-1.5">
                  <KoreanFlowerPattern className="w-4 h-4" color="#8C3A2B" />
                  <h3 className="font-serif font-bold text-base text-[#392B21]">체험 결과 요약</h3>
                </div>
                <span className="text-[10px] font-bold text-[#556E5C] bg-[#556E5C]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3 text-[#556E5C]" />
                  <span>Firestore 저장</span>
                </span>
              </div>

              {/* 1. 최종 점수 */}
              <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#E0D4C3]/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8C7762] block">① 최종 점수</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-[#8C3A2B]">{totalScore}</span>
                    <span className="text-xs font-bold text-[#8C3A2B]">점</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#534235] space-y-0.5">
                  <span className="block font-bold">낙하 판정: {dropAccuracy || 'PERFECT'} (+{dropScore}점)</span>
                  <span className="text-[#8C7762] block">스피드 젓기: {stirElapsedTime.toFixed(2)}초</span>
                </div>
              </div>

              {/* 2. 선택한 음료 */}
              <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#E0D4C3]/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8C7762]">② 선택한 음료</span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                    style={{ backgroundColor: selectedMenu.pointColor }}
                  >
                    {selectedMenu.chagoName}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#392B21]">{selectedMenu.name}</h4>
                <p className="text-[11px] text-[#534235]/85">
                  <strong className="text-[#8C7762]">재료:</strong> {selectedMenu.recipeIngredients.join(' + ')}
                </p>
                <p className="text-[11px] text-[#8C7762] italic">
                  "{selectedMenu.tasteDesc}"
                </p>
              </div>

              {/* 3. 000type 성향 분석 */}
              <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-[#E0D4C3]/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8C7762]">③ 나의 다도 성향 (000type)</span>
                  <span className="text-[10px] font-bold text-[#556E5C] bg-[#556E5C]/10 px-2 py-0.5 rounded">
                    성향 분석 완료
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#556E5C]">{selectedMenu.typeName}</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedMenu.typeKeywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-white border border-[#D4C5B0] text-[#8C3A2B] px-2 py-0.5 rounded-full font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#534235]/90 leading-relaxed pt-0.5 line-clamp-3">
                  {selectedMenu.mbtiDesc}
                </p>
              </div>

              {/* Firebase Firestore Realtime Save Confirmation Badge */}
              <div className="bg-[#556E5C]/10 border border-[#556E5C]/25 rounded-2xl p-2.5 flex items-center justify-between text-xs text-[#556E5C]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#556E5C] shrink-0" />
                  <div>
                    <span className="font-bold block text-[11px]">Firebase Firestore 저장 완료</span>
                    <span className="text-[10px] text-[#556E5C]/85">
                      {firestoreDocId 
                        ? `클라우드 기록 완료 (문서 ID: ${firestoreDocId.slice(0, 10)}...)` 
                        : isSavingFirestore 
                          ? '결과를 Firestore에 저장하는 중...' 
                          : '팝업스토어 데이터베이스에 정상 기록되었습니다.'}
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#556E5C] shrink-0" />
              </div>
            </div>

            {/* Save Image Action Button (Mobile Fix Included) */}
            <button
              onClick={handleGenerateRecipeImage}
              className="w-full py-3.5 rounded-2xl bg-[#534235] hover:bg-[#392B21] text-[#FAF7F0] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>나만의 차 레시피 사진 저장하기</span>
            </button>

            {/* Random Korean Tea Fortune (오늘의 운세) */}
            <div className="bg-[#FAF7F0] rounded-2xl p-4 border border-[#E0D4C3] shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🍵</span>
                <div>
                  <span className="text-[10px] font-bold text-[#8C3A2B] uppercase">TODAY'S TEA FORTUNE</span>
                  <h4 className="font-serif font-bold text-sm text-[#392B21]">
                    오늘의 찻잔 운세: {TEA_FORTUNES[fortuneIndex].title}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-[#534235] leading-relaxed font-serif pl-7">
                "{TEA_FORTUNES[fortuneIndex].fortune}"
              </p>
              <div className="flex gap-4 mt-3 pl-7 text-[11px] text-[#8C7762]">
                <span>🍀 행운의 색: <strong>{TEA_FORTUNES[fortuneIndex].luckyColor}</strong></span>
                <span>⏰ 행운의 다도 시간: <strong>{TEA_FORTUNES[fortuneIndex].luckyHour}</strong></span>
              </div>
            </div>

            {/* Detailed MBTI Personality Diagnosis Section */}
            <div className="bg-white rounded-2xl p-4 border border-[#E0D4C3] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E0D4C3]/60 pb-2">
                <span className="font-serif font-bold text-sm text-[#392B21]">
                  다도 심리 유형: {selectedMenu.typeName}
                </span>
                <span className="text-[10px] text-[#556E5C] font-bold bg-[#7A9A8B]/15 px-2 py-0.5 rounded-md">
                  성향 심층 분석
                </span>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1">
                {selectedMenu.typeKeywords.map((kw, i) => (
                  <span key={i} className="text-[11px] text-[#8C3A2B] bg-[#8C3A2B]/10 px-2 py-0.5 rounded-md font-medium">
                    {kw}
                  </span>
                ))}
              </div>

              {/* Deep personality breakdown */}
              <p className="text-xs text-[#534235] leading-relaxed">
                {selectedMenu.mbtiDesc}
              </p>

              {/* Desk Wellness Lifestyle Tip */}
              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E0D4C3]/80 text-xs">
                <strong className="text-[#556E5C] block mb-1">🌿 데스크 웰니스 힐링 팁</strong>
                <p className="text-[#534235]/90 leading-relaxed">{selectedMenu.deskWellnessTip}</p>
              </div>

              {/* Match chemistry */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E0D4C3]/60">
                  <span className="text-[#8C7762] block">✨ 환상의 짝꿍 티</span>
                  <span className="font-bold text-[#392B21] mt-0.5 block">{selectedMenu.bestMatch}</span>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E0D4C3]/60">
                  <span className="text-[#8C7762] block">⏰ 골든 다도 타임</span>
                  <span className="font-bold text-[#392B21] mt-0.5 block">{selectedMenu.goldenHour}</span>
                </div>
              </div>
            </div>

            {/* CTA to Step 4: Real Tasting Voucher (User requested: only '실제 음료 시음해보기', no survey) */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setStep(4);
                  soundEngine.playSfx('tap');
                }}
                className="w-full py-4 rounded-2xl bg-[#556E5C] hover:bg-[#455B4C] active:scale-[0.98] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>실제 음료 시음해보기</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: REAL BEVERAGE TASTING VOUCHER (실제 음료 시음 교환권) */}
        {/* User requested: Only '실제 음료 시음해보기', survey questionnaire removed */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-between p-5 fade-in overflow-y-auto">
            <div className="space-y-4">
              {/* Top Banner */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C3A2B] uppercase tracking-wider mb-1">
                  <KoreanFlowerPattern className="w-3.5 h-3.5" color="#8C3A2B" />
                  <span>백다담 팝업스토어 티 바(Tea Bar)</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#392B21]">
                  실제 음료 시음 교환권
                </h2>
                <p className="text-xs text-[#534235]/75 mt-1 max-w-xs mx-auto">
                  바리스타에게 이 화면을 보여주시면 방금 직접 만드신 레시피의 음료를 즉석에서 정성껏 제공해 드립니다.
                </p>
              </div>

              {/* Traditional Korean Tasting Voucher Card */}
              <div className="bg-white rounded-3xl p-5 border-2 border-[#D9CEBF] shadow-lg relative overflow-hidden">
                <KoreanCornerAccent className="absolute top-2 left-2 w-4 h-4" color="#D4C5B0" />
                <KoreanCornerAccent className="absolute top-2 right-2 w-4 h-4 transform rotate-90" color="#D4C5B0" />
                <KoreanCornerAccent className="absolute bottom-2 left-2 w-4 h-4 transform -rotate-90" color="#D4C5B0" />
                <KoreanCornerAccent className="absolute bottom-2 right-2 w-4 h-4 transform rotate-180" color="#D4C5B0" />

                {/* Stamped Red Seal Overlay when Redeemed */}
                {isRedeemed && (
                  <div className="absolute inset-0 z-30 bg-white/40 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-36 rounded-full border-4 border-[#8C3A2B] text-[#8C3A2B] flex flex-col items-center justify-center p-2 transform -rotate-12 animate-in zoom-in-75 shadow-xl bg-white/95">
                      <span className="text-[11px] font-serif font-bold tracking-widest text-[#8C3A2B]">白茶談</span>
                      <div className="w-16 h-0.5 bg-[#8C3A2B] my-0.5" />
                      <span className="text-sm font-bold tracking-wider">시음 교환 완료</span>
                      <span className="text-[10px] text-[#8C3A2B]/85 mt-0.5">{redeemedTime || '확인 완료'}</span>
                    </div>
                  </div>
                )}

                {/* Voucher Header Bar */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-[#E0D4C3] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/assets/aistudio/___________2026-11-05______8.13.37_832fcfdc.png" 
                      alt="백다담 로고" 
                      className="w-7 h-7 object-contain"
                    />
                    <div>
                      <span className="text-xs font-serif font-bold text-[#392B21] block">백다담 티 바</span>
                      <span className="text-[10px] text-[#8C7762]">1회 무료 시음권</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#8C7762] block">교환 번호</span>
                    <span className="font-mono font-bold text-sm text-[#8C3A2B]">{voucherCode}</span>
                  </div>
                </div>

                {/* Beverage Visual & Name */}
                <div className="flex items-center gap-3.5 my-2">
                  <div className="w-20 h-26 bg-[#FAF7F0] rounded-2xl border border-[#E0D4C3] flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-1">
                    <MenuDrinkCupSVG menu={selectedMenu} size="sm" isGarnished={true} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white inline-block mb-1 shadow-xs"
                      style={{ backgroundColor: selectedMenu.pointColor }}
                    >
                      {selectedMenu.chagoName}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#392B21] truncate">
                      {selectedMenu.name}
                    </h3>
                    <p className="text-[11px] text-[#534235]/75 mt-0.5 leading-snug">
                      조합: {selectedMenu.recipeIngredients.join(' + ')}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#D99219] mt-1">
                      <span>난이도</span>
                      {Array.from({ length: selectedMenu.difficulty }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Taste Note Quote */}
                <p className="text-xs text-[#534235] font-serif italic text-center leading-relaxed bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E0D4C3]/70 my-3">
                  "{selectedMenu.tasteDesc}"
                </p>

                {/* Visitor Score & Type Recap Tag */}
                <div className="bg-[#FAF7F0] rounded-xl px-3 py-2 border border-[#E0D4C3] flex items-center justify-between text-[11px] mb-3">
                  <span className="font-bold text-[#8C3A2B]">다도 점수: {totalScore}점</span>
                  <span className="text-[#556E5C] font-bold">{selectedMenu.typeName.split('(')[0].trim()}</span>
                  <span className="text-[10px] text-[#8C7762]">Firestore 연동</span>
                </div>

                {/* Barista Stamp Action */}
                <div className="border-t-2 border-dashed border-[#E0D4C3] pt-3 text-center">
                  {!isRedeemed ? (
                    <button
                      onClick={handleRedeemVoucher}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-[#8C3A2B] bg-[#8C3A2B]/10 hover:bg-[#8C3A2B]/20 active:scale-98 text-[#8C3A2B] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>바리스타 확인 (터치하여 시음 도장 찍기)</span>
                    </button>
                  ) : (
                    <div className="py-2 text-center text-xs text-[#556E5C] font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#556E5C]" />
                      <span>시음 음료가 정상적으로 교환되었습니다.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Friendly Visitor Guidance */}
              <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#E0D4C3] text-xs space-y-1.5 text-[#534235]">
                <strong className="text-[#556E5C] flex items-center gap-1">
                  <span>☕</span>
                  <span>팝업스토어 시음 가이드</span>
                </strong>
                <p className="text-[11px] leading-relaxed text-[#534235]/85">
                  1. 티 바 카운터에 위 교환권을 제시해 주세요.<br />
                  2. 백다담 바리스타가 엄선된 차고로 즉석에서 시음 티를 제공합니다.<br />
                  3. 시음 후 나만의 차 레시피 카드를 인스타그램에 공유해보세요!
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-4">
              <button
                onClick={() => {
                  setStep(1);
                  soundEngine.playSfx('tap');
                }}
                className="w-full py-4 rounded-2xl bg-[#556E5C] hover:bg-[#455B4C] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>다른 음료도 만들어보기</span>
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setStep(3);
                  soundEngine.playSfx('tap');
                }}
                className="w-full py-3 rounded-2xl bg-white border border-[#D9CEBF] text-[#534235] font-bold text-xs hover:bg-[#FAF7F0] transition-colors"
              >
                ← 레시피 카드 다시 보기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MOBILE IMAGE PREVIEW & SAVE MODAL */}
      {/* Provides foolproof long-press save for mobile Safari/Chrome */}
      {/* ======================================================== */}
      {showImageModal && generatedCardUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 fade-in select-auto">
          <div className="bg-[#FAF7F0] w-full max-w-sm rounded-3xl p-4 border-2 border-[#D9CEBF] shadow-2xl flex flex-col items-center relative max-h-[92vh] overflow-y-auto select-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-[#392B21] shadow-xs cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-[#8C3A2B] font-serif mb-1">
              백다담 티 레시피 카드
            </span>

            {/* Direct Image Element (WebkitTouchCallout: 'default' enables iOS long-press save menu) */}
            <div className="w-full rounded-2xl overflow-hidden border border-[#D9CEBF] shadow-md my-2 bg-white flex justify-center select-auto">
              <img 
                src={generatedCardUrl} 
                alt="백다담 나만의 차 레시피 카드" 
                className="w-full h-auto object-contain cursor-pointer select-auto"
                style={{ 
                  WebkitTouchCallout: 'default',
                  userSelect: 'auto',
                  WebkitUserSelect: 'auto'
                }}
              />
            </div>

            {/* Mobile Long Press & Share Notice */}
            <div className="bg-[#556E5C]/10 rounded-xl p-3 text-center my-2 border border-[#556E5C]/25 w-full space-y-1">
              <p className="text-xs font-bold text-[#556E5C] flex items-center justify-center gap-1">
                <span>📱 스마트폰 사진 저장 방법</span>
              </p>
              <p className="text-[11px] text-[#534235] leading-snug">
                아래 <strong>[사진첩에 저장]</strong> 버튼을 누르거나, 위 레시피 카드를 <strong>1초간 꾹 눌러 [사진에 저장]</strong>을 선택하세요.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 mt-1">
              <button
                onClick={handleDownloadImage}
                className="w-full py-3.5 rounded-xl bg-[#556E5C] hover:bg-[#455B4C] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>스마트폰 사진첩에 저장 / 공유</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `백다담_나만의레시피_${selectedMenu.name}.png`;
                    link.href = generatedCardUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="py-2.5 rounded-xl bg-white border border-[#D9CEBF] text-[#534235] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FAF7F0] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>파일 다운로드</span>
                </button>

                <button
                  onClick={() => setShowImageModal(false)}
                  className="py-2.5 rounded-xl bg-[#FAF7F0] border border-[#D9CEBF] text-[#8C7762] font-bold text-xs hover:bg-[#EFE7DA] cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding Info */}
      <footer className="w-full max-w-md mx-auto py-2.5 px-4 text-center border-t border-[#E0D4C3]/60 bg-[#FAF7F0]/60">
        <p className="text-[10px] text-[#8C7762] font-serif">
          백다담(白茶談) 팝업스토어 • 대한민국 전통 차의 현대적 경험
        </p>
      </footer>
    </div>
  );
}
