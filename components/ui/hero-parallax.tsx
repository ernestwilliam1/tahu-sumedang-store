"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export const HeroStaticCollage = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);

  return (
    <div className="relative bg-[#FAF9F6] overflow-x-clip">
      {/* pt cukup, pb ekstra biar baris bawah ga kepotong sebelum katalog */}
      <div className="relative min-h-[88vh] pt-20 pb-28 sm:pb-32 overflow-visible flex flex-col justify-center [perspective:1000px] [transform-style:preserve-3d]">
        {/* Static tilted collage — fully visible, no clipping */}
        <div className="absolute inset-0 opacity-[0.42] pointer-events-none overflow-visible [perspective:1000px] [transform-style:preserve-3d]" aria-hidden>
          <div className="absolute inset-0 flex flex-col justify-center gap-6 sm:gap-8 origin-center [transform:rotate(-7deg)_scale(1.02)] translate-y-[-2%]">
            <div className="flex flex-row-reverse space-x-reverse space-x-6 sm:space-x-8">
              {firstRow.map((product) => (
                <StaticProductCard product={product} key={product.title} />
              ))}
            </div>
            <div className="flex flex-row space-x-6 sm:space-x-8">
              {secondRow.map((product) => (
                <StaticProductCard product={product} key={product.title} />
              ))}
            </div>
            <div className="hidden md:flex flex-row-reverse space-x-reverse space-x-6 sm:space-x-8">
              {thirdRow.map((product) => (
                <StaticProductCard product={product} key={product.title} />
              ))}
            </div>
          </div>
        </div>

        {/* Natural integration: soft radial vignette behind LEFT text area only — no rectangular box, no bottom cutoff */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 68% 62% at 22% 52%, rgba(250,249,246,0.94) 0%, rgba(250,249,246,0.82) 26%, rgba(250,249,246,0.46) 48%, rgba(250,249,246,0.14) 62%, transparent 74%)",
          }}
          aria-hidden
        />
        {/* ultra-subtle warm glow to lift text without blocking collage */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(217,119,6,0.06),_transparent_55%)]" aria-hidden />

        <Header />
      </div>
    </div>
  );
};

// Compat alias — StoreClient imports HeroParallax
export const HeroParallax = HeroStaticCollage;

export const Header = () => {
  return (
    <div className="max-w-7xl relative z-10 mx-auto py-20 px-4 sm:px-6 w-full">
      <div className="max-w-3xl text-left">
        <h1
          className="text-4xl md:text-7xl font-bold text-[#1C1917] tracking-tight leading-[0.95]"
          style={{ textShadow: "0 1px 0 rgba(250,249,246,0.95), 0 8px 24px rgba(250,249,246,0.9), 0 2px 12px rgba(28,25,23,0.08)" }}
        >
          Pusat Tahu Sumedang <br /> <span className="text-[#D97706]" style={{ textShadow: "0 1px 10px rgba(250,249,246,0.85)" }}>Legendaris & Autentik</span>
        </h1>
        <p
          className="max-w-2xl text-base md:text-xl mt-6 text-[#44403C] leading-relaxed"
          style={{ textShadow: "0 1px 0 rgba(250,249,246,0.9), 0 6px 20px rgba(250,249,246,0.85)" }}
        >
          Nikmati kelezatan tahu renyah berkualitas tinggi langsung dari produsen terpercaya dengan standar kebersihan terbaik. Digoreng dadakan, disajikan hangat.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-start">
          <button
            onClick={() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-7 py-3.5 rounded-full bg-[#D97706] text-white text-sm font-bold shadow-[0_8px_20px_rgba(217,119,6,0.28)] hover:bg-[#B45309] transition active:scale-[0.98] inline-flex items-center gap-1.5"
          >
            Jelajahi Menu <span aria-hidden>↓</span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white border border-[#E5E2DC] text-sm font-semibold text-[#57534E] shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" strokeWidth="1.2" aria-hidden="true" className="shrink-0">
              <path d="M12 2.75l2.47 5.01 5.53.8-4 3.9.94 5.49L12 15.9l-4.94 2.6.94-5.49-4-3.9 5.53-.8L12 2.75z" />
            </svg>
            4.9 · 2.400+ porsi/bulan
          </span>
        </div>
      </div>
    </div>
  );
};

export const StaticProductCard = ({
  product,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
}) => {
  return (
    <div className="h-72 w-[24rem] relative flex-shrink-0 rounded-xl overflow-hidden border border-[#E5E2DC] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(28,25,23,0.06),0_12px_28px_rgba(28,25,23,0.10)]">
      <Link href={product.link} className="block w-full h-full">
        <Image
          src={product.thumbnail}
          height={600}
          width={600}
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
          unoptimized
        />
      </Link>
    </div>
  );
};

export const ProductCard = StaticProductCard;
